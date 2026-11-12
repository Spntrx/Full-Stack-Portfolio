import mongoose from 'mongoose';
import UserModel from '../models/user-model.js';
import generateToken from '../utils/jwt.js';

const publicUserFields = 'name email role createdDate updatedDate';

const isValidCredentials = ({ name, email, password }, includeName = false) => (
  (!includeName || (typeof name === 'string' && name.trim().length > 0))
  && typeof email === 'string'
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  && typeof password === 'string'
  && password.length >= 8
);

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select(publicUserFields);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const user = await UserModel.findById(req.params.id).select(publicUserFields);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select(publicUserFields);
    if (!user) return res.status(401).json({ message: 'Account no longer exists' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerUser = async (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const { name, email, password } = body;
  if (!isValidCredentials(body, true)) {
    return res.status(400).json({
      message: 'Name, a valid email address, and a password of at least 8 characters are required',
    });
  }

  try {
    const user = await UserModel.create({ name: name.trim(), email: email.trim(), password });
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const { email, password } = body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await UserModel.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Sign-in successful', user, token: generateToken(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const updates = {};
  if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim();
  if (typeof body.email === 'string' && body.email.trim()) updates.email = body.email.trim();
  if (body.role === 'user' || body.role === 'admin') updates.role = body.role;
  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: 'Provide a valid name, email, or role to update' });
  }

  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select(publicUserFields);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
