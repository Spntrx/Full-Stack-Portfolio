import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });
dotenv.config();

import express from 'express';
import UserModel from './models/user-model.js';
import projectsRoutes from './routes/projects-routes.js';
import userRoutes from './routes/user-routes.js';
import contactRoutes from './routes/contact-routes.js';
import qualificationRoutes from './routes/qualification-routes.js';

const app = express();
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_ORIGIN,
].filter(Boolean));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '1mb' }));

app.use('/api/contacts', contactRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/qualifications', qualificationRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to My Portfolio application.' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.use((error, req, res, next) => {
  console.error('Request failed:', error);
  if (res.headersSent) return next(error);

  const status = error.statusCode || error.status || 500;
  const message = status === 400 ? 'Invalid JSON request body' : 'Request could not be completed';
  res.status(status).json({ message });
});

async function seedAdministrator() {
  const { ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD_HASH } = process.env;
  if (!ADMIN_EMAIL && !ADMIN_NAME && !ADMIN_PASSWORD_HASH) {
    console.warn('Administrator not seeded: configure ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD_HASH.');
    return;
  }
  if (!ADMIN_EMAIL || !ADMIN_NAME || !ADMIN_PASSWORD_HASH) {
    throw new Error('ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD_HASH must be configured together');
  }
  if (!ADMIN_NAME.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL.trim())) {
    throw new Error('ADMIN_NAME and ADMIN_EMAIL must contain valid values');
  }
  if (!/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(ADMIN_PASSWORD_HASH)) {
    throw new Error('ADMIN_PASSWORD_HASH must contain a valid bcrypt hash');
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();
  await UserModel.collection.updateOne(
    { email },
    {
      $set: { name: ADMIN_NAME.trim(), role: 'admin', updatedDate: new Date() },
      $setOnInsert: {
        email,
        password: ADMIN_PASSWORD_HASH,
        createdDate: new Date(),
      },
    },
    { upsert: true }
  );
  console.log(`Administrator account ready for ${email}`);
}

async function startServer() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be configured');
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be configured');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB database connection established successfully');
  await seedAdministrator();

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Unable to start portfolio server:', error.message);
  process.exitCode = 1;
});

export default app;
