# Expense Tracker — Project Constitution

This document defines the foundational principles, standards, and guidelines that govern the development of the Expense Tracker application. All contributors must adhere to these principles to ensure code quality, consistency, and maintainability.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Node.js Backend Standards](#nodejs-backend-standards)
3. [Frontend Standards](#frontend-standards)
4. [Testing Standards](#testing-standards)
5. [User Experience Consistency](#user-experience-consistency)
6. [Performance Requirements](#performance-requirements)
7. [Code Quality & Style](#code-quality--style)
8. [Security Guidelines](#security-guidelines)
9. [Git & Collaboration](#git--collaboration)

---

## Core Principles

### 1. Simplicity First
- Prefer simple, readable solutions over clever or complex ones
- Use vanilla Node.js and browser APIs before reaching for external libraries
- Every dependency must justify its inclusion with clear benefits

### 2. Consistency Over Preference
- Follow established patterns already present in the codebase
- Consistency across the project trumps individual preferences
- When in doubt, match existing code style

### 3. Test-Driven Confidence
- No feature is complete without corresponding tests
- Tests are documentation—they should clearly describe expected behavior
- Failing tests block all merges to main branches

### 4. User-Centric Development
- Every change should improve or maintain user experience
- Performance degradation is a bug
- Accessibility is a requirement, not an enhancement

---

## Node.js Backend Standards

### Runtime & Version
- **Minimum Node.js version**: 18.x LTS
- **Target Node.js version**: 20.x LTS
- Use ES Modules syntax where supported; CommonJS for compatibility

### Architecture Principles
```
src/
├── server.js          # Entry point, HTTP server setup
├── database/          # Database initialization and connection management
├── models/            # Data models with business logic
├── routes/            # Request handlers and routing
├── middleware/        # Reusable middleware functions (future)
└── utils/             # Helper functions and utilities (future)
```

### HTTP Server Guidelines
- Use native `http` module—no Express unless complexity warrants it
- Implement proper CORS headers for cross-origin requests
- Always return appropriate HTTP status codes:
  - `200` - Success (GET, PUT)
  - `201` - Created (POST)
  - `204` - No Content (DELETE)
  - `400` - Bad Request (validation errors)
  - `404` - Not Found
  - `500` - Internal Server Error

### Database Standards (SQLite)
- Use `better-sqlite3` for synchronous, performant SQLite operations
- Enable WAL mode for better concurrent read performance
- All schema changes must be backwards compatible
- Validate all input data before database operations
- Use parameterized queries—never concatenate user input into SQL

### Error Handling
```javascript
// ✅ Good: Specific error messages
throw new Error('Description is required and must be a non-empty string');

// ❌ Bad: Generic errors
throw new Error('Invalid input');
```

- Always catch and handle errors gracefully
- Log errors with sufficient context for debugging
- Never expose stack traces or internal details to clients

### API Design Principles
- Follow RESTful conventions for resource naming
- Use plural nouns for resource endpoints (`/api/expenses`, not `/api/expense`)
- Support filtering via query parameters
- Return consistent JSON response structures:
```javascript
// Success response
{ "id": 1, "description": "Lunch", ... }

// Error response
{ "error": "Descriptive error message" }
```

---

## Frontend Standards

### Technology Stack
- **HTML5**: Semantic markup, accessibility attributes
- **CSS3**: Custom properties (variables), Flexbox, Grid
- **JavaScript**: ES6+ features, no transpilation required for modern browsers

### Browser Support
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- No IE11 support required

### File Organization
```
public/
├── index.html         # Single HTML entry point
├── css/
│   └── styles.css     # All styles in one file (split if >500 lines)
└── js/
    ├── api.js         # API client—all fetch calls
    └── app.js         # Application logic and DOM manipulation
```

### JavaScript Guidelines
- Use `const` by default; `let` only when reassignment is needed
- Never use `var`
- Prefer arrow functions for callbacks
- Use async/await over raw Promises
- Always handle Promise rejections

```javascript
// ✅ Good
async function loadExpenses() {
  try {
    const expenses = await ExpenseAPI.getAll();
    renderExpenses(expenses);
  } catch (error) {
    showSnackbar('Failed to load expenses: ' + error.message);
  }
}

// ❌ Bad: Unhandled promise
function loadExpenses() {
  ExpenseAPI.getAll().then(renderExpenses);
}
```

### DOM Manipulation
- Cache DOM element references at initialization
- Use `textContent` for text, `innerHTML` only for trusted HTML
- Always escape user input before rendering to prevent XSS
- Use event delegation for dynamic content

### CSS Guidelines
- Use CSS custom properties for theming and consistency
- Follow BEM-like naming: `.component-name`, `.component-name__element`, `.component-name--modifier`
- Mobile-first responsive design
- Use `rem` for typography, `px` for borders/shadows
- Avoid `!important` except for utility classes

```css
/* ✅ Good: Using CSS variables */
.btn-primary {
  background-color: var(--primary-color);
  transition: background-color var(--transition-fast);
}

/* ❌ Bad: Hardcoded values */
.btn-primary {
  background-color: #1976d2;
  transition: background-color 150ms;
}
```

---

## Testing Standards

### Test Framework
- **Jest** for all JavaScript testing (backend and frontend)
- **Supertest** for HTTP endpoint integration tests (when needed)
- **jsdom** environment for frontend tests

### Test Organization
```
tests/
├── backend/
│   ├── *.model.test.js     # Unit tests for models
│   └── *.routes.test.js    # Integration tests for API routes
└── frontend/
    ├── *.test.js           # Unit tests for utilities
    └── *.integration.test.js # Integration tests (future)
```

### Test Naming Conventions
```javascript
describe('ExpenseModel', () => {
  describe('create', () => {
    it('should create a new expense with valid data', () => {});
    it('should throw error for missing description', () => {});
    it('should throw error for negative amount', () => {});
  });
});
```

### Coverage Requirements
- **Minimum line coverage**: 80%
- **Critical paths**: 100% coverage for:
  - Data validation logic
  - CRUD operations
  - API endpoint handlers
  - Currency/date formatting utilities

### Testing Principles

#### 1. Test Behavior, Not Implementation
```javascript
// ✅ Good: Tests the outcome
it('should return all expenses filtered by category', () => {
  const result = ExpenseModel.getAll({ category: 'Groceries' });
  expect(result.every(e => e.category === 'Groceries')).toBe(true);
});

// ❌ Bad: Tests internal implementation
it('should call database with correct SQL', () => {
  // Testing SQL query string instead of results
});
```

#### 2. Isolate Tests
- Each test must be independent and runnable in any order
- Clean up test data in `beforeEach`/`afterEach`
- Use separate test databases for backend tests

#### 3. Test Edge Cases
- Empty inputs
- Boundary values (0, negative numbers, max lengths)
- Invalid data types
- Missing required fields
- Special characters and unicode

#### 4. Mock External Dependencies
```javascript
// Frontend: Mock fetch API
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockData)
  });
});
```

### CI/CD Integration
- All tests must pass before PR can be merged
- Tests run on Node.js 18.x and 20.x
- Coverage reports uploaded automatically
- No skipped tests in main branch

---

## User Experience Consistency

### Design System: Material UI Principles
Follow Google's Material Design guidelines for visual consistency:

#### Color Palette
```css
--primary-color: #1976d2;      /* Primary actions, headers */
--primary-light: #42a5f5;      /* Hover states */
--primary-dark: #1565c0;       /* Active states */
--error-color: #d32f2f;        /* Destructive actions, errors */
--success-color: #2e7d32;      /* Success messages */
--text-primary: rgba(0,0,0,0.87);
--text-secondary: rgba(0,0,0,0.6);
```

#### Typography
- Font family: Roboto, system fallbacks
- Consistent font weights: 300 (light), 400 (regular), 500 (medium), 700 (bold)
- Base size: 16px (1rem)

#### Spacing System
Use 8px grid system:
- `4px` - Tight spacing (between related elements)
- `8px` - Default spacing
- `16px` - Section spacing
- `24px` - Large spacing (card padding)

#### Interactive Elements
- All clickable elements must have:
  - Visible hover state
  - Focus indicator for keyboard navigation
  - Minimum touch target: 44x44px on mobile
- Transitions: 150ms for hover, 300ms for animations

### Feedback Patterns

#### Loading States
- Show loading indicator for operations >300ms
- Disable form submission while processing
- Use skeleton loaders for content areas (future enhancement)

#### Success Feedback
- Show snackbar notification on successful operations
- Duration: 4 seconds, dismissible
- Message format: "[Action] successful" (e.g., "Expense added successfully")

#### Error Feedback
- Show inline validation errors below form fields
- Show snackbar for API errors
- Error messages must be user-friendly, not technical

#### Confirmation
- Require confirmation for destructive actions (delete)
- Use modal dialogs for confirmations
- Clear "Cancel" and "Confirm" action labels

### Responsive Behavior
| Breakpoint | Target |
|------------|--------|
| < 480px | Mobile portrait |
| 480-768px | Mobile landscape / Small tablet |
| 768-1024px | Tablet |
| > 1024px | Desktop |

- Tables must be scrollable horizontally on mobile
- Forms should stack vertically on mobile
- Touch-friendly spacing on mobile

---

## Performance Requirements

### Load Time Targets
| Metric | Target | Maximum |
|--------|--------|---------|
| First Contentful Paint (FCP) | < 1.0s | 1.5s |
| Largest Contentful Paint (LCP) | < 1.5s | 2.5s |
| Time to Interactive (TTI) | < 2.0s | 3.0s |
| Total page weight | < 200KB | 500KB |

### Backend Performance
| Operation | Target | Maximum |
|-----------|--------|---------|
| API response (simple query) | < 50ms | 100ms |
| API response (filtered query) | < 100ms | 200ms |
| Database write operation | < 50ms | 100ms |

### Optimization Requirements

#### Frontend
- Minimize HTTP requests (bundle CSS/JS when appropriate)
- Use system fonts as fallback for Roboto
- Lazy load non-critical resources
- Debounce filter inputs (300ms)
- Virtual scrolling for lists >100 items (future)

#### Backend
- Use SQLite WAL mode for concurrent reads
- Index frequently queried columns (date, category)
- Implement pagination for large datasets (future)
- Cache category list (static data)

#### Code-Level
```javascript
// ✅ Good: Efficient DOM updates
function renderExpenses(expenses) {
  const fragment = document.createDocumentFragment();
  expenses.forEach(expense => {
    fragment.appendChild(createExpenseRow(expense));
  });
  tbody.innerHTML = '';
  tbody.appendChild(fragment);
}

// ❌ Bad: Multiple DOM reflows
function renderExpenses(expenses) {
  tbody.innerHTML = '';
  expenses.forEach(expense => {
    tbody.innerHTML += createExpenseRow(expense); // Reflow on each iteration
  });
}
```

### Monitoring
- Log slow operations (>100ms) with context
- Track API response times in development
- Report JavaScript errors to console with stack traces

---

## Code Quality & Style

### JavaScript Style Guide
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line length**: 100 characters maximum
- **Trailing commas**: Required in multiline arrays/objects

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `expenseList` |
| Functions | camelCase | `calculateTotal()` |
| Constants | UPPER_SNAKE | `API_BASE_URL` |
| Classes | PascalCase | `ExpenseModel` |
| Files | kebab-case | `expense-model.js` |
| CSS classes | kebab-case | `btn-primary` |

### Documentation
- JSDoc comments for all public functions
- Inline comments for complex logic only
- README must be kept up to date with setup instructions

```javascript
/**
 * Create a new expense record
 * @param {Object} expense - Expense data
 * @param {string} expense.description - Short description
 * @param {number} expense.amount - Expense amount (non-negative)
 * @param {string} expense.category - Valid category name
 * @param {string} expense.date - Date in YYYY-MM-DD format
 * @returns {Object} Created expense with generated ID
 * @throws {Error} If validation fails
 */
static create(expense) { ... }
```

### Code Review Checklist
- [ ] Tests added/updated for changes
- [ ] No console.log statements (except intentional logging)
- [ ] Error handling implemented
- [ ] User input validated and sanitized
- [ ] No hardcoded values (use constants)
- [ ] Responsive design verified
- [ ] Accessibility checked (keyboard navigation, ARIA)

---

## Security Guidelines

### Input Validation
- Validate all user input on both frontend AND backend
- Never trust client-side validation alone
- Sanitize data before storage and display

### SQL Injection Prevention
```javascript
// ✅ Good: Parameterized query
const stmt = db.prepare('SELECT * FROM expenses WHERE category = ?');
stmt.all(category);

// ❌ Bad: String concatenation
db.exec(`SELECT * FROM expenses WHERE category = '${category}'`);
```

### XSS Prevention
```javascript
// ✅ Good: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ❌ Bad: Direct innerHTML with user data
element.innerHTML = userInput;
```

### Data Protection
- Never log sensitive user data
- Validate file paths to prevent directory traversal
- Set appropriate CORS headers

---

## Git & Collaboration

### Branch Strategy
- `master`/`main` - Production-ready code
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Commit Messages
Follow Conventional Commits format:
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(api): add monthly expense filtering endpoint
fix(frontend): correct currency formatting for large amounts
test(model): add edge case tests for expense validation
docs(readme): update installation instructions
```

### Pull Request Requirements
1. All CI checks must pass
2. At least one approval required
3. No unresolved conversations
4. Branch must be up to date with target
5. PR description must include:
   - Summary of changes
   - Testing performed
   - Screenshots (for UI changes)

---

## Enforcement

This constitution is enforced through:
1. **Automated checks**: CI/CD pipeline validates tests and basic code quality
2. **Code review**: All changes require review before merging
3. **Documentation**: This document serves as the reference for all decisions

Updates to this constitution require team consensus and must be documented in the commit history.

---

*Last updated: December 2025*
