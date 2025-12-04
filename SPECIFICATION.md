# Expense Tracker — Application Specification

This document provides a complete specification for building the Expense Tracker application based on the requirements defined in `requirements.txt` and the coding standards established in `CONSTITUTION.md`.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Data Model](#data-model)
4. [API Specification](#api-specification)
5. [Frontend Specification](#frontend-specification)
   - [Design System](#design-system)
   - [UI Components](#ui-components)
   - [Accessibility Requirements](#accessibility-requirements)
   - [User Interactions](#user-interactions)
   - [Error Handling](#error-handling)
6. [Testing Specification](#testing-specification)
7. [Branching Strategy (Gitflow)](#branching-strategy-gitflow)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Implementation Checklist](#implementation-checklist)
10. [Appendix: Gap Analysis Summary](#appendix-gap-analysis-summary)

---

## Overview

### Purpose
The Expense Tracker is a web application that allows users to record and view daily financial transactions. It provides a graphical user interface following Material Design principles for managing expense records with full CRUD capabilities.

### Core Features
| Feature | Description | Status |
|---------|-------------|--------|
| F1 | Graphical CRUD UI for expenses (Material Design) | ✅ Implemented |
| F2 | Display table of daily expenses with date selection | ⚠️ Partial (needs date picker) |
| F3 | Display table of monthly expenses with month selection | ⚠️ Partial (needs month picker) |
| F4 | Filter expenses by category | ✅ Implemented |
| F5 | Create, update, delete expense records | ✅ Implemented |

### Technical Stack
| Component | Technology | Version |
|-----------|------------|---------|
| Backend Runtime | Node.js | 18.x LTS / 20.x LTS |
| Backend HTTP | Native `http` module | - |
| Database | SQLite (better-sqlite3) | ^9.4.3 |
| Frontend | Vanilla JS, CSS, HTML | ES6+ |
| Testing | Jest | ^29.7.0 |
| CI/CD | GitHub Actions | - |

---

## Project Structure

```
copilot-demo-nodejs/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI/CD pipeline
├── app/
│   ├── package.json                  # Node.js project configuration
│   ├── public/                       # Frontend static files
│   │   ├── index.html                # Single HTML entry point
│   │   ├── css/
│   │   │   └── styles.css            # All styles (Material Design)
│   │   └── js/
│   │       ├── api.js                # API client module
│   │       └── app.js                # Application logic & DOM manipulation
│   ├── src/                          # Backend source code
│   │   ├── server.js                 # HTTP server entry point
│   │   ├── database/
│   │   │   └── init.js               # Database initialization & connection
│   │   ├── models/
│   │   │   └── expense.js            # Expense data model
│   │   └── routes/
│   │       └── api.js                # API request handlers
│   └── tests/                        # Test suites
│       ├── backend/
│       │   ├── api.routes.test.js    # API integration tests
│       │   └── expense.model.test.js # Model unit tests
│       └── frontend/
│           ├── api.test.js           # Frontend API client tests
│           └── app.test.js           # Frontend application tests
├── CONSTITUTION.md                   # Project coding standards
├── requirements.txt                  # Project requirements
└── SPECIFICATION.md                  # This file
```

---

## Data Model

### Expense Entity

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| `description` | TEXT | NOT NULL, non-empty, max 200 chars | Short description (e.g., "Lunch") |
| `amount` | REAL | NOT NULL, >= 0, max 999999.99 | Expense amount (2 decimal places) |
| `category` | TEXT | NOT NULL, enum | Category from predefined list |
| `date` | TEXT | NOT NULL, YYYY-MM-DD, not future | Date of expense (cannot be future date) |
| `created_at` | TEXT | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TEXT | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

### Field Constraints Detail

| Field | Min | Max | Additional Rules |
|-------|-----|-----|------------------|
| `description` | 1 char | 200 chars | Trimmed, no leading/trailing whitespace |
| `amount` | 0.00 | 999,999.99 | Rounded to 2 decimal places |
| `date` | 2000-01-01 | Today | Cannot be in the future |

### Valid Categories (Enum)
```
1. Groceries
2. Transport
3. Housing and Utilities
4. Restaurants and Cafes
5. Health and Medicine
6. Clothing & Footwear
7. Entertainment
```

### Database Schema (SQLite)
```sql
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL CHECK(category IN (
    'Groceries',
    'Transport',
    'Housing and Utilities',
    'Restaurants and Cafes',
    'Health and Medicine',
    'Clothing & Footwear',
    'Entertainment'
  )),
  date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Database Configuration
- **Mode**: WAL (Write-Ahead Logging) for concurrent read performance
- **Location**: `./app/data/expenses.db`
- **Test DB**: `./app/data/test-expenses.db`

### Database Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date_category ON expenses(date, category);
```

---

## API Specification

### Base URL
```
http://localhost:3000/api
```

### CORS Headers
All responses include:
```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Response Format

#### Success Response
```json
{
  "id": 1,
  "description": "Lunch",
  "amount": 15.50,
  "category": "Restaurants and Cafes",
  "date": "2024-01-15",
  "created_at": "2024-01-15T12:00:00.000Z",
  "updated_at": "2024-01-15T12:00:00.000Z"
}
```

#### Error Response
```json
{
  "error": "Descriptive error message",
  "code": "VALIDATION_ERROR"
}
```

### HTTP Status Codes
| Status | Meaning | Usage |
|--------|---------|-------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation errors, invalid input |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Database errors, unexpected failures |

### Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `SERVER_ERROR` | 500 | Unexpected server error |

---

### Endpoints

#### GET /api/categories
Returns list of valid expense categories.

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/api/categories` |
| Request Body | None |
| Success Status | 200 OK |
| Response | `["Groceries", "Transport", ...]` |

---

#### GET /api/expenses
Returns all expenses with optional filtering.

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/api/expenses` |
| Query Params | `category`, `startDate`, `endDate` |
| Success Status | 200 OK |
| Response | Array of expense objects |

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category name |
| `startDate` | string | Filter by start date (YYYY-MM-DD) |
| `endDate` | string | Filter by end date (YYYY-MM-DD) |

**Example:**
```
GET /api/expenses?category=Groceries&startDate=2024-01-01&endDate=2024-01-31
```

---

#### GET /api/expenses/:id
Returns a single expense by ID.

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/api/expenses/:id` |
| Success Status | 200 OK |
| Error Status | 404 Not Found |
| Response | Single expense object |

---

#### GET /api/expenses/daily/:date
Returns expenses for a specific date.

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/api/expenses/daily/:date` |
| Date Format | YYYY-MM-DD |
| Success Status | 200 OK |
| Response | Array of expense objects |

---

#### GET /api/expenses/monthly/:year/:month
Returns expenses for a specific month.

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/api/expenses/monthly/:year/:month` |
| Year Format | YYYY (e.g., 2024) |
| Month Format | 1-12 |
| Success Status | 200 OK |
| Response | Array of expense objects |

---

#### POST /api/expenses
Creates a new expense record.

| Property | Value |
|----------|-------|
| Method | POST |
| Path | `/api/expenses` |
| Content-Type | application/json |
| Success Status | 201 Created |
| Error Status | 400 Bad Request |

**Request Body:**
```json
{
  "description": "Lunch at restaurant",
  "amount": 25.50,
  "category": "Restaurants and Cafes",
  "date": "2024-01-15"
}
```

**Validation Rules:**
| Field | Rule | Error Message |
|-------|------|---------------|
| description | Required, non-empty string, max 200 chars | "Description is required and must be a non-empty string" |
| description | Max length exceeded | "Description must not exceed 200 characters" |
| amount | Required, non-negative number | "Amount is required and must be a non-negative number" |
| amount | Max value exceeded | "Amount must not exceed 999,999.99" |
| amount | Invalid precision | "Amount must have at most 2 decimal places" |
| category | Required, valid category | "Category must be one of: [categories list]" |
| date | Required, YYYY-MM-DD format | "Date is required and must be in YYYY-MM-DD format" |
| date | Future date not allowed | "Date cannot be in the future" |
| date | Date too old | "Date must be on or after January 1, 2000" |

---

#### PUT /api/expenses/:id
Updates an existing expense record.

| Property | Value |
|----------|-------|
| Method | PUT |
| Path | `/api/expenses/:id` |
| Content-Type | application/json |
| Success Status | 200 OK |
| Error Status | 400 Bad Request, 404 Not Found |

**Request Body** (all fields optional):
```json
{
  "description": "Updated description",
  "amount": 30.00,
  "category": "Groceries",
  "date": "2024-01-16"
}
```

---

#### DELETE /api/expenses/:id
Deletes an expense record.

| Property | Value |
|----------|-------|
| Method | DELETE |
| Path | `/api/expenses/:id` |
| Success Status | 204 No Content |
| Error Status | 404 Not Found |

---

## Frontend Specification

### Design System

#### Material Design Compliance
Follow Google's Material Design guidelines:

**Color Palette:**
| Variable | Value | Usage |
|----------|-------|-------|
| `--primary-color` | #1976d2 | Primary actions, headers |
| `--primary-light` | #42a5f5 | Hover states |
| `--primary-dark` | #1565c0 | Active states |
| `--error-color` | #d32f2f | Destructive actions, errors |
| `--success-color` | #2e7d32 | Success messages |
| `--text-primary` | rgba(0,0,0,0.87) | Primary text |
| `--text-secondary` | rgba(0,0,0,0.6) | Secondary text |

**Typography:**
- Font Family: Roboto, system fallbacks
- Base Size: 16px (1rem)
- Weights: 300 (light), 400 (regular), 500 (medium), 700 (bold)

**Spacing (8px grid):**
- `4px` - Tight spacing
- `8px` - Default spacing
- `16px` - Section spacing
- `24px` - Large spacing (card padding)

---

### UI Components

#### 1. App Bar
- Fixed position at top
- Primary color background
- Application title with wallet icon
- Shadow elevation

#### 2. Filters Section (Card)
- Category dropdown (filter by category)
- Start date input
- End date input
- Apply button (primary)
- Clear button (outlined)

#### 3. View Toggle & Date Selection
- Daily View button
- Monthly View button  
- Active state indication
- **Date Picker** (for Daily View): Select specific date to view expenses
- **Month/Year Selector** (for Monthly View): Select month and year to view expenses
- Navigation arrows for previous/next day or month
- "Today" / "This Month" quick navigation button

**View Toggle Behavior:**
| View | Default Selection | Date Controls |
|------|-------------------|---------------|
| Daily | Today's date | Date picker input + Prev/Next day arrows |
| Monthly | Current month | Month dropdown + Year dropdown + Prev/Next month arrows |

#### 4. Expenses Table (Card)
- Section header with title and FAB (add button)
- Responsive data table with columns:
  - Date (formatted)
  - Description
  - Category (with colored badge)
  - Amount (currency formatted, right-aligned)
  - Actions (edit/delete icon buttons)
- Table footer with total amount
- Empty state when no expenses

#### 5. Add/Edit Modal
- Modal backdrop (semi-transparent)
- Card-style content
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modalTitle"`
- Focus trapped within modal when open
- Form fields:
  - Description (text input, required, maxlength="200")
  - Amount (number input with $ prefix, required, max="999999.99", step="0.01")
  - Category (dropdown, required)
  - Date (date picker, required, max=today)
- Cancel and Save buttons
- **Form Input Attributes:**
  - `aria-required="true"` on required fields
  - `aria-invalid="true"` when validation fails
  - `aria-describedby` pointing to error message element

#### 6. Delete Confirmation Modal
- `role="alertdialog"`, `aria-modal="true"`, `aria-describedby="deleteWarning"`
- Warning message with `id="deleteWarning"`
- Cancel and Delete buttons (danger style)

#### 7. Snackbar Notifications
- Position: bottom center
- Auto-dismiss: 4 seconds
- Success/error messages
- **Dismissible**: Close button (X) for manual dismissal
- `role="alert"` and `aria-live="polite"` for accessibility

#### 8. Loading States
- **Loading Spinner**: Displayed during API operations >300ms
- **Disabled Form**: Submit button disabled while processing
- **Loading Text**: Button shows "Saving..." or "Loading..." during operations
- **Table Skeleton**: Optional skeleton loader while fetching data

#### 9. Inline Validation Errors
- Error messages displayed below form fields
- Red border on invalid fields
- `aria-describedby` linking input to error message
- Error icon indicator
- Real-time validation on blur

---

### Category Badges
Each category has a distinct color badge:

| Category | CSS Class | Background | Text Color |
|----------|-----------|------------|------------|
| Groceries | `.category-groceries` | #e8f5e9 | #2e7d32 (Green) |
| Transport | `.category-transport` | #e3f2fd | #1565c0 (Blue) |
| Housing and Utilities | `.category-housing` | #fff3e0 | #ef6c00 (Orange) |
| Restaurants and Cafes | `.category-restaurants` | #fce4ec | #c2185b (Pink/Red) |
| Health and Medicine | `.category-health` | #f3e5f5 | #7b1fa2 (Purple) |
| Clothing & Footwear | `.category-clothing` | #e0f2f1 | #00695c (Teal) |
| Entertainment | `.category-entertainment` | #ede7f6 | #512da8 (Deep Purple) |

---

### Responsive Breakpoints

| Breakpoint | Target | Behavior |
|------------|--------|----------|
| < 480px | Mobile portrait | Stack forms, horizontal scroll tables |
| 480-768px | Mobile landscape | Adjusted spacing |
| 768-1024px | Tablet | Two-column filters |
| > 1024px | Desktop | Full layout |

---

### Accessibility Requirements

All components must meet WCAG 2.1 Level AA compliance:

#### Keyboard Navigation
| Component | Key | Action |
|-----------|-----|--------|
| Modal | `Escape` | Close modal |
| Modal | `Tab` | Navigate between form fields |
| Modal | `Shift+Tab` | Navigate backwards |
| Table | `Enter` on row | Open edit modal |
| Buttons | `Enter`/`Space` | Activate button |
| Dropdown | `Arrow Up/Down` | Navigate options |

#### Focus Management
- Modal traps focus when open
- Focus returns to trigger element on modal close
- Visible focus indicator (outline) on all interactive elements
- Skip to main content link (optional enhancement)

#### ARIA Attributes
| Element | Required Attributes |
|---------|--------------------|
| Modal (Add/Edit) | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modalTitle"` |
| Modal (Delete) | `role="alertdialog"`, `aria-modal="true"`, `aria-describedby="deleteWarning"` |
| Form inputs | `aria-required="true"`, `aria-invalid` (when error), `aria-describedby` (for error) |
| Snackbar | `role="alert"`, `aria-live="polite"` |
| Table | `aria-label="Expenses table"` |
| Loading spinner | `role="status"`, `aria-label="Loading"` |
| Icon buttons | `aria-label` describing action (e.g., "Edit expense", "Delete expense") |

#### Screen Reader Support
- Meaningful link and button text
- Form labels properly associated with inputs
- Error messages announced when they appear
- Table headers properly associated with cells

---

### User Interactions

#### Adding Expense
1. User clicks FAB (+) button
2. Modal opens with empty form, today's date pre-filled
3. Focus moves to Description field
4. User fills required fields
5. Real-time validation on blur (shows inline errors)
6. User clicks Save
7. Submit button disabled, shows "Saving..."
8. API POST request sent (10s timeout)
9. On success: modal closes, table refreshes, snackbar shows "Expense added successfully"
10. On error: snackbar shows error message, button re-enabled
11. Focus returns to FAB button

#### Editing Expense
1. User clicks edit icon on expense row
2. Modal opens with pre-filled data
3. Focus moves to Description field
4. User modifies fields
5. Real-time validation on blur
6. User clicks Save
7. Submit button disabled, shows "Saving..."
8. API PUT request sent (10s timeout)
9. On success: modal closes, table refreshes, snackbar shows "Expense updated successfully"
10. Focus returns to edit button of that row

#### Deleting Expense
1. User clicks delete icon on expense row
2. Confirmation modal opens with focus on Cancel button
3. User clicks Delete
4. Delete button disabled during request
5. API DELETE request sent (10s timeout)
6. On success: modal closes, table refreshes, snackbar shows "Expense deleted successfully"
7. Focus returns to table or next row

#### Filtering Expenses
1. User selects category and/or date range
2. User clicks Apply
3. Loading indicator shown
4. Table refreshes with filtered results
5. Title updates to "Filtered Expenses" with count (e.g., "Filtered Expenses (5)")
6. If no results: Show "No expenses match your filters" message with Clear Filters button
7. Clear button resets filters and shows all expenses

#### Switching Views (Daily/Monthly)
1. User clicks Daily View or Monthly View button
2. Selected button shows active state
3. Date controls update:
   - **Daily**: Date picker appears with today's date
   - **Monthly**: Month/Year dropdowns appear with current month
4. Loading indicator shown
5. Table refreshes with expenses for selected period
6. Title updates (e.g., "Expenses for Dec 3, 2025" or "Expenses for December 2025")
7. Total recalculated for visible expenses

#### Navigating Dates
1. User clicks Previous (←) or Next (→) arrow
2. Date/month selection updates
3. Loading indicator shown
4. Table refreshes with new period's expenses
5. Navigation disabled for future dates (cannot go beyond today/current month)

---

### JavaScript Module Structure

#### api.js (ExpenseAPI)
```javascript
const API_TIMEOUT = 10000; // 10 seconds

const ExpenseAPI = {
  async getAll(filters) { ... },
  async getById(id) { ... },
  async getDaily(date) { ... },
  async getMonthly(year, month) { ... },
  async create(expense) { ... },
  async update(id, expense) { ... },
  async delete(id) { ... },
  async getCategories() { ... }
};

// Fetch with timeout wrapper
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
```

#### app.js (Application State)
```javascript
const state = {
  expenses: [],
  categories: [],
  currentView: 'daily' | 'monthly',
  selectedDate: 'YYYY-MM-DD',      // For daily view
  selectedYear: YYYY,               // For monthly view
  selectedMonth: 1-12,              // For monthly view
  filters: { category, startDate, endDate },
  editingId: null,
  deleteId: null,
  isLoading: false,                 // Loading state flag
  formErrors: {}                    // Field-level validation errors
};
```

#### Loading State Management
```javascript
// Show loading for operations
async function withLoading(operation) {
  state.isLoading = true;
  showLoadingIndicator();
  try {
    await operation();
  } finally {
    state.isLoading = false;
    hideLoadingIndicator();
  }
}
```

#### Form Validation
```javascript
function validateForm(data) {
  const errors = {};
  
  if (!data.description?.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.length > 200) {
    errors.description = 'Description must not exceed 200 characters';
  }
  
  if (data.amount < 0) {
    errors.amount = 'Amount must be non-negative';
  } else if (data.amount > 999999.99) {
    errors.amount = 'Amount must not exceed 999,999.99';
  }
  
  if (new Date(data.date) > new Date()) {
    errors.date = 'Date cannot be in the future';
  }
  
  return errors;
}
```

---

### Error Handling

#### Network Errors
| Error Type | User Message | Behavior |
|------------|--------------|----------|
| Network offline | "You appear to be offline. Please check your connection." | Show snackbar, retain form data |
| Request timeout (10s) | "Request timed out. Please try again." | Show snackbar, enable retry |
| Server error (500) | "Server error. Please try again later." | Show snackbar |
| Not found (404) | "The requested resource was not found." | Show snackbar |
| Validation error (400) | Display specific field errors | Show inline errors |

#### Timeout Configuration
- API request timeout: 10 seconds
- Debounce filter inputs: 300ms
- Snackbar auto-dismiss: 4 seconds

#### Duplicate Submission Prevention
- Disable submit button immediately on click
- Re-enable on success or error
- Prevent double-click form submission

---

## Testing Specification

### Test Framework Configuration
```javascript
// jest.config (in package.json)
{
  "projects": [
    {
      "displayName": "backend",
      "testEnvironment": "node",
      "testMatch": ["<rootDir>/tests/backend/**/*.test.js"]
    },
    {
      "displayName": "frontend",
      "testEnvironment": "jsdom",
      "testMatch": ["<rootDir>/tests/frontend/**/*.test.js"]
    }
  ]
}
```

### Coverage Requirements
| Category | Minimum |
|----------|---------|
| Overall Line Coverage | 80% |
| Critical Paths | 100% |

### Backend Test Cases

#### ExpenseModel Tests (`expense.model.test.js`)

| Test Suite | Test Case | Priority |
|------------|-----------|----------|
| getCategories | Returns all 7 valid categories | High |
| create | Creates expense with valid data | High |
| create | Throws error for missing description | High |
| create | Throws error for empty description | High |
| create | Throws error for negative amount | High |
| create | Throws error for invalid category | High |
| create | Throws error for invalid date format | High |
| create | Throws error for future date | High |
| create | Throws error for date before 2000 | Medium |
| create | Throws error for description > 200 chars | High |
| create | Throws error for amount > 999999.99 | High |
| create | Allows zero amount | Medium |
| create | Trims description whitespace | Medium |
| create | Rounds amount to 2 decimal places | Medium |
| getAll | Returns all expenses | High |
| getAll | Filters by category | High |
| getAll | Filters by date range | High |
| getAll | Orders by date descending | Medium |
| getById | Returns expense by ID | High |
| getById | Returns undefined for non-existent ID | High |
| getDailyExpenses | Returns expenses for specific date | High |
| getMonthlyExpenses | Returns expenses for specific month | High |
| update | Updates existing expense | High |
| update | Returns null for non-existent ID | High |
| update | Validates updated fields | High |
| update | Updates only provided fields | Medium |
| delete | Deletes existing expense | High |
| delete | Returns false for non-existent ID | High |

#### API Routes Tests (`api.routes.test.js`)

| Test Suite | Test Case | Priority |
|------------|-----------|----------|
| GET /api/categories | Returns all categories | High |
| GET /api/expenses | Returns all expenses | High |
| GET /api/expenses | Filters by category | High |
| GET /api/expenses | Filters by date range | High |
| GET /api/expenses/:id | Returns single expense | High |
| GET /api/expenses/:id | Returns 404 for invalid ID | High |
| GET /api/expenses/daily/:date | Returns daily expenses | High |
| GET /api/expenses/monthly/:year/:month | Returns monthly expenses | High |
| POST /api/expenses | Creates expense with valid data | High |
| POST /api/expenses | Returns 400 for invalid data | High |
| PUT /api/expenses/:id | Updates expense | High |
| PUT /api/expenses/:id | Returns 404 for invalid ID | High |
| DELETE /api/expenses/:id | Deletes expense | High |
| DELETE /api/expenses/:id | Returns 404 for invalid ID | High |
| Static Files | Serves index.html | Medium |
| Static Files | Serves CSS/JS files | Medium |
| Static Files | Returns 404 for missing files | Medium |

### Frontend Test Cases

#### API Client Tests (`api.test.js`)

| Test Suite | Test Case | Priority |
|------------|-----------|----------|
| getAll | Fetches all expenses | High |
| getAll | Includes filter parameters | High |
| getAll | Throws on error response | High |
| getById | Fetches single expense | High |
| getDaily | Fetches daily expenses | High |
| getMonthly | Fetches monthly expenses | High |
| create | Posts expense data | High |
| update | Puts updated data | High |
| delete | Sends delete request | High |
| getCategories | Fetches categories | High |

#### Application Tests (`app.test.js`)

| Test Suite | Test Case | Priority |
|------------|-----------|----------|
| formatCurrency | Formats positive amounts | High |
| formatCurrency | Formats zero | High |
| formatCurrency | Formats large amounts | Medium |
| formatDate | Formats ISO date strings | High |
| escapeHtml | Escapes special characters | High |
| escapeHtml | Handles normal text | Medium |
| renderExpenses | Renders expense rows | High |
| renderExpenses | Shows empty state | High |
| renderExpenses | Calculates total | High |
| showSnackbar | Displays message | Medium |
| openModal | Opens add modal | Medium |
| openEditModal | Opens edit modal with data | Medium |
| closeModal | Closes and resets modal | Medium |
| validateForm | Returns errors for invalid description | High |
| validateForm | Returns errors for invalid amount | High |
| validateForm | Returns errors for future date | High |
| showInlineError | Displays error below field | Medium |
| clearInlineErrors | Clears all field errors | Medium |
| setView | Switches to daily view | High |
| setView | Switches to monthly view | High |
| loadDailyExpenses | Loads expenses for selected date | High |
| loadMonthlyExpenses | Loads expenses for selected month | High |
| navigateDate | Moves to previous day/month | Medium |
| navigateDate | Moves to next day/month | Medium |
| navigateDate | Prevents navigation to future | Medium |
| showLoading | Displays loading indicator | Medium |
| hideLoading | Hides loading indicator | Medium |
| disableSubmit | Disables button during submission | Medium |

---

## Branching Strategy (Gitflow)

This project follows the **Gitflow** branching model for organized, structured development and release management.

### Branch Types

| Branch | Purpose | Naming Convention | Lifetime |
|--------|---------|-------------------|----------|
| `main` | Production-ready code | `main` | Permanent |
| `develop` | Integration branch for features | `develop` | Permanent |
| `feature/*` | New features and enhancements | `feature/<issue-id>-<short-description>` | Temporary |
| `release/*` | Release preparation | `release/v<major>.<minor>.<patch>` | Temporary |
| `hotfix/*` | Critical production fixes | `hotfix/v<major>.<minor>.<patch>` | Temporary |

### Branch Workflow Diagram

```
main ─────●─────────────────●─────────────────●───────────► (production releases)
          │                 │                 │
          │                 │                 │
          │    release/v1.0 │    hotfix/v1.0.1│
          │        ↓        │        ↓        │
develop ──┴────●────●───────┴────●────────────┴────●──────► (integration)
               │    │            │                 │
               │    │            │                 │
         feature/1  feature/2    feature/3    feature/4
```

### Branch Rules

#### `main` Branch
- **Purpose**: Contains production-ready, stable code only
- **Direct commits**: ❌ Prohibited
- **Merge sources**: Only from `release/*` or `hotfix/*` branches
- **Protection rules**:
  - Require pull request reviews (minimum 1 approval)
  - Require status checks to pass (CI/CD pipeline)
  - Require branches to be up to date before merging
  - Do not allow force pushes
- **Tagging**: Every merge to `main` must be tagged with version (e.g., `v1.0.0`)

#### `develop` Branch
- **Purpose**: Integration branch where features are merged for testing
- **Direct commits**: ❌ Prohibited (except minor documentation fixes)
- **Merge sources**: From `feature/*` branches
- **Protection rules**:
  - Require pull request reviews
  - Require status checks to pass
  - Allow squash merging

#### `feature/*` Branches
- **Purpose**: Develop new features or implement GitHub Issues
- **Created from**: `develop`
- **Merged to**: `develop` (via Pull Request)
- **Naming**: `feature/<issue-number>-<short-description>`
  - Example: `feature/1-date-navigation-ui`
  - Example: `feature/42-add-export-csv`
- **Lifecycle**:
  1. Create branch from `develop`
  2. Implement feature with atomic commits
  3. Push branch and create Pull Request to `develop`
  4. Pass CI checks and code review
  5. Squash merge to `develop`
  6. Delete feature branch after merge

#### `release/*` Branches
- **Purpose**: Prepare for production release (final testing, versioning, changelog)
- **Created from**: `develop`
- **Merged to**: Both `main` AND `develop`
- **Naming**: `release/v<major>.<minor>.<patch>`
  - Example: `release/v1.0.0`
  - Example: `release/v1.2.0`
- **Allowed changes**: Bug fixes, documentation, version bumps only (no new features)
- **Lifecycle**:
  1. Create branch from `develop` when ready for release
  2. Update version in `package.json`
  3. Update CHANGELOG.md
  4. Final testing and bug fixes
  5. Merge to `main` with version tag
  6. Back-merge to `develop`
  7. Delete release branch

#### `hotfix/*` Branches
- **Purpose**: Fix critical bugs in production
- **Created from**: `main`
- **Merged to**: Both `main` AND `develop`
- **Naming**: `hotfix/v<major>.<minor>.<patch>`
  - Example: `hotfix/v1.0.1`
- **Lifecycle**:
  1. Create branch from `main`
  2. Fix the critical bug
  3. Bump patch version
  4. Merge to `main` with version tag
  5. Back-merge to `develop`
  6. Delete hotfix branch

### Commit Message Convention

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Commit Types
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, no logic change) |
| `refactor` | Code refactoring (no feature or bug fix) |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks, dependency updates |
| `perf` | Performance improvements |
| `ci` | CI/CD configuration changes |

#### Examples
```bash
feat(ui): add date navigation with daily/monthly views
fix(api): handle timeout errors gracefully
docs(readme): update installation instructions
test(frontend): add unit tests for form validation
chore(deps): update better-sqlite3 to v9.5.0
```

#### Issue Linking
Always link commits to GitHub Issues using keywords in the commit body or footer:

```bash
feat(form): add inline validation with error messages

Implements client-side validation for expense form fields.

Closes #5
```

### Pull Request Workflow

#### Creating a Pull Request
1. **Title**: Use conventional commit format
   - Example: `feat(ui): add date navigation with daily/monthly views`
2. **Description**: Include:
   - Summary of changes
   - Related issue link (`Closes #<issue-number>`)
   - Test criteria checklist
   - Screenshots (for UI changes)
3. **Labels**: Add appropriate labels (`feature`, `bug`, `documentation`, etc.)
4. **Reviewers**: Assign at least one reviewer

#### PR Merge Strategy
| Target Branch | Merge Strategy | Rationale |
|---------------|----------------|-----------|
| `develop` | Squash merge | Clean history, one commit per feature |
| `main` | Merge commit | Preserve release/hotfix history |

#### PR Checklist
- [ ] Branch is up-to-date with target branch
- [ ] All CI checks pass
- [ ] Code review approved
- [ ] No merge conflicts
- [ ] Issue linked with closing keyword

### Version Numbering (Semantic Versioning)

This project follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

| Component | When to Increment | Example |
|-----------|-------------------|---------|
| MAJOR | Breaking changes, incompatible API changes | `1.0.0` → `2.0.0` |
| MINOR | New features, backward-compatible | `1.0.0` → `1.1.0` |
| PATCH | Bug fixes, backward-compatible | `1.0.0` → `1.0.1` |

### Gitflow Quick Reference

```bash
# Start a new feature
git checkout develop
git pull origin develop
git checkout -b feature/42-new-feature

# Complete a feature (via PR)
git push -u origin feature/42-new-feature
# Create PR to develop, squash merge, delete branch

# Start a release
git checkout develop
git pull origin develop
git checkout -b release/v1.1.0
# Update version, test, then merge to main and develop

# Start a hotfix
git checkout main
git pull origin main
git checkout -b hotfix/v1.0.1
# Fix bug, bump patch version, merge to main and develop
```

---

## CI/CD Pipeline

### Workflow Configuration (`.github/workflows/ci.yml`)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop, 'release/**', 'hotfix/**']
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
      - Checkout repository
      - Setup Node.js
      - Install dependencies (npm ci)
      - Run tests (npm test)
      - Upload coverage reports

  lint:
    runs-on: ubuntu-latest
    steps:
      - Checkout repository
      - Setup Node.js
      - Install dependencies
      - Check for syntax errors
```

### CI/CD Triggers by Branch

| Branch | Push Trigger | PR Trigger | Required Checks |
|--------|--------------|------------|-----------------|
| `main` | ✅ Yes | ✅ Yes (target) | All tests pass, coverage ≥80% |
| `develop` | ✅ Yes | ✅ Yes (target) | All tests pass |
| `feature/*` | ❌ No | ✅ Yes (to develop) | All tests pass |
| `release/*` | ✅ Yes | ✅ Yes (to main) | All tests pass, coverage ≥80% |
| `hotfix/*` | ✅ Yes | ✅ Yes (to main) | All tests pass |

### PR Merge Requirements
1. ✅ All CI checks must pass
2. ✅ Tests pass on Node.js 18.x and 20.x
3. ✅ No skipped tests
4. ⚠️ Minimum 80% code coverage (recommended)

---

## Implementation Checklist

### Backend Components

- [x] **Server Entry Point** (`src/server.js`)
  - [x] HTTP server setup with native module
  - [x] CORS headers configuration
  - [x] OPTIONS preflight handling
  - [x] Database initialization on startup

- [x] **Database Layer** (`src/database/init.js`)
  - [x] SQLite connection with better-sqlite3
  - [x] WAL mode enabled
  - [x] Schema creation with constraints
  - [x] Connection management (get/close/reset)

- [x] **Expense Model** (`src/models/expense.js`)
  - [x] `getAll(filters)` - List with filtering
  - [x] `getById(id)` - Single expense lookup
  - [x] `getDailyExpenses(date)` - Daily filter
  - [x] `getMonthlyExpenses(year, month)` - Monthly filter
  - [x] `create(expense)` - Create with validation
  - [x] `update(id, expense)` - Update with validation
  - [x] `delete(id)` - Delete by ID
  - [x] `getCategories()` - Valid categories list
  - [x] Input validation for all fields

- [x] **API Routes** (`src/routes/api.js`)
  - [x] Static file serving
  - [x] JSON request body parsing
  - [x] URL query parameter parsing
  - [x] RESTful endpoint handlers
  - [x] Proper HTTP status codes
  - [x] Error response formatting

### Frontend Components

- [x] **HTML Structure** (`public/index.html`)
  - [x] Semantic HTML5 markup
  - [x] Material Design fonts/icons
  - [x] App bar with title
  - [x] Filters section
  - [x] View toggle buttons
  - [ ] Date picker for daily view
  - [ ] Month/year selector for monthly view
  - [x] Expenses table with actions
  - [x] Add/Edit modal form
  - [x] Delete confirmation modal
  - [x] Snackbar notification
  - [ ] Snackbar close button
  - [ ] Loading spinner component
  - [ ] Inline error messages

- [x] **CSS Styling** (`public/css/styles.css`)
  - [x] CSS custom properties (variables)
  - [x] Material Design color palette
  - [x] Component styles (cards, buttons, inputs)
  - [x] Table styling with responsive overflow
  - [x] Modal styling with backdrop
  - [x] Category badge colors
  - [x] Responsive breakpoints
  - [ ] Focus visible styles (`:focus-visible`)
  - [ ] Loading spinner styles
  - [ ] Inline error message styles
  - [ ] Disabled button states
  - [ ] Date navigation controls

- [x] **API Client** (`public/js/api.js`)
  - [x] ExpenseAPI object with all methods
  - [x] Fetch API with async/await
  - [x] Error handling and parsing
  - [x] Query parameter building

- [x] **Application Logic** (`public/js/app.js`)
  - [x] Application state management
  - [x] DOM element caching
  - [x] Event listener setup
  - [x] CRUD operations integration
  - [x] Table rendering with escaping
  - [x] Currency/date formatting
  - [x] Modal open/close handling
  - [x] Snackbar notifications
  - [x] Filter application
  - [ ] Daily view with date selection
  - [ ] Monthly view with month/year selection
  - [ ] Date navigation (prev/next)
  - [ ] Loading state management
  - [ ] Inline form validation
  - [ ] Focus trap in modals
  - [ ] Submit button disable during processing
  - [ ] Request timeout handling
  - [ ] Network error handling

### Testing

- [x] **Backend Tests**
  - [x] Model unit tests
  - [x] API integration tests
  - [x] Test database isolation

- [x] **Frontend Tests**
  - [x] API client tests
  - [x] Application logic tests

### CI/CD

- [x] **GitHub Actions Workflow**
  - [x] Multi-version Node.js matrix
  - [x] Test execution
  - [x] Coverage reporting

### Gitflow Branching

- [ ] **Branch Setup**
  - [ ] Create `develop` branch from `main`
  - [ ] Configure branch protection rules for `main`
  - [ ] Configure branch protection rules for `develop`

- [ ] **Feature Development**
  - [x] Use `feature/*` branches for new features
  - [x] Link branches to GitHub Issues
  - [x] Create PRs to `develop` branch
  - [x] Squash merge features to `develop`

- [ ] **Release Process**
  - [ ] Use `release/*` branches for releases
  - [ ] Update version in package.json
  - [ ] Merge to `main` with version tag
  - [ ] Back-merge to `develop`

- [ ] **Hotfix Process**
  - [ ] Use `hotfix/*` branches from `main`
  - [ ] Merge to both `main` and `develop`

---

## NPM Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `node src/server.js` | Start production server |
| `dev` | `node --watch src/server.js` | Start development server with auto-reload |
| `test` | `jest --coverage` | Run all tests with coverage |
| `test:backend` | `jest --testPathPattern=tests/backend` | Run backend tests only |
| `test:frontend` | `jest --testPathPattern=tests/frontend` | Run frontend tests only |
| `test:watch` | `jest --watch` | Run tests in watch mode |
| `db:init` | `node src/database/init.js` | Initialize database manually |

---

## Performance Targets

| Metric | Target | Maximum |
|--------|--------|---------|
| First Contentful Paint | < 1.0s | 1.5s |
| Time to Interactive | < 2.0s | 3.0s |
| API Response (simple) | < 50ms | 100ms |
| API Response (filtered) | < 100ms | 200ms |
| Total Page Weight | < 200KB | 500KB |

---

## Appendix: Gap Analysis Summary

The following items were identified as missing or incomplete in the original implementation and have been added to this specification:

### Critical Priority (Must Fix)
| ID | Issue | Section Updated |
|----|-------|-----------------|
| 1 | Daily/Monthly views don't filter data | View Toggle & Date Selection |
| 2 | No date picker for Daily View | UI Components §3 |
| 3 | No month/year selector for Monthly View | UI Components §3 |

### Medium Priority (Should Fix)
| ID | Issue | Section Updated |
|----|-------|-----------------|
| 4 | Missing loading states | UI Components §8, User Interactions |
| 5 | Missing inline form validation errors | UI Components §9, Form Validation |
| 6 | No max length for description field | Field Constraints Detail |
| 7 | Missing keyboard focus styles | Accessibility Requirements |
| 8 | Missing ARIA attributes | Accessibility Requirements |
| 9 | Amount constraints undefined | Field Constraints Detail |
| 10 | Date range validation undefined | Validation Rules |
| 11 | Network error handling | Error Handling section |
| 12 | No request timeout | api.js specification |
| 13 | 500 vs 400 error distinction | HTTP Status Codes, Error Codes |

### Items Added to Implementation Checklist
- [ ] Date picker for daily view
- [ ] Month/year selector for monthly view
- [ ] Snackbar close button
- [ ] Loading spinner component
- [ ] Inline error messages
- [ ] Focus visible styles
- [ ] Daily view with date selection
- [ ] Monthly view with month/year selection
- [ ] Loading state management
- [ ] Inline form validation
- [ ] Focus trap in modals
- [ ] Submit button disable during processing
- [ ] Request timeout handling
- [ ] Network error handling

---

*Specification Version: 1.2*
*Last Updated: December 2025*

### Changelog
| Version | Date | Changes |
|---------|------|---------|
| 1.2 | Dec 2025 | Added: Gitflow branching strategy section, branch rules, commit conventions, PR workflow, semantic versioning |
| 1.1 | Dec 2025 | Added: Date selection for views, loading states, inline validation, accessibility requirements, error handling, field constraints, timeout configuration |
| 1.0 | Dec 2025 | Initial specification |
