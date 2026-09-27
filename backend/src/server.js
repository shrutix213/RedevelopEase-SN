require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const { seedData } = require('./seed/seedData');

// Route imports
const authRoutes = require('./routes/authRoutes');
const societyRoutes = require('./routes/societyRoutes');
const residentRoutes = require('./routes/residentRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const redevelopmentRoutes = require('./routes/redevelopmentRoutes');
const documentRoutes = require('./routes/documentRoutes');
const rentVacatingRoutes = require('./routes/rentVacatingRoutes');
const builderRoutes = require('./routes/builderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const settingRoutes = require('./routes/settingRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static directory for uploaded files and documents
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/societies', societyRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/redevelopment', redevelopmentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', rentVacatingRoutes);
app.use('/api/builders', builderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/settings', settingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'RedevelopEase API',
    version: '2.4.0',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[API Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedData();
    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`  RedevelopEase API Server Running       `);
      console.log(`  Port: ${PORT}                          `);
      console.log(`  Status: READY                          `);
      console.log(`=========================================`);
    });
  } catch (err) {
    console.error('[Server Start Failure]', err);
    process.exit(1);
  }
};

startServer();
