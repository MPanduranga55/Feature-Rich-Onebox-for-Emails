import { Router } from 'express';
import { emailRouter } from './email';
import { config } from '../config/env';

const mainRouter = Router();

mainRouter.use('/emails', emailRouter);

mainRouter.get('/accounts', (req, res) => {
    const accounts = [];
    if (config.imapAccount1.username) {
        accounts.push({ id: config.imapAccount1.username, email: config.imapAccount1.username });
    }
    if (config.imapAccount2.username) {
        accounts.push({ id: config.imapAccount2.username, email: config.imapAccount2.username });
    }
    res.json(accounts);
});


export { mainRouter };