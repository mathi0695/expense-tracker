# Expense Tracker API

Backend API for the Smart Expense Tracker application with AI-powered insights.

## Tech Stack

- **Node.js** with **Express**
- **TypeScript**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **OpenAI API** (for AI features)

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following variables in `.env`:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string for JWT signing
- `OPENAI_API_KEY` - Your OpenAI API key (for AI features)

### 3. Start MongoDB

Make sure MongoDB is running locally:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Or run manually
mongod --config /usr/local/etc/mongod.conf
```

### 4. Run the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 5. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - Get all expenses (with filters)
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Income
- `POST /api/incomes` - Create income
- `GET /api/incomes` - Get all incomes (with filters)
- `GET /api/incomes/:id` - Get income by ID
- `PUT /api/incomes/:id` - Update income
- `DELETE /api/incomes/:id` - Delete income

## Project Structure

```
src/
├── config/          # Configuration files (database, etc.)
├── controllers/     # Route controllers
├── middleware/      # Custom middleware (auth, error handling)
├── models/          # Mongoose models
├── routes/          # API routes
├── app.ts           # Express app setup
└── index.ts         # Server entry point
```

## Default Categories

When a user registers, the following default categories are created:
- Food
- Transport
- Rent
- Utilities
- Shopping
- Subscriptions
- Entertainment
- Healthcare
- Others

## License

ISC

