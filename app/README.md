# Expense Tracker

A Node.js application to record and view daily financial transactions with a Material UI-inspired interface.

## Features

- ✅ Graphical CRUD user interface for expenses with Material UI design
- ✅ Display a table of daily expenses
- ✅ Display a table of monthly expenses
- ✅ Filter expenses by category
- ✅ Create, update, and delete expense records
- ✅ SQLite database for data persistence

## Categories

Expenses can be categorized as:
- Groceries
- Transport
- Housing and Utilities
- Restaurants and Cafes
- Health and Medicine
- Clothing & Footwear
- Entertainment

## Tech Stack

- **Backend**: Node.js (vanilla, no frameworks)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: SQLite (via better-sqlite3)
- **Testing**: Jest, Supertest

## Project Structure

```
app/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── css/
│   │   └── styles.css     # Material UI-inspired styles
│   └── js/
│       ├── api.js         # API client
│       └── app.js         # Main application logic
├── src/                   # Backend source files
│   ├── server.js          # HTTP server
│   ├── database/
│   │   └── init.js        # Database initialization
│   ├── models/
│   │   └── expense.js     # Expense model
│   └── routes/
│       └── api.js         # API route handlers
├── tests/                 # Test files
│   ├── backend/
│   │   ├── expense.model.test.js
│   │   └── api.routes.test.js
│   └── frontend/
│       ├── app.test.js
│       └── api.test.js
├── data/                  # SQLite database storage
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm

### Installation

1. Navigate to the app directory:
   ```bash
   cd app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Development

Run the server in watch mode:
```bash
npm run dev
```

### Testing

Run all tests:
```bash
npm test
```

Run backend tests only:
```bash
npm run test:backend
```

Run frontend tests only:
```bash
npm run test:frontend
```

Run tests in watch mode:
```bash
npm run test:watch
```

## API Endpoints

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses (with optional filters) |
| GET | `/api/expenses/:id` | Get a single expense |
| GET | `/api/expenses/daily/:date` | Get expenses for a specific date |
| GET | `/api/expenses/monthly/:year/:month` | Get expenses for a specific month |
| POST | `/api/expenses` | Create a new expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all available categories |

### Query Parameters (GET /api/expenses)

- `category`: Filter by category
- `startDate`: Filter by start date (YYYY-MM-DD)
- `endDate`: Filter by end date (YYYY-MM-DD)

### Expense Object

```json
{
  "id": 1,
  "description": "Lunch at restaurant",
  "amount": 15.50,
  "category": "Restaurants and Cafes",
  "date": "2024-01-15",
  "created_at": "2024-01-15T12:00:00.000Z",
  "updated_at": "2024-01-15T12:00:00.000Z"
}
```

## CI/CD

The project includes a GitHub Actions workflow that:
- Runs on every push and pull request to main/master branches
- Tests against Node.js 18.x and 20.x
- Blocks PR merging if tests fail
- Uploads code coverage reports

## License

MIT
