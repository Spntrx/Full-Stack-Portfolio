import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getCurrentUser,
  getUserById,
  loginUser,
  registerUser,
  updateUser,
} from '../controllers/user-controllers.js';
import authMiddleware from '../middlewares/auth.js';
import adminMiddleware from '../middlewares/admin.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/register', registerUser);
router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getCurrentUser);

router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.get('/:id', authMiddleware, adminMiddleware, getUserById);
router.put('/:id', authMiddleware, adminMiddleware, updateUser);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

export default router;
