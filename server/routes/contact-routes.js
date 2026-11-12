import express from 'express';
import Contact from '../models/contact-model.js';
import { createCrudController } from '../controllers/crud-controller.js';
import authMiddleware from '../middlewares/auth.js';
import adminMiddleware from '../middlewares/admin.js';

const router = express.Router();
const controller = createCrudController(Contact);

router.get('/', authMiddleware, adminMiddleware, controller.getAll);
router.get('/:id', authMiddleware, adminMiddleware, controller.getById);
router.post('/', controller.create);
router.put('/:id', authMiddleware, adminMiddleware, controller.update);
router.delete('/:id', authMiddleware, adminMiddleware, controller.delete);

export default router;