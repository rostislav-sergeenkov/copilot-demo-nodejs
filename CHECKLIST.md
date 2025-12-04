# Expense Tracker — Acceptance Checklist

Verification list for project acceptance based on `requirements.txt` and `TASKS.md`.

---

## Feature Requirements (F1-F5)

### F1: Graphical CRUD UI (Material Design)
- [ ] Application loads without errors
- [ ] Material Design styling applied (Roboto font, color palette, cards, shadows)
- [ ] Responsive layout works on mobile (< 768px) and desktop

### F2: Display Daily Expenses with Date Selection
- [ ] Daily View button exists and is clickable
- [ ] Date picker visible when Daily View selected
- [ ] Selecting a date loads only expenses for that date
- [ ] Prev/Next day navigation works
- [ ] "Today" button resets to current date
- [ ] Cannot navigate to future dates (Next disabled)
- [ ] Table title shows "Expenses for [formatted date]"

### F3: Display Monthly Expenses with Month Selection
- [ ] Monthly View button exists and is clickable
- [ ] Month/Year dropdowns visible when Monthly View selected
- [ ] Selecting month/year loads only expenses for that period
- [ ] Prev/Next month navigation works
- [ ] "This Month" button resets to current month
- [ ] Cannot navigate to future months (Next disabled)
- [ ] Table title shows "Expenses for [Month Year]"

### F4: Filter by Category
- [ ] Category dropdown in filters section
- [ ] Selecting category and clicking Apply filters results
- [ ] Clear button resets filter
- [ ] Table title shows "Filtered Expenses (count)" when filtered

### F5: Create, Update, Delete Expenses
- [ ] FAB (+) button opens Add modal
- [ ] Form has: Description, Amount, Category, Date fields
- [ ] Save creates expense and shows in table
- [ ] Edit icon opens Edit modal with pre-filled data
- [ ] Save updates expense in table
- [ ] Delete icon shows confirmation modal
- [ ] Confirm deletes expense from table
- [ ] Snackbar shows success/error messages

---

## Technical Requirements (T1-T5)

### T1: Node.js Backend
- [ ] Server starts with `npm start`
- [ ] Uses native `http` module (no Express)
- [ ] API responds at `http://localhost:3000/api`

### T2: Vanilla Frontend
- [ ] No framework dependencies (React, Vue, etc.)
- [ ] Pure JavaScript in `app.js` and `api.js`
- [ ] CSS in `styles.css` (no preprocessors required at runtime)

### T3: GitHub Repository
- [ ] Code hosted on GitHub.com
- [ ] Clear project structure (`app/src`, `app/public`, `app/tests`)

### T4: SQLite Database
- [ ] Database file exists (`app/data/expenses.db`)
- [ ] Table has columns: description, amount, category, date
- [ ] Data persists after server restart

### T5: Testing & CI/CD
- [ ] `npm test` runs without errors
- [ ] Backend tests exist (`tests/backend/*.test.js`)
- [ ] Frontend tests exist (`tests/frontend/*.test.js`)
- [ ] GitHub Actions workflow exists (`.github/workflows/ci.yml`)
- [ ] CI runs on PR to main/master

---

## Task Implementation Verification

### Task 1: Date Navigation UI ✓
- [ ] Date navigation controls visible below view toggle
- [ ] Daily: date input + prev/next + Today button
- [ ] Monthly: month dropdown + year dropdown + prev/next + This Month
- [ ] `setView()` toggles between views correctly
- [ ] `loadDailyExpenses()` fetches from `/api/expenses/daily/:date`
- [ ] `loadMonthlyExpenses()` fetches from `/api/expenses/monthly/:year/:month`

### Task 2: Loading States ✓
- [ ] Loading overlay (`#loadingOverlay`) exists in HTML
- [ ] Spinner visible during API calls (test with slow network)
- [ ] Save button shows "Saving..." and is disabled during submit
- [ ] Button re-enables after operation completes

### Task 3: Snackbar Enhancement ✓
- [ ] Snackbar has close button (X)
- [ ] `role="alert"` attribute present
- [ ] `aria-live="polite"` attribute present
- [ ] Clicking X dismisses snackbar immediately
- [ ] Auto-dismiss still works (4 seconds)

### Task 4: API Timeout & Network ✓
- [ ] Requests timeout after 10 seconds
- [ ] Timeout shows: "Request timed out. Please try again."
- [ ] Offline shows: "You appear to be offline. Please check your connection."
- [ ] All API methods use `fetchWithTimeout()`

### Task 5: Form Validation ✓
- [ ] Description: max 200 characters enforced
- [ ] Amount: max 999,999.99 enforced
- [ ] Date: future dates rejected
- [ ] Invalid fields show red border
- [ ] Error messages appear below invalid fields
- [ ] Validation on blur (field loses focus)
- [ ] Form submission blocked if validation fails

### Task 6: Unit Tests ✓
- [ ] All new functions have tests
- [ ] `npm test` passes
- [ ] Coverage >= 80%

---

## Quick Smoke Test (5 minutes)

Run through this sequence to verify basic functionality:

1. **Start Server**
   ```
   cd app && npm start
   ```
   - [ ] Server starts on port 3000

2. **Open Browser**
   - [ ] Navigate to `http://localhost:3000`
   - [ ] Page loads with Material Design UI

3. **Add Expense**
   - [ ] Click + button
   - [ ] Fill: "Test lunch", $25.50, Restaurants, today's date
   - [ ] Click Save
   - [ ] Expense appears in table
   - [ ] Snackbar shows success

4. **Switch Views**
   - [ ] Click "Daily View" → shows today's expenses only
   - [ ] Click "Monthly View" → shows current month's expenses

5. **Edit Expense**
   - [ ] Click edit icon on the expense
   - [ ] Change amount to $30.00
   - [ ] Save → table updates

6. **Delete Expense**
   - [ ] Click delete icon
   - [ ] Confirm deletion
   - [ ] Expense removed from table

7. **Run Tests**
   ```
   npm test
   ```
   - [ ] All tests pass

---

## Sign-off

| Area | Status | Verified By | Date |
|------|--------|-------------|------|
| Feature Requirements (F1-F5) | ☐ Pass / ☐ Fail | | |
| Technical Requirements (T1-T5) | ☐ Pass / ☐ Fail | | |
| Task Implementation (1-6) | ☐ Pass / ☐ Fail | | |
| Smoke Test | ☐ Pass / ☐ Fail | | |

**Final Acceptance:** ☐ Approved / ☐ Rejected

**Notes:**
```


```

---

*Checklist Version: 1.0*
*Created: December 2025*
*Based on: requirements.txt, TASKS.md v2.1*
