import express from 'express';
import Qualification from '../models/qualification-model.js';
import { createCrudController } from '../controllers/crud-controller.js';
import authMiddleware from '../middlewares/auth.js';
import adminMiddleware from '../middlewares/admin.js';

const router = express.Router();
const controller = createCrudController(Qualification);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authMiddleware, adminMiddleware, controller.create);
router.put('/:id', authMiddleware, adminMiddleware, controller.update);
router.delete('/:id', authMiddleware, adminMiddleware, controller.delete);

export default router;