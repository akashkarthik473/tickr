# Tickr Backend API

Express.js backend server for the Tickr stock trading platform.

## 📁 Project Structure

```
auth-backend/
├── routes/              # API route handlers
│   ├── auth.js         # Authentication endpoints
│   ├── trading.js      # Trading operations
│   ├── shop.js         # Shop and inventory
│   └── ai-coach.js     # AI coaching endpoints
├── services/           # Business logic services
│   ├── tradingService.js
│   └── emailService.js
├── data/               # File-based storage
│   ├── users.json      # User data (gitignored)
│   ├── portfolios.json # Portfolio data (gitignored)
│   ├── transactions.json # Transaction data (gitignored)
│   ├── seeds/          # Pristine seed data for QA
│   └── backups/        # Data backups (gitignored)
├── scripts/            # Utility scripts
│   └── reset-data.js   # Data reset script for QA
├── tests/              # Test files
└── server.js           # Main server file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the `auth-backend/` directory:

```env
PORT=5001
JWT_SECRET=your-strong-secret-key
ALPACA_API_KEY=your-alpaca-api-key
ALPACA_SECRET_KEY=your-alpaca-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
FRONTEND_URL=http://localhost:5173
DATA_DIR=./data
AUTH_LOG_DIR=./logs
```

### Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5001` (or the port specified in `.env`).

## 📊 Data Storage

The backend uses file-based JSON storage for development and QA purposes. Data files are stored in the `data/` directory:

- `users.json` - User accounts and authentication data
- `portfolios.json` - User portfolio and trading positions
- `transactions.json` - Transaction history

### ⚠️ Important: Server Restart Required

**After editing data files directly, you must restart the server for changes to take effect.**

The server loads data files into memory at startup. Manual edits to JSON files while the server is running will not be reflected until the server is restarted.

This applies to:
- Direct edits to `data/*.json` files
- Using the data reset script (`npm run reset-data`)
- Restoring from backups
- Any manual data file modifications

**To apply changes:**
1. Stop the server (Ctrl+C)
2. Make your data file changes
3. Start the server again (`npm start` or `npm run dev`)

### Data Reset Script

For QA and testing, use the data reset script to restore data files to pristine state:

```bash
# Reset with confirmation
npm run reset-data

# Reset with backup
npm run reset-data:backup

# Reset without confirmation
npm run reset-data:force
```

**Note:** After running the reset script, restart the server to load the reset data.

See `data/seeds/README.md` for more information about seed data.

## 🧪 Testing

Run tests with:

```bash
npm test
```

Tests use isolated temporary data directories and don't affect production data files.

## 🔒 Security

- JWT-based authentication
- Rate limiting on authentication endpoints
- Environment variable validation on startup
- Rotating auth logs for auditability
- Password hashing with bcrypt

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/user-data` - Get user data
- `PUT /api/auth/profile` - Update user profile

### Trading
- `GET /api/trading/quote/:symbol` - Get stock quote
- `GET /api/trading/portfolio` - Get user portfolio
- `POST /api/trading/buy` - Place buy order
- `POST /api/trading/sell` - Place sell order
- `GET /api/trading/transactions` - Get transaction history

### Shop
- `GET /api/shop/items` - Get shop items
- `GET /api/shop/purchases` - Get user purchases
- `POST /api/shop/purchase` - Purchase item
- `POST /api/shop/use` - Use purchased item
- `GET /api/shop/active-effects` - Get active effects

### AI Coach
- `GET /api/ai-coach/chat` - Get chat history
- `POST /api/ai-coach/chat` - Send message to AI coach

## 🛠️ Development

### File-based Storage

The current implementation uses file-based JSON storage, which is ideal for:
- Development and testing
- Quick demos
- Single-user deployments

For production deployments with multiple users, consider migrating to a database (see main README for migration notes).

### Environment Variables

All required environment variables are validated on server startup. The server will exit if required variables are missing.

### Logging

- Auth attempts are logged to rotating log files in `logs/auth.log`
- Server logs are output to console
- Error logs include timestamps and context

## 📦 Dependencies

- **express** - Web framework
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **@alpacahq/alpaca-trade-api** - Alpaca trading API
- **express-rate-limit** - Rate limiting
- **nodemailer** - Email service
- **google-auth-library** - Google OAuth

## 🔄 Migration Path

See the main project README for notes on migrating from file-based storage to SQLite/PostgreSQL with Prisma.

