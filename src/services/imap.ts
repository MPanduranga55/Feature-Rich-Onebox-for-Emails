import Imap from 'node-imap';
import { getPlainTextBody } from '../utils/parse';
import { config } from '../config/env';
import { indexEmail } from '../db/es';
import { EmailDocument } from '../types/email';
import { categorizeAndIntegrate } from './ai';

interface AccountConfig {
    host: string;
    port: number;
    username: string;
    password: string;
}


function fetchAndProcessEmail(imap: Imap, uid: number, accountId: string, folder: string) {
    const f = imap.fetch([uid], {
        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'], 
        struct: true,
        markSeen: false
    });

    f.on('message', (msg) => {
        let emailHeader: any = {};
        let emailBody: string = '';
        msg.on('body', (stream, info) => {
            let buffer = '';
            stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
            });
            stream.once('end', () => {
                if (info.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)') {
                    emailHeader = Imap.parseHeader(buffer);
                } else if (info.which === 'TEXT') {
                    emailBody = getPlainTextBody(buffer);
                }
            });
        });

        msg.once('attributes', (attrs) => {
            
            
            const subject = emailHeader.subject ? emailHeader.subject[0] : '(No Subject)';
            const from = emailHeader.from ? emailHeader.from[0] : 'unknown@sender.com';
            const to = emailHeader.to || [];
            const date = emailHeader.date ? new Date(emailHeader.date[0]) : new Date();

            const emailDocument: EmailDocument = {
                id: `${accountId}-${attrs.uid}`, 
                accountId: accountId,
                folder: folder,
                subject: subject,
                body: emailBody,
                from: from,
                to: to,
                date: date,
                aiCategory: 'Uncategorized', 
                indexedAt: new Date(),
            };
            
         
            indexEmail(emailDocument);
            
            
            categorizeAndIntegrate(emailDocument);
        });
    });
    
    f.once('error', (err) => {
        console.error(`[IMAP:${accountId}] Fetch error for UID ${uid}:`, err);
    });
}



function connectAndSync(account: AccountConfig, id: string) {
    const accountId = account.username;
    const imap = new Imap({
        user: account.username,
        password: account.password,
        host: account.host,
        port: account.port,
        tls: true,
    });

    imap.once('ready', () => {
        console.log(`[IMAP:${accountId}] Connection successful. Opening INBOX...`);
        
        imap.openBox('INBOX', false, (err, box) => {
            if (err) {
                console.error(`[IMAP:${accountId}] Error opening INBOX:`, err);
                return;
            }
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            imap.search(['ALL', ['SINCE', thirtyDaysAgo]], (err, uids) => {
                if (err) {
                    console.error(`[IMAP:${accountId}] Initial search error:`, err);
                    return startIdle(); 
                }
                
                if (uids.length > 0) {
                    console.log(`[IMAP:${accountId}] Found ${uids.length} emails for initial sync.`);
                    const uidsToProcess = uids.slice(-30); 
                    uidsToProcess.forEach(uid => {
                        fetchAndProcessEmail(imap, uid, accountId, 'INBOX');
                    });
                }
                startIdle();
            });
        });
    });
    function startIdle() {
        console.log(`[IMAP:${accountId}] Entering IDLE mode...`);
        imap.idle();
    }
    imap.on('mail', () => {
        console.log(`[IMAP:${accountId}] New mail detected! Stopping IDLE to process...`);
        imap.endIdle(() => {
            imap.search(['UNSEEN'], (err, uids) => {
                if (err || uids.length === 0) {
                    return startIdle(); 
                }
                
                const newUid = uids[uids.length - 1]; 
                fetchAndProcessEmail(imap, newUid, accountId, 'INBOX');
                startIdle();
            });
        });
    });

    setInterval(() => {
        if (imap.state === 'authenticated') {
            console.log(`[IMAP:${accountId}] Watchdog: Re-IDLING to keep session alive.`);
            imap.endIdle(() => {
                startIdle();
            });
        }
    }, 29 * 60 * 1000); 

    
    imap.once('error', (err) => {
        console.error(`[IMAP:${accountId}] Connection Error:`, err.message);
    });

    imap.once('end', () => {
        console.log(`[IMAP:${accountId}] Connection ended. Attempting reconnect...`);
        setTimeout(() => connectAndSync(account, id), 5000); 
    });
    
    imap.connect();
}

export function startImapSync() {
    console.log('[IMAP] Starting synchronization for all configured accounts...');
    if (config.imapAccount1.username) {
        connectAndSync(config.imapAccount1, 'Account 1');
    } else {
        console.warn('[IMAP] Account 1 credentials missing. Skipping.');
    }

    if (config.imapAccount2.username) {
        connectAndSync(config.imapAccount2, 'Account 2');
    } else {
        console.warn('[IMAP] Account 2 credentials missing. Skipping.');
    }
}