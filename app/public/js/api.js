/**
 * API client for the Expense Tracker application
 */

const API_BASE_URL = '/api';

const ExpenseAPI = {
  /**
   * Fetch all expenses with optional filters
   * @param {Object} filters - Filter options (category, startDate, endDate)
   * @returns {Promise<Array>} Array of expense objects
   */
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/expenses${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch expenses');
    }
    return response.json();
  },

  /**
   * Fetch a single expense by ID
   * @param {number} id - Expense ID
   * @returns {Promise<Object>} Expense object
   */
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch expense');
    }
    return response.json();
  },

  /**
   * Fetch expenses for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} Array of expense objects
   */
  async getDaily(date) {
    const response = await fetch(`${API_BASE_URL}/expenses/daily/${date}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch daily expenses');
    }
    return response.json();
  },

  /**
   * Fetch expenses for a specific month
   * @param {number} year - Year (YYYY)
   * @param {number} month - Month (1-12)
   * @returns {Promise<Array>} Array of expense objects
   */
  async getMonthly(year, month) {
    const response = await fetch(`${API_BASE_URL}/expenses/monthly/${year}/${month}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch monthly expenses');
    }
    return response.json();
  },

  /**
   * Create a new expense
   * @param {Object} expense - Expense data
   * @returns {Promise<Object>} Created expense object
   */
  async create(expense) {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create expense');
    }
    return response.json();
  },

  /**
   * Update an existing expense
   * @param {number} id - Expense ID
   * @param {Object} expense - Updated expense data
   * @returns {Promise<Object>} Updated expense object
   */
  async update(id, expense) {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update expense');
    }
    return response.json();
  },

  /**
   * Delete an expense
   * @param {number} id - Expense ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete expense');
    }
  },

  /**
   * Fetch all available categories
   * @returns {Promise<Array>} Array of category strings
   */
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch categories');
    }
    return response.json();
  }
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExpenseAPI;
}
