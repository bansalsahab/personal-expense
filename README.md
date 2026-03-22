# Expense Tracker

A professional expense tracking application with user authentication. Built with React, Node.js, and SQLite.

## Features

- **User Authentication** - Register, login, logout with JWT tokens
- **User Profile** - Update name and password
- **Dashboard** - Overview of your financial status with balance, income, and expense summaries
- **Transactions** - Full list of all income and expenses with search and filtering
- **Summary** - Category-wise breakdown of your spending
- **Add Transactions** - Easy modal to add income or expenses
- **Delete Transactions** - Remove unwanted entries
- **Data Isolation** - Each user's data is private and secure

## Tech Stack

- **Frontend:** React, React Router
- **Backend:** Node.js, Express
- **Database:** SQLite (local, no server needed)
- **Authentication:** JWT, bcrypt
- **HTTP Client:** Axios

## Prerequisites

- Node.js installed (v14 or higher)
- npm or yarn package manager

## Quick Start

### 1. Install Backend Dependencies

```bash
cd expense-tracker
npm install
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd expense-tracker
npm run dev
```
Server will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd expense-tracker/client
npm start
```
App will open at `http://localhost:3000`

## First Time Setup

1. Open `http://localhost:3000` in your browser
2. Click "Sign up" to create a new account
3. Fill in your name, email, and password
4. You'll be automatically logged in after registration
5. Start tracking your expenses!

## Project Structure

```
expense-tracker/
├── server.js           # Express server with SQLite and auth
├── package.json        # Backend dependencies
└── client/
    ├── package.json    # Frontend dependencies
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js         # Entry with routing
        ├── App.js           # Main app component
        ├── index.css        # Styles
        ├── context/
        │   └── AuthContext.js  # Auth state management
        └── pages/
            ├── Auth.js      # Login/Register pages
            └── Profile.js   # Profile settings
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create new account |
| POST | /api/auth/login | Login to account |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile/password |

### Transactions (requires auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/transactions | Get all user transactions |
| POST | /api/transactions | Add new transaction |
| DELETE | /api/transactions/:id | Delete transaction |

## Database

Uses SQLite with two tables:
- **users** - Stores user accounts with hashed passwords
- **transactions** - Stores transactions linked to users

Data is stored in `expense_tracker.db` file in the project root.

## Security

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- Users can only access their own data
- Protected routes require valid authentication
