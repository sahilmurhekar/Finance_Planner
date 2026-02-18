# Personal Finance Tracker

A secure web app for tracking mutual funds, crypto holdings, expenses, and net worth with a 6-digit PIN login.

## Features

- 🏠 **Dashboard** - Real-time net worth analytics and charts
- 💰 **Mutual Funds** - Track investments manually
- 🪙 **Crypto Wallet** - MetaMask + Binance API integration
- 💸 **Expense Tracker** - Categories with smart alerts at 80% and 100% of limits
- ⚙️ **Settings** - Profile customization and data export

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- MetaMask browser extension

### Installation

**Frontend:**
```bash
npm create vite@latest finance-tracker -- --template react-ts
cd finance-tracker
npm install
npm i tailwindcss postcss autoprefixer zustand recharts axios ethers qrcode.react papaparse zod
npx tailwindcss init -p
npm run dev
```

**Backend:**
```bash
mkdir backend && cd backend
npm init -y
npm i express mongoose jsonwebtoken bcryptjs cors dotenv node-cache
npm i -D nodemon
npm run dev
```

### Environment Setup

Create `/backend/.env.local`:
```
MONGODB_URI=mongodb+srv://...
PIN_CODE=123456
JWT_SECRET=your-secret-key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## Tech Stack

| Frontend | Backend | Database |
|----------|---------|----------|
| Vite + React | Express.js | MongoDB |
| TypeScript | Mongoose | |
| Tailwind CSS | JWT Auth | |
| Zustand | bcryptjs | |
| Recharts | | |

## Project Structure

```
finance-tracker/
├── src/
│   ├── pages/ (PinLogin, Dashboard, Wallet, Expenses, Settings, Setup)
│   ├── store/ (Zustand stores)
│   ├── components/
│   └── lib/
└── backend/
    ├── routes/ (auth, mutual-funds, crypto, expenses, user)
    ├── models/ (UserProfile, MutualFund, CryptoHolding, Expense)
    └── middleware/
```

## Authentication

6-digit PIN login → JWT issued → Stored in localStorage → Auto-logout after 1 hour

## API Endpoints (Protected)

```
POST   /api/auth/validate-pin
GET    /api/user/profile
PUT    /api/user/profile
GET/POST/PUT/DELETE /api/mutual-funds
GET/POST/PUT/DELETE /api/crypto
GET/POST/PUT/DELETE /api/expenses
GET    /api/binance/price?symbol=BTCUSDT (cached)
```

## Database Schema

- **UserProfile** - salary, expense_limit, investment_goal
- **MutualFund** - fund_name, invested_amount, current_value
- **CryptoHolding** - token_symbol, quantity, invested_amount
- **Expense** - category, amount, note, date
- **Category** - name, monthly_limit

## Key Calculations

```
Total Invested = MF invested + Crypto invested
Net Worth = (MF current + Crypto current) - Total Expenses
Return % = (Current Value - Invested) / Invested * 100
```

## Deployment

**Frontend:** Vercel
**Backend:** Vercel
**Database:** MongoDB Atlas

Set environment variables on your deployment platform before deploying.

## Security

✅ PIN hashed with bcryptjs
✅ JWT validation on protected routes
✅ Rate limiting (5 attempts, 5 min lockout)
✅ Input validation with Zod
✅ Binance keys never exposed to client

## Development

1. Clone repo: `git clone <repo>`
2. Frontend setup (see above)
3. Backend setup (see above)
4. Access app at `http://localhost:5173`
5. Default PIN: `123456`

