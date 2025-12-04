/**
 * API client for the Expense Tracker application
 */

const API_BASE_URL = '/api';
const API_TIMEOUT = 10000; // 10 seconds

/**
 * Check if the browser is online
 * @returns {boolean} True if online, false if offline
 */
function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Fetch with timeout wrapper using AbortController
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 * @throws {Error} If request times out or network is offline
 */
async function fetchWithTimeout(url, options = {}) {
  // Check if offline before making request
  if (!isOnline()) {
    throw new Error('You appear to be offline. Please check your connection.');
  }

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
    // Re-check online status on fetch error
    if (!isOnline()) {
      throw new Error('You appear to be offline. Please check your connection.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

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
    
    const response = await fetchWithTimeout(url);
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/expenses/${id}`);
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/expenses/daily/${date}`);
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/expenses/monthly/${year}/${month}`);
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/expenses`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/expenses/${id}`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/expenses/${id}`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch categories');
    }
    return response.json();
  }
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ExpenseAPI, fetchWithTimeout, isOnline, API_TIMEOUT };
}
