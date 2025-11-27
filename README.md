# tickr - Stock Trading Platform

A full-stack stock trading application with interactive charting, educational content, AI-powered coaching, and real-time market data integration.

## 🚀 Tech Stack

**Frontend**
- React 19 with Vite
- TypeScript & JavaScript
- Lightweight Charts for advanced trading visualization
- Three.js & React Three Fiber for 3D elements
- Zustand for state management
- React Router for navigation
- TailwindCSS & Styled Components for styling
- Framer Motion for animations
- Google OAuth for authentication

**Backend**
- Node.js & Express
- Alpaca Trade API for real-time market data and trading
- File-based JSON storage system
- WebSocket support for live data streams
- JWT authentication
- Nodemailer for email services

## ✨ Features

### Trading Interface
- Real-time stock charting with multiple timeframes
- Interactive order placement (buy/sell)
- Portfolio tracking and position management
- Live market data via WebSocket connections
- Professional charting with indicators and drawing tools

### Educational Platform
- Comprehensive lesson library on trading basics
- Interactive article reader
- Progress tracking with roadmap visualization
- Structured learning paths

### AI Coach
- Personalized trading guidance
- Market analysis and insights
- Educational recommendations based on user progress

### Dashboard
- Portfolio performance metrics
- Transaction history
- Real-time account balance
- Position tracking

### Shop
- In-app purchases (planned)
- Premium features marketplace

## 📁 Project Structure

```
tickr/
├── stockbuddy/              # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── SuperChart.tsx    # Main trading chart component
│   │   │   ├── LiveChart.jsx     # WebSocket live data feed
│   │   │   ├── TradeComponents.jsx  # Order placement UI
│   │   │   └── ...
│   │   ├── pages/           # Route components
│   │   │   ├── Trade.jsx    # Trading interface
│   │   │   ├── Dashboard.jsx # Portfolio overview
│   │   │   ├── Learn.jsx    # Educational content
│   │   │   └── AICoach.jsx  # AI coaching interface
│   │   ├── hooks/           # Custom React hooks
│   │   ├── stores/          # Zustand state stores
│   │   └── services/        # API service layer
│   └── public/              # Static assets
│
├── auth-backend/            # Express.js API server
│   ├── routes/
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── trading.js       # Trading operations
│   │   ├── ai-coach.js      # AI coaching endpoints
│   │   └── shop.js          # Shop functionality
│   ├── services/
│   │   ├── tradingService.js   # Trading logic
│   │   └── emailService.js     # Email notifications
│   └── data/                # File-based storage (JSON)
│
└── buglog.csv               # Project maintenance log
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Alpaca API credentials (for live trading features)

### Installation

1. **Clone the repository**
```bash
git clone [repository-url]
cd tickr
```

2. **Install frontend dependencies**
```bash
cd stockbuddy
npm install
```

3. **Install backend dependencies**
```bash
cd ../auth-backend
npm install
```

4. **Configure environment variables**

Create a `.env` file in `auth-backend/`:
```env
# Required
PORT=5001
JWT_SECRET=replace-with-strong-secret-min-16-chars
ALPACA_API_KEY=your-alpaca-key
ALPACA_SECRET_KEY=your-alpaca-secret
GOOGLE_CLIENT_ID=your-google-client-id

# Optional
GOOGLE_CLIENT_SECRET=your-google-client-secret
EMAIL_USER=service-account@example.com
EMAIL_PASSWORD=super-secret-password
FRONTEND_URL=http://localhost:5173

# Lockdown mode (only approved users can access)
LOCKDOWN=false

# Trading safety (paper = sandbox, live = real money)
ALPACA_ENV=paper
```

Create a `.env` file in `stockbuddy/`:
```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_LOCKDOWN=false
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

5. **Start the development servers**

**Terminal 1 - Backend:**
```bash
cd auth-backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd stockbuddy
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔒 Lockdown Mode (Waitlist)

The app supports a "lockdown" mode for controlled beta access:

### How It Works
1. Set `LOCKDOWN=true` (backend) and `VITE_LOCKDOWN=true` (frontend)
2. Unauthenticated users can sign up but are redirected to `/waitlist`
3. Only users with `approved=true` can access the full app
4. Admins can create invite tokens that users redeem to gain access

### Waitlist Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/waitlist` | Join waitlist (email, name) |
| GET | `/api/waitlist/status?email=` | Check waitlist status |
| POST | `/api/invites` | Create invite token (admin) |
| POST | `/api/invites/redeem` | Redeem invite token |

### Running in Lockdown
```bash
# Backend
LOCKDOWN=true npm start

# Frontend
VITE_LOCKDOWN=true npm run dev
```

## 🔧 Development

### Frontend Development
- Hot module replacement with Vite
- ESLint for code quality
- Component-based architecture
- Custom hooks for reusable logic

### Backend Development
- RESTful API design
- File-based storage for development (easily swappable with database)
- Modular route structure
- Error handling and logging

#### ⚠️ Important: Data File Changes Require Server Restart

**After editing data files directly, you must restart the server for changes to take effect.**

The backend server loads data files into memory at startup. Any manual edits to `auth-backend/data/*.json` files (or running the data reset script) require a server restart to be reflected.

**To apply data file changes:**
1. Stop the server (Ctrl+C)
2. Make your data file changes or run `npm run reset-data`
3. Restart the server (`npm start` or `npm run dev`)

This applies to:
- Direct edits to JSON data files
- Using the data reset script (`npm run reset-data`)
- Restoring from backups
- Any manual data file modifications

See `auth-backend/README.md` for more details. Also see `Documentation/Development-Notes.md` for comprehensive development and tooling notes.

### Key Design Decisions
- **File-based storage**: Lightweight and perfect for development/demos; can be replaced with PostgreSQL, MongoDB, etc.
- **Lightweight Charts**: High-performance WebGL-based charting library for smooth trading interfaces
- **Component-driven**: Modular, reusable components for maintainability
- **TypeScript migration**: Gradual adoption where most beneficial (charts, stores)

## 📊 Integration with Alpaca API

The platform integrates with Alpaca's trading API to provide:
- Real-time and historical market data
- Order placement and execution
- Portfolio and account management
- Market data streaming via WebSocket

## 🎯 Current Status

The application is actively under development with a focus on:
- Enhanced charting features and indicators
- Expanded educational content library
- AI coaching capabilities
- Performance optimization

## 📝 License

This project is private and proprietary.

## 🗄️ Data Storage Migration Note

Current authentication and trading data live in JSON files under `auth-backend/data/`, which is ideal for demos but brittle for growth. We recommend adopting SQLite as the first persistent store: it runs locally without external services and gives us transactional safety for purchases and portfolio updates. Prisma can sit on top of SQLite to provide schema migrations, type-safe queries, and an easy upgrade path to PostgreSQL when we outgrow a single-file database. The proposed migration plan is:

1. Define Prisma models that mirror our existing `users`, `portfolios`, and `transactions` JSON structures.
2. Ship a CLI script that reads the JSON files and seeds the SQLite database.
3. Swap route handlers to read/write via Prisma while keeping the seeding script for QA resets.
4. When ready for multi-user deployments, flip Prisma's datasource to PostgreSQL—no route changes required.

This approach removes plaintext storage, unlocks relational constraints, and positions us for future analytics without a ground-up rewrite.

## 👤 Author

Built with modern web technologies and best practices for a seamless trading and learning experience.

