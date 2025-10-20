const MOCK_VECTOR_DB_CONTEXT = [
    "I am applying for a job position. If the lead is interested, share the meeting booking link: https://cal.com/example",
    "Our product is a real-time email onebox aggregator using IMAP IDLE. This feature makes us unique.",
    "Our pricing starts at $49/month for small businesses.",
];

async function retrieveContext(incomingEmailText: string): Promise<string[]> {
    console.log('[RAG] Simulating vector search for relevant context...');
    if (incomingEmailText.toLowerCase().includes('technical interview')) {
        return [MOCK_VECTOR_DB_CONTEXT[0]]; 
    }
    return [MOCK_VECTOR_DB_CONTEXT[1], MOCK_VECTOR_DB_CONTEXT[2]]; 
}

async function generateReply(originalEmail: string, contextChunks: string[]): Promise<string> {
    const context = contextChunks.join('\n---\n');
    
    const systemInstruction = "You are a professional, helpful assistant. Draft a concise, professional email reply based ONLY on the context provided and the original email. Use provided links.";
    
    const prompt = `${systemInstruction}\n\n--- CONTEXT --- \n${context}\n\n--- ORIGINAL EMAIL ---\n${originalEmail}`;
    if (contextChunks.includes(MOCK_VECTOR_DB_CONTEXT[0])) {
        return "Thank you for shortlisting my profile! I'm available for a technical interview. You can book a slot here: https://cal.com/example";
    }
    
    return "Thank you for your question. Our product uses a unique real-time email syncing feature via IMAP IDLE. This capability ensures your onebox is always up-to-date.";
}


export async function suggestReply(incomingEmailText: string): Promise<string> {
    try {
        const contextChunks = await retrieveContext(incomingEmailText);
        const suggestedReply = await generateReply(incomingEmailText, contextChunks);
        
        return suggestedReply;
    } catch (error) {
        console.error('[RAG] Error in the RAG pipeline:', error);
        return 'Sorry, I failed to generate a reply suggestion.';
    }
}