# Expense Tracker — Implementation Tasks

Consolidated tasks derived from `ROADMAP.md` v1.1. One task per stage for minimal overhead.

> **Branching Model:** Use **Gitflow** workflow. See `SPECIFICATION.md` §7 for branch naming and commit conventions.

---

## Task 1: Date Navigation UI (Critical) ✅ COMPLETE
**Goal:** Add date/month selection controls to filter expenses by day or month.

**Status:** ✅ Completed December 4, 2025 | [PR #7](https://github.com/rostislav-sergeenkov/copilot-demo-nodejs/pull/7) | [Issue #1](https://github.com/rostislav-sergeenkov/copilot-demo-nodejs/issues/1) (Closed)

**Files:** `index.html`, `styles.css`, `app.js`

**Implementation:**
- Add date navigation HTML (daily: date picker, prev/next, Today button; monthly: month/year dropdowns, prev/next, This Month button)
- Add CSS for `.date-navigation` and `.date-controls` (flex layout, card style, responsive)
- Add DOM element references and populate month/year dropdowns on init
- Implement `setView(viewType)` to toggle daily/monthly controls and load data
- Implement `loadDailyExpenses(date)` and `loadMonthlyExpenses(year, month)`
- Implement prev/next navigation with future date blocking
- Implement `goToToday()` and `goToThisMonth()` quick buttons
- Update `updateTableTitle()` to show formatted date/month

**Test Criteria:**
- [x] Date navigation controls visible and styled
- [x] Clicking Daily/Monthly shows correct controls
- [x] Table shows only expenses for selected date (daily view)
- [x] Table shows only expenses for selected month (monthly view)
- [x] Prev/Next navigation works correctly
- [x] Next button disabled at today/current month
- [x] Today/This Month buttons reset to current period
- [x] Title shows "Expenses for Dec 4, 2025" or "December 2025"

---

## Task 2: Loading States (High)
**Goal:** Show loading feedback during async operations.

**Files:** `index.html`, `styles.css`, `app.js`

**Implementation:**
- Add loading overlay HTML with spinner (`#loadingOverlay`)
- Add CSS for overlay, spinner animation (`@keyframes spin`), disabled button states
- Implement `showLoading()`, `hideLoading()`, add `state.isLoading`
- Wrap data-loading functions with loading state (view changes, filters)
- Disable Save button and show "Saving..." during form submit

**Test Criteria:**
- [ ] `#loadingOverlay` element exists with spinner
- [ ] Spinner animates (rotates)
- [ ] `.btn:disabled` styled with reduced opacity
- [ ] Spinner shows during API calls (test with throttled network)
- [ ] Save button disabled and shows "Saving..." during submit
- [ ] Button re-enables after save completes

---

## Task 3: Snackbar Enhancement (High)
**Goal:** Make snackbar dismissible with proper accessibility.

**Files:** `index.html`, `styles.css`, `app.js`

**Implementation:**
- Add close button (X) to snackbar
- Add `role="alert"` and `aria-live="polite"` attributes
- Add CSS for close button (inline with message)
- Implement manual dismiss on close button click

**Test Criteria:**
- [ ] Close button visible in snackbar
- [ ] `role="alert"` and `aria-live="polite"` present
- [ ] Clicking X hides snackbar immediately
- [ ] Snackbar still auto-dismisses after 4 seconds

---

## Task 4: API Timeout & Network Errors (High)
**Goal:** Handle slow/failed network requests gracefully.

**Files:** `api.js`

**Implementation:**
- Implement `fetchWithTimeout(url, options)` with 10s AbortController
- Replace all `fetch()` calls with `fetchWithTimeout()` (8 API methods)
- Handle AbortError with "Request timed out. Please try again."
- Handle offline state with `navigator.onLine` check

**Test Criteria:**
- [ ] Requests abort after 10 seconds
- [ ] All 8 API methods use `fetchWithTimeout()`
- [ ] Timeout shows "Request timed out. Please try again."
- [ ] Offline shows "You appear to be offline. Please check your connection."

---

## Task 5: Form Validation (High)
**Goal:** Validate form fields client-side with inline errors.

**Files:** `index.html`, `styles.css`, `app.js`

**Implementation:**
- Add HTML5 constraints: `maxlength="200"` (description), `max="999999.99"` (amount)
- Add inline error containers (`#descriptionError`, `#amountError`, `#categoryError`, `#dateError`)
- Add ARIA: `aria-describedby`, `aria-required`, `aria-invalid`
- Add CSS for `.field-error` and `.input-field.error` states (red border)
- Implement `validateForm(data)` returning `{field: message}` errors object
- Implement `showFieldError(field, msg)` and `clearFieldError(field)`
- Add blur event validation on each form field
- Block form submit if validation fails, display all errors

**Test Criteria:**
- [ ] Description limited to 200 characters
- [ ] Amount limited to 999,999.99
- [ ] Error containers exist with `aria-describedby` links
- [ ] Invalid fields show red border (`.error` class)
- [ ] Error messages appear below invalid fields
- [ ] Validation triggers on blur
- [ ] Form submit blocked when validation fails
- [ ] Future dates rejected with error message

---

## Task 6: Unit Tests (Medium)
**Goal:** Test coverage for new functionality.

**Files:** `app.test.js`, `api.test.js`

**Implementation:**
- Test `setView()`, `loadDailyExpenses()`, `loadMonthlyExpenses()` with mocked API
- Test `validateForm()` for all error conditions (empty, max length, future date, etc.)
- Test `showFieldError()` / `clearFieldError()` DOM changes
- Test `showLoading()` / `hideLoading()` overlay toggle
- Test `fetchWithTimeout()` timeout and offline handling

**Test Criteria:**
- [ ] All new functions have unit tests
- [ ] `validateForm()` tests cover all validation rules
- [ ] Loading state tests verify DOM changes
- [ ] API timeout tests verify error messages
- [ ] All tests pass
- [ ] Coverage >= 80%

---

## Summary

| Task | Priority | Files | Issue | Status |
|------|----------|-------|-------|--------|
| 1. Date Navigation UI | Critical | `index.html`, `styles.css`, `app.js` | [#1](https://github.com/rostislav-sergeenkov/copilot-demo-nodejs/issues/1) | ✅ Complete |
| 2. Loading States | High | `index.html`, `styles.css`, `app.js` | [#3](https://github.com/rostislav-sergeenkov/copilot-demo-nodejs/issues/3) | 🔄 In Progress |
| 3. Snackbar Enhancement | High | `index.html`, `styles.css`, `app.js` | [#5](https://github.com/rostislav-sergeenkov/copilot-demo-nodejs/issues/5) | ⏳ Pending |
| 4. API Timeout & Network | High | `api.js` | [#2](https://github.com/rostislav-sergeenkov/copilot-demo-nodejs/issues/2) | ⏳ Pending |
| 5. Form Validation | High | `index.html`, `styles.css`, `app.js` | [#6](https://github.com/rostislav-sergeenkov/copilot-demo-nodejs/issues/6) | ⏳ Pending |
| 6. Unit Tests | Medium | `app.test.js`, `api.test.js` | [#4](https://github.com/rostislav-sergeenkov/copilot-demo-nodejs/issues/4) | ⏳ Pending |
| 5. Form Validation | High | `index.html`, `styles.css`, `app.js` |
| 6. Unit Tests | Medium | `app.test.js`, `api.test.js` |

**Total: 6 tasks (1 complete, 5 remaining)**

---

## Execution Order

```
✅ Task 1 (Date Nav) → Task 2 (Loading) → Task 3 (Snackbar) → Task 4 (API) → Task 5 (Validation) → Task 6 (Tests)
```

---

## Git Workflow (per task)

```bash
# 1. Create feature branch from develop
git checkout develop && git pull origin develop
git checkout -b feature/<issue-number>-<short-description>

# 2. Implement & commit
git add . && git commit -m "<commit message from task>"

# 3. Push & create PR to develop
git push -u origin feature/<issue-number>-<short-description>
# Create PR with "Closes #<issue-number>" in description

# 4. After merge, cleanup
git checkout develop && git pull origin develop
git branch -d feature/<issue-number>-<short-description>
```

---

## Commit Messages (Conventional Commits)

| Task | Commit Message |
|------|----------------|
| 1 | ✅ `feat(ui): add date navigation with daily/monthly views` |
| 2 | `feat(ux): add loading states and spinner` |
| 3 | `feat(ux): enhance snackbar with dismiss button` |
| 4 | `feat(api): add request timeout and network error handling` |
| 5 | `feat(form): add inline validation with error messages` |
| 6 | `test: add unit tests for new features` |

---

*Tasks Version: 2.2*
*Updated: December 2025*
*Based on: ROADMAP.md v1.1, SPECIFICATION.md v1.2*
