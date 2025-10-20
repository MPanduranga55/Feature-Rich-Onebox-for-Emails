// src/routes/email.ts

import { Router } from 'express';
import { searchEmailsController, suggestReplyController } from '../controllers/email';

const emailRouter = Router();

emailRouter.get('/search', searchEmailsController);

emailRouter.post('/:id/suggest-reply', suggestReplyController);


export { emailRouter };