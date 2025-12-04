# Expense Tracker — Technical Implementation Roadmap

This document provides a phased implementation plan to address all gaps identified in `SPECIFICATION.md` v1.1. The roadmap prioritizes critical functionality first and organizes work into logical milestones.

---

## Executive Summary

| Phase | Focus Area | Duration | Priority |
|-------|------------|----------|----------|
| 1 | View Toggle & Date Navigation | 2-3 days | Critical |
| 2 | Loading States & UX Feedback | 1-2 days | High |
| 3 | Form Validation & Error Handling | 1-2 days | High |
| 4 | Accessibility Compliance | 1-2 days | Medium |
| 5 | Testing & Quality Assurance | 1-2 days | Medium |
| **Total** | | **6-11 days** | |

---

## Phase 1: View Toggle & Date Navigation (Critical)

**Goal:** Enable daily and monthly views to actually filter and display data for the selected date/period.

### Milestone 1.1: HTML Structure Updates
**File:** `app/public/index.html`

#### Tasks:
- [ ] **1.1.1** Add date picker container after view toggle buttons
- [ ] **1.1.2** Add date navigation controls (prev/next arrows)
- [ ] **1.1.3** Add "Today" / "This Month" quick navigation button
- [ ] **1.1.4** Add month dropdown for monthly view
- [ ] **1.1.5** Add year dropdown for monthly view

#### Implementation Details:
```html
<!-- Insert after view-toggle div -->
<div class="date-navigation">
  <!-- Daily View Controls -->
  <div id="dailyControls" class="date-controls">
    <button id="prevDay" class="btn-icon" aria-label="Previous day">
      <span class="material-icons">chevron_left</span>
    </button>
    <input type="date" id="viewDate" class="input-field" aria-label="Select date">
    <button id="nextDay" class="btn-icon" aria-label="Next day">
      <span class="material-icons">chevron_right</span>
    </button>
    <button id="todayBtn" class="btn btn-text">Today</button>
  </div>
  
  <!-- Monthly View Controls -->
  <div id="monthlyControls" class="date-controls hidden">
    <button id="prevMonth" class="btn-icon" aria-label="Previous month">
      <span class="material-icons">chevron_left</span>
    </button>
    <select id="viewMonth" class="input-select" aria-label="Select month">
      <!-- Populated via JavaScript -->
    </select>
    <select id="viewYear" class="input-select" aria-label="Select year">
      <!-- Populated via JavaScript -->
    </select>
    <button id="nextMonth" class="btn-icon" aria-label="Next month">
      <span class="material-icons">chevron_right</span>
    </button>
    <button id="thisMonthBtn" class="btn btn-text">This Month</button>
  </div>
</div>
```

### Milestone 1.2: CSS Styling
**File:** `app/public/css/styles.css`

#### Tasks:
- [ ] **1.2.1** Add `.date-navigation` container styles
- [ ] **1.2.2** Add `.date-controls` flex layout
- [ ] **1.2.3** Style navigation arrows
- [ ] **1.2.4** Add responsive styles for mobile

#### Implementation Details:
```css
.date-navigation {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.date-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--card-background);
  border-radius: 8px;
  box-shadow: var(--shadow-1);
}

.date-controls .input-field,
.date-controls .input-select {
  width: auto;
}
```

### Milestone 1.3: JavaScript Logic
**File:** `app/public/js/app.js`

#### Tasks:
- [ ] **1.3.1** Add DOM element references for new controls
- [ ] **1.3.2** Implement `setView(viewType)` function
- [ ] **1.3.3** Implement `loadDailyExpenses(date)` function
- [ ] **1.3.4** Implement `loadMonthlyExpenses(year, month)` function
- [ ] **1.3.5** Implement `navigateDate(direction)` for daily view
- [ ] **1.3.6** Implement `navigateMonth(direction)` for monthly view
- [ ] **1.3.7** Implement `goToToday()` quick navigation
- [ ] **1.3.8** Implement `goToThisMonth()` quick navigation
- [ ] **1.3.9** Disable next navigation when reaching today/current month
- [ ] **1.3.10** Update `updateTableTitle()` to show selected date/month
- [ ] **1.3.11** Populate month/year dropdowns dynamically
- [ ] **1.3.12** Add event listeners for all new controls

#### Implementation Details:
```javascript
// New DOM elements
elements.viewDate = document.getElementById('viewDate');
elements.viewMonth = document.getElementById('viewMonth');
elements.viewYear = document.getElementById('viewYear');
elements.dailyControls = document.getElementById('dailyControls');
elements.monthlyControls = document.getElementById('monthlyControls');
elements.prevDay = document.getElementById('prevDay');
elements.nextDay = document.getElementById('nextDay');
elements.prevMonth = document.getElementById('prevMonth');
elements.nextMonth = document.getElementById('nextMonth');
elements.todayBtn = document.getElementById('todayBtn');
elements.thisMonthBtn = document.getElementById('thisMonthBtn');

// View switching
function setView(viewType) {
  state.currentView = viewType;
  
  // Update button states
  elements.dailyViewBtn.classList.toggle('active', viewType === 'daily');
  elements.monthlyViewBtn.classList.toggle('active', viewType === 'monthly');
  
  // Show/hide appropriate controls
  elements.dailyControls.classList.toggle('hidden', viewType !== 'daily');
  elements.monthlyControls.classList.toggle('hidden', viewType !== 'monthly');
  
  // Load appropriate data
  if (viewType === 'daily') {
    loadDailyExpenses(state.selectedDate);
  } else {
    loadMonthlyExpenses(state.selectedYear, state.selectedMonth);
  }
}

// Load daily expenses
async function loadDailyExpenses(date) {
  try {
    state.selectedDate = date;
    elements.viewDate.value = date;
    state.expenses = await ExpenseAPI.getDaily(date);
    renderExpenses();
    updateTableTitle();
    updateNavigationState();
  } catch (error) {
    showSnackbar('Failed to load daily expenses: ' + error.message);
  }
}

// Load monthly expenses
async function loadMonthlyExpenses(year, month) {
  try {
    state.selectedYear = year;
    state.selectedMonth = month;
    elements.viewMonth.value = month;
    elements.viewYear.value = year;
    state.expenses = await ExpenseAPI.getMonthly(year, month);
    renderExpenses();
    updateTableTitle();
    updateNavigationState();
  } catch (error) {
    showSnackbar('Failed to load monthly expenses: ' + error.message);
  }
}

// Prevent navigation to future
function updateNavigationState() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Daily view: disable next if viewing today
  elements.nextDay.disabled = state.selectedDate >= todayStr;
  
  // Monthly view: disable next if viewing current month
  const isCurrentMonth = state.selectedYear === today.getFullYear() 
    && state.selectedMonth === (today.getMonth() + 1);
  elements.nextMonth.disabled = isCurrentMonth;
}
```

### Milestone 1.4: Update Table Title Display
**File:** `app/public/js/app.js`

#### Tasks:
- [ ] **1.4.1** Format date as "Expenses for Dec 3, 2025" for daily view
- [ ] **1.4.2** Format date as "Expenses for December 2025" for monthly view
- [ ] **1.4.3** Show expense count when filtered

#### Implementation Details:
```javascript
function updateTableTitle() {
  let title = '';
  
  if (state.filters.category || state.filters.startDate || state.filters.endDate) {
    title = `Filtered Expenses (${state.expenses.length})`;
  } else if (state.currentView === 'daily') {
    const date = new Date(state.selectedDate + 'T00:00:00');
    title = `Expenses for ${date.toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    })}`;
  } else {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    title = `Expenses for ${monthNames[state.selectedMonth - 1]} ${state.selectedYear}`;
  }
  
  elements.tableTitle.textContent = title;
}
```

### Acceptance Criteria (Phase 1):
- [ ] Daily view shows expenses for selected date only
- [ ] Monthly view shows expenses for selected month only
- [ ] Date picker allows selecting any date (up to today)
- [ ] Month/year dropdowns allow selecting any month (up to current)
- [ ] Prev/Next navigation works correctly
- [ ] Cannot navigate to future dates
- [ ] "Today" / "This Month" buttons work
- [ ] Table title updates to reflect selection

---

## Phase 2: Loading States & UX Feedback (High)

**Goal:** Provide visual feedback during async operations to improve user experience.

### Milestone 2.1: Loading Spinner Component
**File:** `app/public/index.html`

#### Tasks:
- [ ] **2.1.1** Add loading spinner overlay component
- [ ] **2.1.2** Add loading text to submit buttons

#### Implementation Details:
```html
<!-- Add before closing </body> tag -->
<div id="loadingOverlay" class="loading-overlay hidden" role="status" aria-label="Loading">
  <div class="loading-spinner"></div>
</div>
```

### Milestone 2.2: CSS for Loading States
**File:** `app/public/css/styles.css`

#### Tasks:
- [ ] **2.2.1** Add loading overlay styles
- [ ] **2.2.2** Add spinner animation
- [ ] **2.2.3** Add disabled button states
- [ ] **2.2.4** Add button loading text styles

#### Implementation Details:
```css
/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--primary-light);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Disabled button state */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.btn.loading {
  position: relative;
  color: transparent;
}

.btn.loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

### Milestone 2.3: JavaScript Loading State Management
**File:** `app/public/js/app.js`

#### Tasks:
- [ ] **2.3.1** Add `state.isLoading` flag
- [ ] **2.3.2** Implement `showLoading()` function
- [ ] **2.3.3** Implement `hideLoading()` function
- [ ] **2.3.4** Implement `withLoading(asyncFn)` wrapper
- [ ] **2.3.5** Add loading state to form submission
- [ ] **2.3.6** Add loading state to delete operation
- [ ] **2.3.7** Add loading state to filter application
- [ ] **2.3.8** Add loading state to view changes

#### Implementation Details:
```javascript
// Add to state
state.isLoading = false;

// Add to elements
elements.loadingOverlay = document.getElementById('loadingOverlay');
elements.saveBtn = document.getElementById('saveBtn');

// Loading functions
function showLoading() {
  state.isLoading = true;
  elements.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  state.isLoading = false;
  elements.loadingOverlay.classList.add('hidden');
}

async function withLoading(asyncFn) {
  showLoading();
  try {
    return await asyncFn();
  } finally {
    hideLoading();
  }
}

// Disable button during submission
function disableSubmit() {
  elements.saveBtn.disabled = true;
  elements.saveBtn.textContent = 'Saving...';
}

function enableSubmit() {
  elements.saveBtn.disabled = false;
  elements.saveBtn.textContent = 'Save';
}
```

### Milestone 2.4: Snackbar Enhancements
**File:** `app/public/index.html` + `app/public/js/app.js`

#### Tasks:
- [ ] **2.4.1** Add close button to snackbar
- [ ] **2.4.2** Add ARIA attributes to snackbar
- [ ] **2.4.3** Implement manual dismiss functionality

#### Implementation Details:
```html
<!-- Update snackbar structure -->
<div id="snackbar" class="snackbar hidden" role="alert" aria-live="polite">
  <span id="snackbarMessage"></span>
  <button id="snackbarClose" class="btn-icon snackbar-close" aria-label="Dismiss">
    <span class="material-icons">close</span>
  </button>
</div>
```

### Acceptance Criteria (Phase 2):
- [ ] Loading spinner appears during API calls > 300ms
- [ ] Submit button shows "Saving..." and is disabled during form submission
- [ ] Loading state during data fetch operations
- [ ] Snackbar can be manually dismissed
- [ ] Snackbar has proper ARIA attributes

---

## Phase 3: Form Validation & Error Handling (High)

**Goal:** Implement comprehensive client-side validation and error handling.

### Milestone 3.1: API Client Enhancements
**File:** `app/public/js/api.js`

#### Tasks:
- [ ] **3.1.1** Add 10-second request timeout
- [ ] **3.1.2** Implement `fetchWithTimeout` wrapper
- [ ] **3.1.3** Handle AbortError for timeouts
- [ ] **3.1.4** Handle network offline detection

#### Implementation Details:
```javascript
const API_TIMEOUT = 10000; // 10 seconds

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    if (!navigator.onLine) {
      throw new Error('You appear to be offline. Please check your connection.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Replace all fetch() calls with fetchWithTimeout()
```

### Milestone 3.2: HTML Form Enhancements
**File:** `app/public/index.html`

#### Tasks:
- [ ] **3.2.1** Add `maxlength="200"` to description field
- [ ] **3.2.2** Add `max="999999.99"` to amount field
- [ ] **3.2.3** Add inline error message containers
- [ ] **3.2.4** Add ARIA attributes for validation

#### Implementation Details:
```html
<div class="form-group">
  <label for="description" class="input-label">Description *</label>
  <input type="text" id="description" class="input-field" required 
         maxlength="200"
         aria-required="true"
         aria-describedby="descriptionError"
         placeholder="e.g., Lunch at restaurant">
  <span id="descriptionError" class="field-error hidden" role="alert"></span>
</div>

<div class="form-group">
  <label for="amount" class="input-label">Amount *</label>
  <div class="input-with-prefix">
    <span class="input-prefix">$</span>
    <input type="number" id="amount" class="input-field" required 
           min="0" max="999999.99" step="0.01"
           aria-required="true"
           aria-describedby="amountError"
           placeholder="0.00">
  </div>
  <span id="amountError" class="field-error hidden" role="alert"></span>
</div>
```

### Milestone 3.3: CSS for Validation States
**File:** `app/public/css/styles.css`

#### Tasks:
- [ ] **3.3.1** Add error state for inputs (red border)
- [ ] **3.3.2** Add field error message styles
- [ ] **3.3.3** Add error icon indicator

#### Implementation Details:
```css
/* Error states */
.input-field.error,
.input-select.error {
  border-color: var(--error-color);
  background-color: #fff5f5;
}

.input-field.error:focus,
.input-select.error:focus {
  box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.2);
}

.field-error {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--error-color);
  font-size: 12px;
  margin-top: 4px;
}

.field-error::before {
  content: 'error';
  font-family: 'Material Icons';
  font-size: 16px;
}
```

### Milestone 3.4: JavaScript Validation Logic
**File:** `app/public/js/app.js`

#### Tasks:
- [ ] **3.4.1** Add `state.formErrors` object
- [ ] **3.4.2** Implement `validateForm(data)` function
- [ ] **3.4.3** Implement `showFieldError(field, message)` function
- [ ] **3.4.4** Implement `clearFieldError(field)` function
- [ ] **3.4.5** Implement `clearAllErrors()` function
- [ ] **3.4.6** Add blur event listeners for real-time validation
- [ ] **3.4.7** Prevent form submission if validation fails
- [ ] **3.4.8** Handle date constraint (not future, after 2000)

#### Implementation Details:
```javascript
// Add to state
state.formErrors = {};

function validateForm(data) {
  const errors = {};
  
  // Description validation
  if (!data.description?.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.length > 200) {
    errors.description = 'Description must not exceed 200 characters';
  }
  
  // Amount validation
  const amount = parseFloat(data.amount);
  if (isNaN(amount)) {
    errors.amount = 'Amount is required';
  } else if (amount < 0) {
    errors.amount = 'Amount must be non-negative';
  } else if (amount > 999999.99) {
    errors.amount = 'Amount must not exceed 999,999.99';
  }
  
  // Category validation
  if (!data.category) {
    errors.category = 'Category is required';
  }
  
  // Date validation
  if (!data.date) {
    errors.date = 'Date is required';
  } else {
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (selectedDate > today) {
      errors.date = 'Date cannot be in the future';
    }
    
    const minDate = new Date('2000-01-01');
    if (selectedDate < minDate) {
      errors.date = 'Date must be on or after January 1, 2000';
    }
  }
  
  return errors;
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}Error`);
  
  if (field && errorEl) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}Error`);
  
  if (field && errorEl) {
    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
}
```

### Acceptance Criteria (Phase 3):
- [ ] API requests timeout after 10 seconds
- [ ] Network errors show user-friendly messages
- [ ] Inline validation on blur for all form fields
- [ ] Red border on invalid fields
- [ ] Error messages appear below invalid fields
- [ ] Form cannot submit with validation errors
- [ ] Description limited to 200 characters
- [ ] Amount limited to 999,999.99
- [ ] Future dates rejected
- [ ] Dates before 2000 rejected

---

## Phase 4: Accessibility Compliance (Medium)

**Goal:** Meet WCAG 2.1 Level AA requirements for all components.

### Milestone 4.1: Keyboard Navigation
**Files:** `app/public/js/app.js`, `app/public/css/styles.css`

#### Tasks:
- [ ] **4.1.1** Implement focus trap for modals
- [ ] **4.1.2** Return focus to trigger element on modal close
- [ ] **4.1.3** Add visible focus indicators (`:focus-visible`)
- [ ] **4.1.4** Enable Enter key on table rows for edit
- [ ] **4.1.5** Handle Escape key for modal close

#### Implementation Details:
```javascript
// Focus trap implementation
function trapFocus(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  function handleKeyDown(e) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  }
  
  modal.addEventListener('keydown', handleKeyDown);
  return () => modal.removeEventListener('keydown', handleKeyDown);
}
```

```css
/* Focus visible styles */
:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.3);
}

.input-field:focus-visible,
.input-select:focus-visible {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}
```

### Milestone 4.2: ARIA Attributes
**File:** `app/public/index.html`

#### Tasks:
- [ ] **4.2.1** Add `role="dialog"` and `aria-modal="true"` to modals
- [ ] **4.2.2** Add `aria-labelledby` to modals
- [ ] **4.2.3** Add `role="alertdialog"` to delete confirmation
- [ ] **4.2.4** Add `aria-label` to icon buttons
- [ ] **4.2.5** Add `aria-label` to data table
- [ ] **4.2.6** Add `role="status"` to loading spinner

#### Implementation Details:
```html
<!-- Edit modal -->
<div id="expenseModal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="modalTitle">

<!-- Delete modal -->
<div id="deleteModal" class="modal hidden" role="alertdialog" aria-modal="true" aria-describedby="deleteWarning">
  <p id="deleteWarning">Are you sure you want to delete this expense? This action cannot be undone.</p>

<!-- Table -->
<table class="data-table" id="expensesTable" aria-label="Expenses table">

<!-- Icon buttons -->
<button class="btn-icon" onclick="openEditModal(${expense.id})" aria-label="Edit expense">
<button class="btn-icon" onclick="openDeleteModal(${expense.id})" aria-label="Delete expense">
```

### Milestone 4.3: Screen Reader Support
**File:** `app/public/js/app.js`

#### Tasks:
- [ ] **4.3.1** Announce snackbar messages to screen readers
- [ ] **4.3.2** Announce form errors when they appear
- [ ] **4.3.3** Announce table updates after filtering

### Acceptance Criteria (Phase 4):
- [ ] All interactive elements have visible focus indicators
- [ ] Tab navigation works correctly in all modals
- [ ] Focus trapped within open modals
- [ ] Focus returns to trigger on modal close
- [ ] All modals have appropriate ARIA roles
- [ ] All icon buttons have aria-labels
- [ ] Snackbar announced by screen readers
- [ ] Form errors announced when displayed

---

## Phase 5: Testing & Quality Assurance (Medium)

**Goal:** Ensure all new functionality is properly tested.

### Milestone 5.1: New Frontend Tests
**File:** `app/tests/frontend/app.test.js`

#### Tasks:
- [ ] **5.1.1** Test `setView()` switches between daily/monthly
- [ ] **5.1.2** Test `loadDailyExpenses()` calls API correctly
- [ ] **5.1.3** Test `loadMonthlyExpenses()` calls API correctly
- [ ] **5.1.4** Test `navigateDate()` for prev/next day
- [ ] **5.1.5** Test navigation disabled for future dates
- [ ] **5.1.6** Test `validateForm()` returns correct errors
- [ ] **5.1.7** Test `showFieldError()` displays error message
- [ ] **5.1.8** Test `showLoading()` / `hideLoading()`
- [ ] **5.1.9** Test focus trap implementation

### Milestone 5.2: API Client Tests
**File:** `app/tests/frontend/api.test.js`

#### Tasks:
- [ ] **5.2.1** Test request timeout behavior
- [ ] **5.2.2** Test network error handling
- [ ] **5.2.3** Test AbortError handling

### Milestone 5.3: Integration Tests
**File:** `app/tests/backend/api.routes.test.js`

#### Tasks:
- [ ] **5.3.1** Test validation error responses (400)
- [ ] **5.3.2** Test error code format in responses

### Acceptance Criteria (Phase 5):
- [ ] All new functions have unit tests
- [ ] Test coverage remains >= 80%
- [ ] All tests pass in CI pipeline
- [ ] No skipped tests

---

## Implementation Order Summary

```
Week 1: Core Functionality
├── Day 1-2: Phase 1.1-1.2 (HTML/CSS for date navigation)
├── Day 2-3: Phase 1.3-1.4 (JavaScript view logic)

Week 2: UX & Validation
├── Day 4: Phase 2 (Loading states)
├── Day 5-6: Phase 3 (Form validation & error handling)

Week 3: Polish & Testing
├── Day 7-8: Phase 4 (Accessibility)
├── Day 9-10: Phase 5 (Testing)
```

---

## Dependencies & Prerequisites

| Phase | Depends On | Files Modified |
|-------|------------|----------------|
| 1 | None | `index.html`, `styles.css`, `app.js` |
| 2 | Phase 1 complete | `index.html`, `styles.css`, `app.js` |
| 3 | Phase 2 complete | `api.js`, `index.html`, `styles.css`, `app.js` |
| 4 | Phases 1-3 complete | `index.html`, `styles.css`, `app.js` |
| 5 | Phases 1-4 complete | Test files |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Date picker browser compatibility | Medium | Low | Use native `<input type="date">`, fallback for older browsers |
| Focus trap complexity | Low | Medium | Use established pattern, test thoroughly |
| Timeout breaking existing flows | Low | High | Set appropriate timeout (10s), test all API calls |
| Breaking existing tests | Medium | Medium | Run tests after each phase |

---

## Definition of Done

Each phase is considered complete when:
1. ✅ All tasks in the milestone checklist are completed
2. ✅ All acceptance criteria pass manual testing
3. ✅ New tests are written and passing
4. ✅ No regression in existing functionality
5. ✅ Code follows CONSTITUTION.md standards
6. ✅ Changes documented (if needed)

---

## Quick Start

To begin implementation:

1. **Start with Phase 1, Milestone 1.1** (HTML structure for date navigation)
2. Run existing tests to ensure no regression: `npm test`
3. Implement each milestone sequentially within a phase
4. Commit after each milestone with descriptive message
5. Run tests after each milestone

---

*Roadmap Version: 1.0*
*Created: December 2025*
*Based on: SPECIFICATION.md v1.1*
