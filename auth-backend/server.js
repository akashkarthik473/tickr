require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const rfs = require('rotating-file-stream');
const authRoutes = require('./routes/auth');
const tradingRoutes = require('./routes/trading');
const aiCoachRoutes = require('./routes/ai-coach');
const shopRoutes = require('./routes/shop');
const waitlistRoutes = require('./routes/waitlist');
const inviteRoutes = require('./routes/invites');
const FileStorage = require('./services/storageService');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { validateEnv } = require('./middleware/validateEnv');

// Helper function to get formatted timestamp
const getTimestamp = () => {
  return new Date().toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  });
};

// Validate environment at boot
const env = validateEnv();
const LOCKDOWN = env.LOCKDOWN === 'true';
const ALPACA_ENV = env.ALPACA_ENV || 'paper';

// Warn if not using paper trading
if (ALPACA_ENV === 'live') {
  console.warn(`[${getTimestamp()}] ⚠️  LIVE TRADING ENABLED - Real money at risk!`);
  }

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Disable CSP for API server
}));

// CORS configuration - restrict to frontend URL in production
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // In development, allow any localhost origin
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// File-based storage setup
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const portfoliosFile = path.join(dataDir, 'portfolios.json');
const transactionsFile = path.join(dataDir, 'transactions.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files if they don't exist
const initializeDataFile = (filePath, defaultData) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

// Initialize data files
initializeDataFile(usersFile, {});
initializeDataFile(portfoliosFile, {});
initializeDataFile(transactionsFile, {});

// Create file storage instance
const fileStorage = new FileStorage(dataDir);
fileStorage.usersFile = usersFile;
fileStorage.portfoliosFile = portfoliosFile;
fileStorage.transactionsFile = transactionsFile;

// Setup rotating auth log
const logsDir = process.env.AUTH_LOG_DIR || path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const authLogStream = rfs.createStream('auth.log', {
  interval: '1d',
  size: '10M',
  path: logsDir
});

// Make shared resources available to routes
app.locals.fileStorage = fileStorage;
app.locals.authLogger = authLogStream;
app.locals.lockdown = LOCKDOWN;
app.locals.alpacaEnv = ALPACA_ENV;

// Global rate limiting (basic protection)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${getTimestamp()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: PORT,
    lockdown: LOCKDOWN,
    alpacaEnv: ALPACA_ENV
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/ai-coach', aiCoachRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/invites', inviteRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
let serverInstance = null;
if (require.main === module) {
  serverInstance = app.listen(PORT, () => {
    console.log(`[${getTimestamp()}] 🚀 Tickr API running on port ${PORT}`);
    console.log(`[${getTimestamp()}] 📁 Using file-based storage in: ${dataDir}`);
    console.log(`[${getTimestamp()}] 📄 Auth logs: ${path.join(logsDir, 'auth.log')}`);
    console.log(`[${getTimestamp()}] 🔗 Health check: http://localhost:${PORT}/health`);
    if (LOCKDOWN) {
      console.log(`[${getTimestamp()}] 🔒 LOCKDOWN MODE: Only approved users can access the app`);
    }
    console.log(`[${getTimestamp()}] 📈 Alpaca environment: ${ALPACA_ENV}`);
  });
}

module.exports = {
  app,
  serverInstance
};
