import { Router } from 'express';
import { getAccount } from '../controllers/account';

const router = Router();
router.get('/', getAccount);

export default router;
