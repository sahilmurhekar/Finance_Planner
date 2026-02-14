# Finance Tracker - Functions & Tech Stack

## Tech Stack
- **Frontend**: Next.js 14+
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **API Calls**: Fetch API
- **UI**: Tailwind CSS + Shadcn/ui

---

## SECTION 1: DASHBOARD

### Investment Management
- `addInvestment()` - Save crypto/MF investment to DB (amount, symbol, date, buyPrice)
- `getInvestments()` - Fetch all investments from DB
- `deleteInvestment()` - Remove investment from DB
- `calculateTotalInvested()` - Sum all investments (crypto + MF)

### Crypto Functions
- `fetchCryptoPrices(symbols)` - Call CoinGecko API for real-time prices
- `calculateCryptoReturns(investment)` - Calculate gain/loss (currentPrice - buyPrice) * quantity
- `getCryptoWiseSummary()` - Group by coin, show amount, return %, current value
- `getTotalCryptoMetrics()` - Total crypto invested, total return, overall %

### Mutual Fund Functions
- `fetchMFPrices(symbols)` - Call Rapid API for latest NAV
- `calculateMFReturns(investment)` - Calculate gain/loss (currentNAV - buyNAV) * units
- `getMFWiseSummary()` - Group by fund, show amount, return %, current value
- `getIntervalReturns(investment)` - Return daily%, weekly%, monthly%, yearly% gains
- `getTotalMFMetrics()` - Total MF invested, total return, overall %

### Dashboard Display
- `getDashboardSummary()` - Combine all metrics (total invested, total value, total gain%)
- `refreshPrices()` - Update crypto/MF prices every 5-10 minutes

---

## SECTION 2: METAMASK WALLET

### Wallet Connection
- `connectMetamask()` - Trigger Metamask connection, get wallet address
- `disconnectWallet()` - Clear wallet connection
- `getWalletAddress()` - Retrieve stored wallet address from Zustand

### Balance & Transactions
- `fetchWalletBalance(walletAddress)` - Use Web3 provider to get ETH balance
- `fetchWalletTransactions(walletAddress, limit)` - Call Etherscan API for transaction history
- `subscribeToBalanceUpdates()` - Listen for new blocks, update balance

### Display
- `formatBalance()` - Convert Wei to ETH
- `displayTransactionHistory()` - Show recent 20 transactions with pagination
- `getTransactionDetails(txHash)` - Fetch single transaction details

---

## SECTION 3: DAILY EXPENSE TRACKER

### Budget Setup (One-time)
- `initializeBudget()` - Ask for salary, expected investment, daily expense, create categories
- `saveBudgetConfig()` - Store budget to DB (monthlySalary, expectedInvestment, maxExpense, categories)
- `getBudgetConfig()` - Fetch user's budget setup from DB

### Expense Management
- `addExpense(amount, category, description, date)` - Save to DB
- `getExpenses(filters)` - Fetch expenses (by date range, category, amount)
- `updateExpense(expenseId, updates)` - Edit expense
- `deleteExpense(expenseId)` - Remove expense

### Category & Summary
- `getCategoryWiseSummary(month)` - Group expenses by category, show spent vs limit, %
- `getTotalMonthlyExpense()` - Sum all expenses for current month
- `getRemainingBudget()` - Calculate (monthly limit - total spent)

### Alert System
- `checkBudgetAlerts()` - Trigger on every expense add/update
  - If spent > 70% of category limit → Create "warning" alert
  - If spent > 90% of category limit → Create "critical" alert
  - If spent > 100% of category limit → Mark as "over budget"
- `getActiveAlerts()` - Fetch all active alerts for user
- `resolveAlert(alertId)` - Mark alert as resolved

### Dashboard & Analytics
- `getSpendingTrends(days)` - Daily average, weekly comparison, line chart data
- `getProjectedMonthEnd()` - Calculate "if spending continues, month-end total will be ₹X"
- `getDailyBreakdown()` - Bar chart data for daily spending pattern

---

## Database Schema (Supabase)

```sql
-- investments
CREATE TABLE investments (
  id UUID PRIMARY KEY,
  user_id UUID,
  type ENUM('crypto', 'mf'),
  symbol VARCHAR(50),
  amount DECIMAL(15,2),
  quantity DECIMAL(20,8),
  buy_price DECIMAL(15,2),
  investment_date DATE,
  created_at TIMESTAMP
);

-- expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  user_id UUID,
  amount DECIMAL(10,2),
  category VARCHAR(50),
  description TEXT,
  date DATE,
  created_at TIMESTAMP
);

-- budgets
CREATE TABLE budgets (
  id UUID PRIMARY KEY,
  user_id UUID,
  monthly_salary DECIMAL(12,2),
  expected_investment DECIMAL(12,2),
  max_monthly_expense DECIMAL(12,2),
  categories JSONB,
  created_at TIMESTAMP
);

-- alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY,
  user_id UUID,
  type ENUM('warning', 'critical'),
  category_name VARCHAR(50),
  message TEXT,
  resolved BOOLEAN,
  created_at TIMESTAMP
);

-- wallet_config
CREATE TABLE wallet_config (
  id UUID PRIMARY KEY,
  user_id UUID,
  wallet_address VARCHAR(255),
  is_connected BOOLEAN,
  last_synced_at TIMESTAMP
);
```

---

## External APIs

| API | Endpoint | Purpose |
|-----|----------|---------|
| CoinGecko | `/simple/price` | Crypto prices (free) |
| Rapid API | `/mf/prices` | MF NAV (~$15-50/month) |
| Etherscan | `/api?module=account&action=txlist` | Wallet transactions (free) |
| Web3 Provider | getBalance() | ETH balance |

---

## Zustand Store Structure

```javascript
// investmentStore
{
  investments: [],
  addInvestment(),
  removeInvestment(),
  setInvestments(),
  cryptoPrices: {},
  setCryptoPrices(),
  mfPrices: {},
  setMfPrices()
}

// expenseStore
{
  expenses: [],
  addExpense(),
  removeExpense(),
  setExpenses(),
  alerts: [],
  setAlerts(),
  budgetConfig: {},
  setBudgetConfig()
}

// walletStore
{
  walletAddress: null,
  setWalletAddress(),
  balance: 0,
  setBalance(),
  transactions: [],
  setTransactions(),
  isConnected: false,
  setConnected()
}
```

---

## API Routes (Next.js)

```
/api/investments/add
/api/investments/get
/api/investments/delete

/api/expenses/add
/api/expenses/get
/api/expenses/delete

/api/budget/setup
/api/budget/get

/api/alerts/check
/api/alerts/get

/api/crypto/prices
/api/mf/prices

/api/wallet/connect
/api/wallet/balance
/api/wallet/transactions
```

---

## Development Order

1. Set up Next.js + Supabase + Zustand
2. Build Dashboard (investment CRUD + price fetching)
3. Integrate Crypto & MF APIs
4. Build Metamask wallet integration
5. Build Expense tracker + budget setup
6. Implement alert system
7. Deploy
