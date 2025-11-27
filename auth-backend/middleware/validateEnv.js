/**
 * Environment validation using Zod
 * Validates all required and optional env vars at boot time.
 */
const { z } = require('zod');

const envSchema = z.object({
  // Required
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  ALPACA_API_KEY: z.string().min(1, 'ALPACA_API_KEY is required'),
  ALPACA_SECRET_KEY: z.string().min(1, 'ALPACA_SECRET_KEY is required'),
  
  // Optional with defaults
  PORT: z.string().default('5001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().optional().default('http://localhost:5173'),
  
  // Lockdown mode
  LOCKDOWN: z.enum(['true', 'false']).optional().default('false'),
  
  // Alpaca environment - default to paper for safety
  ALPACA_ENV: z.enum(['paper', 'live']).optional().default('paper'),
  
  // Email (optional - falls back to Ethereal)
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  
  // Google OAuth (optional)
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Gemini AI (optional)
  GEMINI_API_KEY: z.string().optional(),
  
  // Data directory
  DATA_DIR: z.string().optional(),
  AUTH_LOG_DIR: z.string().optional()
});

/**
 * Validate environment variables at startup
 * @returns {Object} Validated and typed env object
 */
function validateEnv() {
  // Skip validation in test environment
  if (process.env.NODE_ENV === 'test') {
    return {
      JWT_SECRET: process.env.JWT_SECRET || 'test-secret',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'test-client-id',
      ALPACA_API_KEY: process.env.ALPACA_API_KEY || 'test-key',
      ALPACA_SECRET_KEY: process.env.ALPACA_SECRET_KEY || 'test-secret',
      PORT: process.env.PORT || '5001',
      NODE_ENV: 'test',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
      LOCKDOWN: process.env.LOCKDOWN || 'false',
      ALPACA_ENV: process.env.ALPACA_ENV || 'paper'
    };
  }

  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('\n❌ Environment validation failed:\n');
    result.error.issues.forEach(issue => {
      console.error(`  • ${issue.path.join('.')}: ${issue.message}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    console.error('See .env.example for reference.\n');
    process.exit(1);
  }
  
  // Warn about live trading
  if (result.data.ALPACA_ENV === 'live') {
    console.warn('\n⚠️  WARNING: ALPACA_ENV=live - Real money trading is enabled!\n');
  }
  
  // Warn about lockdown mode
  if (result.data.LOCKDOWN === 'true') {
    console.log('🔒 Lockdown mode enabled - only approved users can access the app');
  }
  
  return result.data;
}

module.exports = { validateEnv, envSchema };

