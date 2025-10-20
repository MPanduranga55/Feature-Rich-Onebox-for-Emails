import { Request, Response } from 'express';
import { searchEmails } from '../db/es';
import { suggestReply } from '../services/rag'; 

export async function searchEmailsController(req: Request, res: Response) {
  try {
    const { q, account, folder } = req.query; 
    
    const emails = await searchEmails(
        q as string || '', 
        account as string,
        folder as string
    );
    
    res.status(200).json({
        count: emails.length,
        data: emails
    });
    
  } catch (error) {
    console.error('Controller Error in searchEmailsController:', error);
    res.status(500).json({ message: 'Failed to perform email search.' });
  }
}

export async function suggestReplyController(req: Request, res: Response) {
    const { emailText } = req.body; 
    try {
        if (!emailText) {
            return res.status(400).json({ message: 'Email content is required to generate a reply.' });
        }

        const suggestedReply = await suggestReply(emailText);
        
        res.status(200).json({
            suggestion: suggestedReply,
        });

    } catch (error) {
        console.error('Controller Error in suggestReplyController:', error);
        res.status(500).json({ message: 'Failed to generate suggested reply.' });
    }
}