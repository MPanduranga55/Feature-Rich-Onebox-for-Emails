import express from 'express';
import cors from 'cors';
import { mainRouter } from './routes';
import { startImapSync } from './services/imap';
import { initializeElasticsearch } from './db/es';
const app = express();
app.use(cors()); 
app.use(express.json());
app.use('/api', mainRouter); 
async function initializeAppServices() {
    console.log('[INIT] Initializing Backend Services...');
    // await initializeElasticsearch();
    startImapSync(); 
    
    console.log('[INIT] All services initialized successfully.');
}

export { app, initializeAppServices };