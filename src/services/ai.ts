import { EmailDocument, AiCategory } from '../types/email';
import { indexEmail } from '../db/es';
import { triggerIntegrations } from './webhook';
import { config } from '../config/env';

const CATEGORIES: AiCategory[] = ['Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office'];

async function getAiCategory(emailText: string): Promise<AiCategory> {
    const text = emailText.toLowerCase();

    if (text.includes('book a meeting') || text.includes('schedule time')) {
        return 'Meeting Booked';
    }
    if (text.includes('i am interested') || text.includes('tell me more')) {
        return 'Interested';
    }
    if (text.includes('out of office') || text.includes('vacation')) {
        return 'Out of Office';
    }
    if (text.includes('unsubscribe') || text.includes('spam')) {
        return 'Spam';
    }
    
    
    const randomIndex = Math.floor(Math.random() * CATEGORIES.length);
    return CATEGORIES[randomIndex];
}


export async function categorizeAndIntegrate(email: EmailDocument) {
    try {
        console.log(`[AI] Starting categorization for: ${email.subject}`);
        const newCategory = await getAiCategory(email.body);
        email.aiCategory = newCategory;
        await indexEmail(email); 
        console.log(`[AI] Categorized '${email.subject}' as: ${newCategory}.`);
        if (newCategory === 'Interested') {
            await triggerIntegrations(email);
        }

    } catch (error) {
        console.error('[AI] Error during categorization:', error);
    }
}