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
  deleteId: null
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
  snackbarMessage: document.getElementById('snackbarMessage')
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
 * Initialize the application
 */
async function init() {
  try {
    await loadCategories();
    await loadExpenses();
    setupEventListeners();
    setDefaultDate();
  } catch (error) {
    showSnackbar('Failed to initialize application: ' + error.message);
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
  try {
    const filters = { ...state.filters };
    state.expenses = await ExpenseAPI.getAll(filters);
    renderExpenses();
    updateTableTitle();
  } catch (error) {
    showSnackbar('Failed to load expenses: ' + error.message);
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
    elements.tableTitle.textContent = 'All Expenses';
  } else {
    elements.tableTitle.textContent = 'Monthly Expenses';
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
  } else {
    elements.dailyViewBtn.classList.remove('active');
    elements.monthlyViewBtn.classList.add('active');
  }
  
  updateTableTitle();
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

/**
 * Show snackbar notification
 */
function showSnackbar(message) {
  elements.snackbarMessage.textContent = message;
  elements.snackbar.classList.remove('hidden');
  
  setTimeout(() => {
    elements.snackbar.classList.add('hidden');
  }, 4000);
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
    clearFilters
  };
}
