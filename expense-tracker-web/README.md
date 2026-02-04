# Expense Tracker Web

Frontend web application for the Smart Expense Tracker with AI-powered insights.

## Tech Stack

- **React** with **TypeScript**
- **Vite** (build tool)
- **Material-UI** (UI components)
- **React Router** (routing)
- **Axios** (HTTP client)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Running API server (see expense-tracker-api)

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

Update `VITE_API_URL` if your API is running on a different port.

### 3. Run the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
npm run preview
```

## Features

### Authentication
- User registration with email and password
- Login with JWT token
- Protected routes requiring authentication

### Dashboard
- Overview of income, expenses, and balance
- Quick summary cards
- Recent transactions

### Expense Management
- View all expenses in a table
- Add new expenses
- Edit existing expenses
- Delete expenses
- Filter by date range and category

### Income Management
- View all income entries
- Add new income
- Edit existing income
- Delete income
- Filter by date range

## Project Structure

```
src/
├── components/       # Reusable components (Layout, PrivateRoute)
├── contexts/         # React contexts (AuthContext)
├── pages/            # Page components (Dashboard, Login, etc.)
├── services/         # API service layer
│   ├── api.ts        # Axios instance with interceptors
│   ├── authService.ts
│   ├── expenseService.ts
│   └── incomeService.ts
├── App.tsx           # Main app with routing
└── main.tsx          # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:3001/api)

## Future Enhancements

- Add/Edit expense and income modals
- Category management
- Charts and visualizations
- AI chat interface
- Export reports (PDF, CSV)
- Subscription tracking
- Budget planning

## License

ISC
