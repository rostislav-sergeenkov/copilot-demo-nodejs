/**
 * Main application logic for Expense Tracker
 */

// Application state
const state = {
  expenses: [],
  categories: [],
  currentView: 'daily', // 'daily' or 'monthly'
  selectedDate: new Date().toISOString().split('T')[0],
  selectedYear: new Date().getFullYear(),
  selectedMonth: new Date().getMonth() + 1,
  filters: {
    category: '',
    startDate: '',
    endDate: ''
  },
  editingId: null,
  deleteId: null,
  isLoading: false
};

// DOM Elements
const elements = {
  filterCategory: document.getElementById('filterCategory'),
  filterStartDate: document.getElementById('filterStartDate'),
  filterEndDate: document.getElementById('filterEndDate'),
  applyFilters: document.getElementById('applyFilters'),
  clearFilters: document.getElementById('clearFilters'),
  dailyViewBtn: document.getElementById('dailyViewBtn'),
  monthlyViewBtn: document.getElementById('monthlyViewBtn'),
  tableTitle: document.getElementById('tableTitle'),
  expensesTableBody: document.getElementById('expensesTableBody'),
  totalAmount: document.getElementById('totalAmount'),
  emptyState: document.getElementById('emptyState'),
  expensesTable: document.getElementById('expensesTable'),
  addExpenseBtn: document.getElementById('addExpenseBtn'),
  expenseModal: document.getElementById('expenseModal'),
  modalTitle: document.getElementById('modalTitle'),
  expenseForm: document.getElementById('expenseForm'),
  expenseId: document.getElementById('expenseId'),
  description: document.getElementById('description'),
  amount: document.getElementById('amount'),
  category: document.getElementById('category'),
  date: document.getElementById('date'),
  deleteModal: document.getElementById('deleteModal'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
  snackbar: document.getElementById('snackbar'),
  snackbarMessage: document.getElementById('snackbarMessage'),
  snackbarClose: document.getElementById('snackbarClose'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  saveBtn: document.getElementById('saveBtn'),
  // Date Navigation Elements
  dailyControls: document.getElementById('dailyControls'),
  monthlyControls: document.getElementById('monthlyControls'),
  datePicker: document.getElementById('datePicker'),
  prevDayBtn: document.getElementById('prevDayBtn'),
  nextDayBtn: document.getElementById('nextDayBtn'),
  todayBtn: document.getElementById('todayBtn'),
  monthSelect: document.getElementById('monthSelect'),
  yearSelect: document.getElementById('yearSelect'),
  prevMonthBtn: document.getElementById('prevMonthBtn'),
  nextMonthBtn: document.getElementById('nextMonthBtn'),
  thisMonthBtn: document.getElementById('thisMonthBtn')
};

// Category CSS class mapping
const categoryClassMap = {
  'Groceries': 'category-groceries',
  'Transport': 'category-transport',
  'Housing and Utilities': 'category-housing',
  'Restaurants and Cafes': 'category-restaurants',
  'Health and Medicine': 'category-health',
  'Clothing & Footwear': 'category-clothing',
  'Entertainment': 'category-entertainment'
};

/**
 * Show loading overlay
 */
function showLoading() {
  state.isLoading = true;
  elements.loadingOverlay.classList.remove('hidden');
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  state.isLoading = false;
  elements.loadingOverlay.classList.add('hidden');
}

/**
 * Initialize the application
 */
async function init() {
  try {
    showLoading();
    await loadCategories();
    populateYearDropdown();
    initializeDateControls();
    await loadExpenses();
    setupEventListeners();
    setDefaultDate();
  } catch (error) {
    showSnackbar('Failed to initialize application: ' + error.message);
  } finally {
    hideLoading();
  }
}

/**
 * Load categories from API and populate dropdowns
 */
async function loadCategories() {
  try {
    state.categories = await ExpenseAPI.getCategories();
    populateCategoryDropdowns();
  } catch (error) {
    console.error('Failed to load categories:', error);
    // Use default categories if API fails
    state.categories = [
      'Groceries',
      'Transport',
      'Housing and Utilities',
      'Restaurants and Cafes',
      'Health and Medicine',
      'Clothing & Footwear',
      'Entertainment'
    ];
    populateCategoryDropdowns();
  }
}

/**
 * Populate category dropdowns
 */
function populateCategoryDropdowns() {
  // Filter dropdown
  elements.filterCategory.innerHTML = '<option value="">All Categories</option>';
  state.categories.forEach(cat => {
    elements.filterCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
  });

  // Form dropdown
  elements.category.innerHTML = '<option value="">Select a category</option>';
  state.categories.forEach(cat => {
    elements.category.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

/**
 * Load expenses based on current view and filters
 */
async function loadExpenses() {
  const wasLoading = state.isLoading;
  try {
    if (!wasLoading) showLoading();
    // If filters are applied, use filters
    if (state.filters.category || state.filters.startDate || state.filters.endDate) {
      const filters = { ...state.filters };
      state.expenses = await ExpenseAPI.getAll(filters);
    } else if (state.currentView === 'daily') {
      // Load daily expenses
      state.expenses = await ExpenseAPI.getDaily(state.selectedDate);
    } else {
      // Load monthly expenses
      state.expenses = await ExpenseAPI.getMonthly(state.selectedYear, state.selectedMonth);
    }
    renderExpenses();
    updateTableTitle();
  } catch (error) {
    showSnackbar('Failed to load expenses: ' + error.message);
  } finally {
    if (!wasLoading) hideLoading();
  }
}

/**
 * Render expenses in the table
 */
function renderExpenses() {
  const tbody = elements.expensesTableBody;
  tbody.innerHTML = '';

  if (state.expenses.length === 0) {
    elements.expensesTable.classList.add('hidden');
    elements.emptyState.classList.remove('hidden');
    elements.totalAmount.textContent = '$0.00';
    return;
  }

  elements.expensesTable.classList.remove('hidden');
  elements.emptyState.classList.add('hidden');

  let total = 0;

  state.expenses.forEach(expense => {
    total += expense.amount;
    const row = document.createElement('tr');
    const categoryClass = categoryClassMap[expense.category] || '';
    
    row.innerHTML = `
      <td>${formatDate(expense.date)}</td>
      <td>${escapeHtml(expense.description)}</td>
      <td><span class="category-badge ${categoryClass}">${escapeHtml(expense.category)}</span></td>
      <td class="text-right">${formatCurrency(expense.amount)}</td>
      <td class="text-center">
        <div class="action-buttons">
          <button class="btn-icon" onclick="openEditModal(${expense.id})" title="Edit">
            <span class="material-icons">edit</span>
          </button>
          <button class="btn-icon" onclick="openDeleteModal(${expense.id})" title="Delete">
            <span class="material-icons">delete</span>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });

  elements.totalAmount.textContent = formatCurrency(total);
}

/**
 * Update the table title based on current view
 */
function updateTableTitle() {
  if (state.filters.category || state.filters.startDate || state.filters.endDate) {
    elements.tableTitle.textContent = 'Filtered Expenses';
  } else if (state.currentView === 'daily') {
    const date = new Date(state.selectedDate + 'T00:00:00');
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
    elements.tableTitle.textContent = `Expenses for ${formattedDate}`;
  } else {
    const date = new Date(state.selectedYear, state.selectedMonth - 1, 1);
    const formattedMonth = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long'
    }).format(date);
    elements.tableTitle.textContent = formattedMonth;
  }
}

/**
 * Set default date in the form
 */
function setDefaultDate() {
  elements.date.value = state.selectedDate;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Filter buttons
  elements.applyFilters.addEventListener('click', applyFilters);
  elements.clearFilters.addEventListener('click', clearFilters);

  // View toggle
  elements.dailyViewBtn.addEventListener('click', () => setView('daily'));
  elements.monthlyViewBtn.addEventListener('click', () => setView('monthly'));

  // Date Navigation - Daily
  elements.datePicker.addEventListener('change', handleDatePickerChange);
  elements.prevDayBtn.addEventListener('click', goToPreviousDay);
  elements.nextDayBtn.addEventListener('click', goToNextDay);
  elements.todayBtn.addEventListener('click', goToToday);

  // Date Navigation - Monthly
  elements.monthSelect.addEventListener('change', handleMonthChange);
  elements.yearSelect.addEventListener('change', handleYearChange);
  elements.prevMonthBtn.addEventListener('click', goToPreviousMonth);
  elements.nextMonthBtn.addEventListener('click', goToNextMonth);
  elements.thisMonthBtn.addEventListener('click', goToThisMonth);

  // Add expense button
  elements.addExpenseBtn.addEventListener('click', openModal);

  // Form submission
  elements.expenseForm.addEventListener('submit', handleFormSubmit);

  // Modal backdrop clicks
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', () => {
      closeModal();
      closeDeleteModal();
    });
  });

  // Delete confirmation
  elements.confirmDeleteBtn.addEventListener('click', confirmDelete);

  // Snackbar close button
  elements.snackbarClose.addEventListener('click', hideSnackbar);

  // Keyboard events
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeDeleteModal();
    }
  });
}

/**
 * Apply filters
 */
async function applyFilters() {
  state.filters.category = elements.filterCategory.value;
  state.filters.startDate = elements.filterStartDate.value;
  state.filters.endDate = elements.filterEndDate.value;
  await loadExpenses();
}

/**
 * Clear filters
 */
async function clearFilters() {
  state.filters = { category: '', startDate: '', endDate: '' };
  elements.filterCategory.value = '';
  elements.filterStartDate.value = '';
  elements.filterEndDate.value = '';
  await loadExpenses();
}

/**
 * Set the current view
 */
function setView(view) {
  state.currentView = view;
  
  if (view === 'daily') {
    elements.dailyViewBtn.classList.add('active');
    elements.monthlyViewBtn.classList.remove('active');
    elements.dailyControls.classList.remove('hidden');
    elements.monthlyControls.classList.add('hidden');
  } else {
    elements.dailyViewBtn.classList.remove('active');
    elements.monthlyViewBtn.classList.add('active');
    elements.dailyControls.classList.add('hidden');
    elements.monthlyControls.classList.remove('hidden');
  }
  
  // Clear filters when switching views
  state.filters = { category: '', startDate: '', endDate: '' };
  elements.filterCategory.value = '';
  elements.filterStartDate.value = '';
  elements.filterEndDate.value = '';
  
  loadExpenses();
}

/**
 * Populate year dropdown with years (current year - 5 to current year)
 */
function populateYearDropdown() {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 5;
  
  elements.yearSelect.innerHTML = '';
  for (let year = currentYear; year >= startYear; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    elements.yearSelect.appendChild(option);
  }
  elements.yearSelect.value = state.selectedYear;
}

/**
 * Initialize date controls with current values
 */
function initializeDateControls() {
  // Set date picker to selected date
  elements.datePicker.value = state.selectedDate;
  elements.datePicker.max = new Date().toISOString().split('T')[0]; // Block future dates
  
  // Set month/year dropdowns
  elements.monthSelect.value = state.selectedMonth;
  elements.yearSelect.value = state.selectedYear;
  
  // Update navigation button states
  updateDailyNavigationButtons();
  updateMonthlyNavigationButtons();
}

/**
 * Handle date picker change
 */
async function handleDatePickerChange() {
  state.selectedDate = elements.datePicker.value;
  updateDailyNavigationButtons();
  await loadExpenses();
}

/**
 * Go to previous day
 */
async function goToPreviousDay() {
  const date = new Date(state.selectedDate + 'T00:00:00');
  date.setDate(date.getDate() - 1);
  state.selectedDate = date.toISOString().split('T')[0];
  elements.datePicker.value = state.selectedDate;
  updateDailyNavigationButtons();
  await loadExpenses();
}

/**
 * Go to next day
 */
async function goToNextDay() {
  const date = new Date(state.selectedDate + 'T00:00:00');
  date.setDate(date.getDate() + 1);
  state.selectedDate = date.toISOString().split('T')[0];
  elements.datePicker.value = state.selectedDate;
  updateDailyNavigationButtons();
  await loadExpenses();
}

/**
 * Go to today
 */
async function goToToday() {
  state.selectedDate = new Date().toISOString().split('T')[0];
  elements.datePicker.value = state.selectedDate;
  updateDailyNavigationButtons();
  await loadExpenses();
}

/**
 * Handle month dropdown change
 */
async function handleMonthChange() {
  state.selectedMonth = parseInt(elements.monthSelect.value);
  updateMonthlyNavigationButtons();
  await loadExpenses();
}

/**
 * Handle year dropdown change
 */
async function handleYearChange() {
  state.selectedYear = parseInt(elements.yearSelect.value);
  updateMonthlyNavigationButtons();
  await loadExpenses();
}

/**
 * Go to previous month
 */
async function goToPreviousMonth() {
  if (state.selectedMonth === 1) {
    state.selectedMonth = 12;
    state.selectedYear--;
  } else {
    state.selectedMonth--;
  }
  elements.monthSelect.value = state.selectedMonth;
  elements.yearSelect.value = state.selectedYear;
  updateMonthlyNavigationButtons();
  await loadExpenses();
}

/**
 * Go to next month
 */
async function goToNextMonth() {
  if (state.selectedMonth === 12) {
    state.selectedMonth = 1;
    state.selectedYear++;
  } else {
    state.selectedMonth++;
  }
  elements.monthSelect.value = state.selectedMonth;
  elements.yearSelect.value = state.selectedYear;
  updateMonthlyNavigationButtons();
  await loadExpenses();
}

/**
 * Go to current month
 */
async function goToThisMonth() {
  const now = new Date();
  state.selectedYear = now.getFullYear();
  state.selectedMonth = now.getMonth() + 1;
  elements.monthSelect.value = state.selectedMonth;
  elements.yearSelect.value = state.selectedYear;
  updateMonthlyNavigationButtons();
  await loadExpenses();
}

/**
 * Update daily navigation button states (disable next if at today)
 */
function updateDailyNavigationButtons() {
  const today = new Date().toISOString().split('T')[0];
  const selectedDate = state.selectedDate;
  
  // Disable next button if selected date is today or in the future
  elements.nextDayBtn.disabled = selectedDate >= today;
}

/**
 * Update monthly navigation button states (disable next if at current month)
 */
function updateMonthlyNavigationButtons() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // Disable next button if at current month or beyond
  const isCurrentOrFuture = 
    state.selectedYear > currentYear || 
    (state.selectedYear === currentYear && state.selectedMonth >= currentMonth);
  
  elements.nextMonthBtn.disabled = isCurrentOrFuture;
}

/**
 * Open the expense modal for adding
 */
function openModal() {
  state.editingId = null;
  elements.modalTitle.textContent = 'Add Expense';
  elements.expenseForm.reset();
  setDefaultDate();
  elements.expenseModal.classList.remove('hidden');
  elements.description.focus();
}

/**
 * Open the expense modal for editing
 */
async function openEditModal(id) {
  try {
    const expense = await ExpenseAPI.getById(id);
    state.editingId = id;
    elements.modalTitle.textContent = 'Edit Expense';
    elements.expenseId.value = expense.id;
    elements.description.value = expense.description;
    elements.amount.value = expense.amount;
    elements.category.value = expense.category;
    elements.date.value = expense.date;
    elements.expenseModal.classList.remove('hidden');
    elements.description.focus();
  } catch (error) {
    showSnackbar('Failed to load expense: ' + error.message);
  }
}

/**
 * Close the expense modal
 */
function closeModal() {
  elements.expenseModal.classList.add('hidden');
  elements.expenseForm.reset();
  state.editingId = null;
}

/**
 * Open the delete confirmation modal
 */
function openDeleteModal(id) {
  state.deleteId = id;
  elements.deleteModal.classList.remove('hidden');
}

/**
 * Close the delete confirmation modal
 */
function closeDeleteModal() {
  elements.deleteModal.classList.add('hidden');
  state.deleteId = null;
}

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  const expenseData = {
    description: elements.description.value.trim(),
    amount: parseFloat(elements.amount.value),
    category: elements.category.value,
    date: elements.date.value
  };

  // Disable save button and show "Saving..."
  const originalText = elements.saveBtn.textContent;
  elements.saveBtn.disabled = true;
  elements.saveBtn.textContent = 'Saving...';

  try {
    if (state.editingId) {
      await ExpenseAPI.update(state.editingId, expenseData);
      showSnackbar('Expense updated successfully');
    } else {
      await ExpenseAPI.create(expenseData);
      showSnackbar('Expense added successfully');
    }
    closeModal();
    await loadExpenses();
  } catch (error) {
    showSnackbar('Error: ' + error.message);
  } finally {
    // Re-enable save button and restore text
    elements.saveBtn.disabled = false;
    elements.saveBtn.textContent = originalText;
  }
}

/**
 * Confirm and execute deletion
 */
async function confirmDelete() {
  if (!state.deleteId) return;

  try {
    await ExpenseAPI.delete(state.deleteId);
    showSnackbar('Expense deleted successfully');
    closeDeleteModal();
    await loadExpenses();
  } catch (error) {
    showSnackbar('Error: ' + error.message);
  }
}

// Snackbar timeout reference for cleanup
let snackbarTimeout = null;

/**
 * Show snackbar notification
 */
function showSnackbar(message) {
  // Clear any existing timeout
  if (snackbarTimeout) {
    clearTimeout(snackbarTimeout);
  }
  
  elements.snackbarMessage.textContent = message;
  elements.snackbar.classList.remove('hidden');
  
  // Auto-dismiss after 4 seconds
  snackbarTimeout = setTimeout(() => {
    hideSnackbar();
  }, 4000);
}

/**
 * Hide snackbar notification
 */
function hideSnackbar() {
  if (snackbarTimeout) {
    clearTimeout(snackbarTimeout);
    snackbarTimeout = null;
  }
  elements.snackbar.classList.add('hidden');
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    state,
    init,
    loadCategories,
    loadExpenses,
    renderExpenses,
    formatCurrency,
    formatDate,
    escapeHtml,
    applyFilters,
    clearFilters,
    setView,
    populateYearDropdown,
    initializeDateControls,
    handleDatePickerChange,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    handleMonthChange,
    handleYearChange,
    goToPreviousMonth,
    goToNextMonth,
    goToThisMonth,
    updateDailyNavigationButtons,
    updateMonthlyNavigationButtons,
    updateTableTitle,
    showLoading,
    hideLoading,
    showSnackbar,
    hideSnackbar
  };
}
