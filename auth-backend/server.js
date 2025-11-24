require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const rfs = require('rotating-file-stream');
const authRoutes = require('./routes/auth');
const tradingRoutes = require('./routes/trading');
const aiCoachRoutes = require('./routes/ai-coach');
const shopRoutes = require('./routes/shop');
const FileStorage = require('./services/storageService');

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

const validateEnvironment = () => {
  const requiredVars = ['JWT_SECRET', 'GOOGLE_CLIENT_ID', 'ALPACA_API_KEY', 'ALPACA_SECRET_KEY'];
  const optionalVars = ['EMAIL_USER', 'EMAIL_PASSWORD', 'GOOGLE_CLIENT_SECRET'];

  const missingRequired = requiredVars.filter((key) => !process.env[key]);
  if (missingRequired.length > 0) {
    console.error(`[${getTimestamp()}] ❌ Missing required environment variables: ${missingRequired.join(', ')}`);
    console.error(`[${getTimestamp()}] Please create or update your .env file in auth-backend/ before starting the server.`);
    process.exit(1);
  }

  const missingOptional = optionalVars.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(`[${getTimestamp()}] ⚠️ Optional environment variables not set: ${missingOptional.join(', ')}`);
    console.warn(`[${getTimestamp()}] Email functionality will fall back to Ethereal test accounts.`);
  }
};

validateEnvironment();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/ai-coach', aiCoachRoutes);
app.use('/api/shop', shopRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Start server
let serverInstance = null;
if (require.main === module) {
  serverInstance = app.listen(PORT, () => {
    console.log(`[${getTimestamp()}] 🚀 StockBuddy API running on port ${PORT}`);
    console.log(`[${getTimestamp()}] 📁 Using file-based storage in: ${dataDir}`);
    console.log(`[${getTimestamp()}] 📄 Auth logs: ${path.join(logsDir, 'auth.log')}`);
    console.log(`[${getTimestamp()}] 🔗 Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = {
  app,
  serverInstance
};
