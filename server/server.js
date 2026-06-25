import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import askRoutes from './routes/ask.js';
import uploadRoutes from './routes/upload.js';
import mandiRoutes from './routes/mandi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ask', askRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/mandi', mandiRoutes);

// Serve static frontend files from project root
const frontendPath = path.join(projectRoot, 'frontend');
app.use(express.static(frontendPath, {
  index: ['index.html'],
  extensions: ['html'] // allow extensionless URLs
}));

// Fallback for SPA routing if needed (optional since we have separate HTML files)
app.use((req, res) => {
  // Serve 404 or index
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n==============================================`);
  console.log(`🚀 KisanMitra Backend Server Running`);
  console.log(`==============================================`);
  console.log(`API URL:     http://localhost:${PORT}/api`);
  console.log(`Frontend:    http://localhost:${PORT}`);
  console.log(`Database:    ${path.join(__dirname, 'data', 'kisanmitra.db')}`);
  console.log(`==============================================\n`);
});
