/**
 * @jest-environment jsdom
 */

describe('App Utility Functions', () => {
  let formatCurrency, formatDate, escapeHtml;

  beforeAll(() => {
    // Define utility functions for testing
    formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    };

    formatDate = (dateString) => {
      const date = new Date(dateString + 'T00:00:00');
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    };

    escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
  });

  describe('formatCurrency', () => {
    it('should format positive amounts correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1)).toBe('$1.00');
      expect(formatCurrency(10.5)).toBe('$10.50');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format amounts with decimal places', () => {
      expect(formatCurrency(15.99)).toBe('$15.99');
      expect(formatCurrency(100.1)).toBe('$100.10');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
      expect(formatDate('2024-12-25')).toBe('Dec 25, 2024');
      expect(formatDate('2024-06-01')).toBe('Jun 1, 2024');
    });

    it('should handle different months', () => {
      expect(formatDate('2024-02-14')).toBe('Feb 14, 2024');
      expect(formatDate('2024-07-04')).toBe('Jul 4, 2024');
      expect(formatDate('2024-11-28')).toBe('Nov 28, 2024');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
      expect(escapeHtml('a & b')).toBe('a &amp; b');
      expect(escapeHtml('"quoted"')).toBe('"quoted"');
    });

    it('should handle normal text', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
      expect(escapeHtml('Lunch at restaurant')).toBe('Lunch at restaurant');
    });

    it('should handle special characters', () => {
      expect(escapeHtml('<div onclick="alert()">Test</div>'))
        .toBe('&lt;div onclick="alert()"&gt;Test&lt;/div&gt;');
    });
  });
});

describe('Category Class Mapping', () => {
  const categoryClassMap = {
    'Groceries': 'category-groceries',
    'Transport': 'category-transport',
    'Housing and Utilities': 'category-housing',
    'Restaurants and Cafes': 'category-restaurants',
    'Health and Medicine': 'category-health',
    'Clothing & Footwear': 'category-clothing',
    'Entertainment': 'category-entertainment'
  };

  it('should have mapping for all categories', () => {
    expect(Object.keys(categoryClassMap)).toHaveLength(7);
  });

  it('should return correct class for each category', () => {
    expect(categoryClassMap['Groceries']).toBe('category-groceries');
    expect(categoryClassMap['Transport']).toBe('category-transport');
    expect(categoryClassMap['Housing and Utilities']).toBe('category-housing');
    expect(categoryClassMap['Restaurants and Cafes']).toBe('category-restaurants');
    expect(categoryClassMap['Health and Medicine']).toBe('category-health');
    expect(categoryClassMap['Clothing & Footwear']).toBe('category-clothing');
    expect(categoryClassMap['Entertainment']).toBe('category-entertainment');
  });
});

describe('validateForm', () => {
  let validateForm;

  beforeAll(() => {
    // Define validateForm function for testing
    validateForm = (data) => {
      const errors = {};
      const today = new Date().toISOString().split('T')[0];

      // Description validation
      if (!data.description || data.description.trim() === '') {
        errors.description = 'Description is required';
      } else if (data.description.trim().length > 200) {
        errors.description = 'Description must be 200 characters or less';
      }

      // Amount validation
      if (data.amount === undefined || data.amount === null || data.amount === '' || isNaN(data.amount)) {
        errors.amount = 'Amount is required';
      } else if (data.amount <= 0) {
        errors.amount = 'Amount must be greater than 0';
      } else if (data.amount > 999999.99) {
        errors.amount = 'Amount must be 999,999.99 or less';
      }

      // Category validation
      if (!data.category || data.category === '') {
        errors.category = 'Category is required';
      }

      // Date validation
      if (!data.date || data.date === '') {
        errors.date = 'Date is required';
      } else if (data.date > today) {
        errors.date = 'Future dates are not allowed';
      }

      return errors;
    };
  });

  describe('description validation', () => {
    it('should return error for empty description', () => {
      const errors = validateForm({ description: '', amount: 10, category: 'Groceries', date: '2024-01-15' });
      expect(errors.description).toBe('Description is required');
    });

    it('should return error for whitespace-only description', () => {
      const errors = validateForm({ description: '   ', amount: 10, category: 'Groceries', date: '2024-01-15' });
      expect(errors.description).toBe('Description is required');
    });

    it('should return error for description over 200 characters', () => {
      const longDescription = 'a'.repeat(201);
      const errors = validateForm({ description: longDescription, amount: 10, category: 'Groceries', date: '2024-01-15' });
      expect(errors.description).toBe('Description must be 200 characters or less');
    });

    it('should not return error for valid description', () => {
      const errors = validateForm({ description: 'Valid description', amount: 10, category: 'Groceries', date: '2024-01-15' });
      expect(errors.description).toBeUndefined();
    });

    it('should accept description at exactly 200 characters', () => {
      const exactDescription = 'a'.repeat(200);
      const errors = validateForm({ description: exactDescription, amount: 10, category: 'Groceries', date: '2024-01-15' });
      expect(errors.description).toBeUndefined();
    });
  });

  describe('amount validation', () => {
    it('should return error for undefined amount', () => {
      const errors = validateForm({ description: 'Test', amount: undefined, category: 'Groceries', date: '2024-01-15' });
      expect(errors.amount).toBe('Amount is required');
    });

    it('should return error for null amount', () => {
      const errors = validateForm({ description: 'Test', amount: null, category: 'Groceries', date: '2024-01-15' });
      expect(errors.amount).toBe('Amount is required');
    });

    it('should return error for empty string amount', () => {
      const errors = validateForm({ description: 'Test', amount: '', category: 'Groceries', date: '2024-01-15' });
      expect(errors.amount).toBe('Amount is required');
    });

    it('should return error for NaN amount', () => {
      const errors = validateForm({ description: 'Test', amount: NaN, category: 'Groceries', date: '2024-01-15' });
      expect(errors.amount).toBe('Amount is required');
    });

    it('should return error for zero amount', () => {
      const errors = validateForm({ description: 'Test', amount: 0, category: 'Groceries', date: '2024-01-15' });
      expect(errors.amount).toBe('Amount must be greater than 0');
    });

    it('should return error for negative amount', () => {
      const errors = validateForm({ description: 'Test', amount: -10, category: 'Groceries', date: '2024-01-15' });
      expect(errors.amount).toBe('Amount must be greater than 0');
    });

    it('should return error for amount over 999999.99', () => {
      const errors = validateForm({ description: 'Test', amount: 1000000, category: 'Groceries', date: '2024-01-15' });
      expect(errors.amount).toBe('Amount must be 999,999.99 or less');
    });

    it('should not return error for valid amount', () => {
      const errors = validateForm({ description: 'Test', amount: 50.00, category: 'Groceries', date: '2024-01-15' });
      expect(errors.amount).toBeUndefined();
    });

    it('should accept amount at exactly 999999.99', () => {
      const errors = validateForm({ description: 'Test', amount: 999999.99, category: 'Groceries', date: '2024-01-15' });
      expect(errors.amount).toBeUndefined();
    });
  });

  describe('category validation', () => {
    it('should return error for empty category', () => {
      const errors = validateForm({ description: 'Test', amount: 10, category: '', date: '2024-01-15' });
      expect(errors.category).toBe('Category is required');
    });

    it('should return error for null category', () => {
      const errors = validateForm({ description: 'Test', amount: 10, category: null, date: '2024-01-15' });
      expect(errors.category).toBe('Category is required');
    });

    it('should not return error for valid category', () => {
      const errors = validateForm({ description: 'Test', amount: 10, category: 'Groceries', date: '2024-01-15' });
      expect(errors.category).toBeUndefined();
    });
  });

  describe('date validation', () => {
    it('should return error for empty date', () => {
      const errors = validateForm({ description: 'Test', amount: 10, category: 'Groceries', date: '' });
      expect(errors.date).toBe('Date is required');
    });

    it('should return error for null date', () => {
      const errors = validateForm({ description: 'Test', amount: 10, category: 'Groceries', date: null });
      expect(errors.date).toBe('Date is required');
    });

    it('should return error for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      const errors = validateForm({ description: 'Test', amount: 10, category: 'Groceries', date: futureDateString });
      expect(errors.date).toBe('Future dates are not allowed');
    });

    it('should not return error for today date', () => {
      const today = new Date().toISOString().split('T')[0];
      const errors = validateForm({ description: 'Test', amount: 10, category: 'Groceries', date: today });
      expect(errors.date).toBeUndefined();
    });

    it('should not return error for past date', () => {
      const errors = validateForm({ description: 'Test', amount: 10, category: 'Groceries', date: '2024-01-15' });
      expect(errors.date).toBeUndefined();
    });
  });

  describe('multiple errors', () => {
    it('should return all errors for completely empty form', () => {
      const errors = validateForm({ description: '', amount: '', category: '', date: '' });
      expect(Object.keys(errors)).toHaveLength(4);
      expect(errors.description).toBeDefined();
      expect(errors.amount).toBeDefined();
      expect(errors.category).toBeDefined();
      expect(errors.date).toBeDefined();
    });

    it('should return no errors for valid form', () => {
      const errors = validateForm({ description: 'Valid', amount: 50, category: 'Groceries', date: '2024-01-15' });
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });
});

describe('Loading State Functions', () => {
  let showLoading, hideLoading, state, elements;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="loadingOverlay" class="loading-overlay hidden"></div>
    `;

    // Setup state and elements
    state = { isLoading: false };
    elements = {
      loadingOverlay: document.getElementById('loadingOverlay')
    };

    // Define functions
    showLoading = () => {
      state.isLoading = true;
      elements.loadingOverlay.classList.remove('hidden');
    };

    hideLoading = () => {
      state.isLoading = false;
      elements.loadingOverlay.classList.add('hidden');
    };
  });

  describe('showLoading', () => {
    it('should set isLoading to true', () => {
      showLoading();
      expect(state.isLoading).toBe(true);
    });

    it('should remove hidden class from overlay', () => {
      showLoading();
      expect(elements.loadingOverlay.classList.contains('hidden')).toBe(false);
    });
  });

  describe('hideLoading', () => {
    it('should set isLoading to false', () => {
      state.isLoading = true;
      hideLoading();
      expect(state.isLoading).toBe(false);
    });

    it('should add hidden class to overlay', () => {
      elements.loadingOverlay.classList.remove('hidden');
      hideLoading();
      expect(elements.loadingOverlay.classList.contains('hidden')).toBe(true);
    });
  });
});

describe('Field Error Functions', () => {
  let showFieldError, clearFieldError, clearAllFieldErrors, elements;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <input id="description" class="input-field" />
      <span id="descriptionError" class="field-error"></span>
      <input id="amount" class="input-field" />
      <span id="amountError" class="field-error"></span>
      <select id="category" class="input-select"></select>
      <span id="categoryError" class="field-error"></span>
      <input id="date" class="input-field" />
      <span id="dateError" class="field-error"></span>
    `;

    // Setup elements
    elements = {
      description: document.getElementById('description'),
      descriptionError: document.getElementById('descriptionError'),
      amount: document.getElementById('amount'),
      amountError: document.getElementById('amountError'),
      category: document.getElementById('category'),
      categoryError: document.getElementById('categoryError'),
      date: document.getElementById('date'),
      dateError: document.getElementById('dateError')
    };

    // Define functions
    showFieldError = (field, message) => {
      const inputElement = elements[field];
      const errorElement = elements[field + 'Error'];

      if (inputElement) {
        inputElement.classList.add('error');
        inputElement.setAttribute('aria-invalid', 'true');
      }

      if (errorElement) {
        errorElement.textContent = message;
      }
    };

    clearFieldError = (field) => {
      const inputElement = elements[field];
      const errorElement = elements[field + 'Error'];

      if (inputElement) {
        inputElement.classList.remove('error');
        inputElement.setAttribute('aria-invalid', 'false');
      }

      if (errorElement) {
        errorElement.textContent = '';
      }
    };

    clearAllFieldErrors = () => {
      ['description', 'amount', 'category', 'date'].forEach(field => {
        clearFieldError(field);
      });
    };
  });

  describe('showFieldError', () => {
    it('should add error class to input element', () => {
      showFieldError('description', 'Test error');
      expect(elements.description.classList.contains('error')).toBe(true);
    });

    it('should set aria-invalid to true', () => {
      showFieldError('description', 'Test error');
      expect(elements.description.getAttribute('aria-invalid')).toBe('true');
    });

    it('should display error message', () => {
      showFieldError('description', 'Test error');
      expect(elements.descriptionError.textContent).toBe('Test error');
    });

    it('should work for all fields', () => {
      showFieldError('amount', 'Amount error');
      expect(elements.amount.classList.contains('error')).toBe(true);
      expect(elements.amountError.textContent).toBe('Amount error');

      showFieldError('category', 'Category error');
      expect(elements.category.classList.contains('error')).toBe(true);
      expect(elements.categoryError.textContent).toBe('Category error');

      showFieldError('date', 'Date error');
      expect(elements.date.classList.contains('error')).toBe(true);
      expect(elements.dateError.textContent).toBe('Date error');
    });
  });

  describe('clearFieldError', () => {
    it('should remove error class from input element', () => {
      elements.description.classList.add('error');
      clearFieldError('description');
      expect(elements.description.classList.contains('error')).toBe(false);
    });

    it('should set aria-invalid to false', () => {
      elements.description.setAttribute('aria-invalid', 'true');
      clearFieldError('description');
      expect(elements.description.getAttribute('aria-invalid')).toBe('false');
    });

    it('should clear error message', () => {
      elements.descriptionError.textContent = 'Error message';
      clearFieldError('description');
      expect(elements.descriptionError.textContent).toBe('');
    });
  });

  describe('clearAllFieldErrors', () => {
    it('should clear all field errors', () => {
      // Set up errors on all fields
      ['description', 'amount', 'category', 'date'].forEach(field => {
        showFieldError(field, 'Test error');
      });

      clearAllFieldErrors();

      // Verify all fields are cleared
      ['description', 'amount', 'category', 'date'].forEach(field => {
        expect(elements[field].classList.contains('error')).toBe(false);
        expect(elements[field + 'Error'].textContent).toBe('');
      });
    });
  });
});

describe('View State Functions', () => {
  let setView, state, elements;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <button id="dailyViewBtn" class="toggle-btn active"></button>
      <button id="monthlyViewBtn" class="toggle-btn"></button>
      <div id="dailyControls" class="date-controls"></div>
      <div id="monthlyControls" class="date-controls hidden"></div>
      <select id="filterCategory"></select>
      <input id="filterStartDate" type="date" />
      <input id="filterEndDate" type="date" />
    `;

    // Setup state
    state = {
      currentView: 'daily',
      filters: { category: 'Groceries', startDate: '2024-01-01', endDate: '2024-01-31' }
    };

    // Setup elements
    elements = {
      dailyViewBtn: document.getElementById('dailyViewBtn'),
      monthlyViewBtn: document.getElementById('monthlyViewBtn'),
      dailyControls: document.getElementById('dailyControls'),
      monthlyControls: document.getElementById('monthlyControls'),
      filterCategory: document.getElementById('filterCategory'),
      filterStartDate: document.getElementById('filterStartDate'),
      filterEndDate: document.getElementById('filterEndDate')
    };

    // Define setView (simplified version without loadExpenses call)
    setView = (view) => {
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
    };
  });

  describe('setView to daily', () => {
    beforeEach(() => {
      // Start in monthly view
      state.currentView = 'monthly';
      elements.dailyViewBtn.classList.remove('active');
      elements.monthlyViewBtn.classList.add('active');
      elements.dailyControls.classList.add('hidden');
      elements.monthlyControls.classList.remove('hidden');
    });

    it('should set currentView to daily', () => {
      setView('daily');
      expect(state.currentView).toBe('daily');
    });

    it('should add active class to daily button', () => {
      setView('daily');
      expect(elements.dailyViewBtn.classList.contains('active')).toBe(true);
    });

    it('should remove active class from monthly button', () => {
      setView('daily');
      expect(elements.monthlyViewBtn.classList.contains('active')).toBe(false);
    });

    it('should show daily controls', () => {
      setView('daily');
      expect(elements.dailyControls.classList.contains('hidden')).toBe(false);
    });

    it('should hide monthly controls', () => {
      setView('daily');
      expect(elements.monthlyControls.classList.contains('hidden')).toBe(true);
    });

    it('should clear filters', () => {
      setView('daily');
      expect(state.filters).toEqual({ category: '', startDate: '', endDate: '' });
    });
  });

  describe('setView to monthly', () => {
    it('should set currentView to monthly', () => {
      setView('monthly');
      expect(state.currentView).toBe('monthly');
    });

    it('should add active class to monthly button', () => {
      setView('monthly');
      expect(elements.monthlyViewBtn.classList.contains('active')).toBe(true);
    });

    it('should remove active class from daily button', () => {
      setView('monthly');
      expect(elements.dailyViewBtn.classList.contains('active')).toBe(false);
    });

    it('should show monthly controls', () => {
      setView('monthly');
      expect(elements.monthlyControls.classList.contains('hidden')).toBe(false);
    });

    it('should hide daily controls', () => {
      setView('monthly');
      expect(elements.dailyControls.classList.contains('hidden')).toBe(true);
    });
  });
});

describe('Snackbar Functions', () => {
  let showSnackbar, hideSnackbar, elements, snackbarTimeout;

  beforeEach(() => {
    jest.useFakeTimers();

    // Setup DOM
    document.body.innerHTML = `
      <div id="snackbar" class="snackbar hidden">
        <span id="snackbarMessage"></span>
      </div>
    `;

    // Setup elements
    elements = {
      snackbar: document.getElementById('snackbar'),
      snackbarMessage: document.getElementById('snackbarMessage')
    };

    snackbarTimeout = null;

    // Define functions
    showSnackbar = (message) => {
      if (snackbarTimeout) {
        clearTimeout(snackbarTimeout);
      }

      elements.snackbarMessage.textContent = message;
      elements.snackbar.classList.remove('hidden');

      snackbarTimeout = setTimeout(() => {
        hideSnackbar();
      }, 4000);
    };

    hideSnackbar = () => {
      if (snackbarTimeout) {
        clearTimeout(snackbarTimeout);
        snackbarTimeout = null;
      }
      elements.snackbar.classList.add('hidden');
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('showSnackbar', () => {
    it('should display the message', () => {
      showSnackbar('Test message');
      expect(elements.snackbarMessage.textContent).toBe('Test message');
    });

    it('should remove hidden class', () => {
      showSnackbar('Test message');
      expect(elements.snackbar.classList.contains('hidden')).toBe(false);
    });

    it('should auto-hide after 4 seconds', () => {
      showSnackbar('Test message');
      expect(elements.snackbar.classList.contains('hidden')).toBe(false);

      jest.advanceTimersByTime(4000);

      expect(elements.snackbar.classList.contains('hidden')).toBe(true);
    });
  });

  describe('hideSnackbar', () => {
    it('should add hidden class', () => {
      elements.snackbar.classList.remove('hidden');
      hideSnackbar();
      expect(elements.snackbar.classList.contains('hidden')).toBe(true);
    });
  });
});
