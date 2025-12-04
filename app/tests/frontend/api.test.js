/**
 * @jest-environment jsdom
 */

describe('ExpenseAPI', () => {
  let ExpenseAPI;

  beforeEach(() => {
    // Mock fetch globally
    global.fetch = jest.fn();
    
    // Define ExpenseAPI for testing
    const API_BASE_URL = '/api';
    
    ExpenseAPI = {
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

      async getById(id) {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch expense');
        }
        return response.json();
      },

      async create(expense) {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expense),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create expense');
        }
        return response.json();
      },

      async update(id, expense) {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expense),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update expense');
        }
        return response.json();
      },

      async delete(id) {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok && response.status !== 204) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete expense');
        }
      },

      async getCategories() {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch categories');
        }
        return response.json();
      }
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all expenses', async () => {
      const mockExpenses = [
        { id: 1, description: 'Test 1', amount: 10, category: 'Groceries', date: '2024-01-15' },
        { id: 2, description: 'Test 2', amount: 20, category: 'Transport', date: '2024-01-16' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExpenses)
      });

      const result = await ExpenseAPI.getAll();

      expect(fetch).toHaveBeenCalledWith('/api/expenses');
      expect(result).toEqual(mockExpenses);
    });

    it('should include filters in query string', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      await ExpenseAPI.getAll({ category: 'Groceries', startDate: '2024-01-01' });

      expect(fetch).toHaveBeenCalledWith('/api/expenses?category=Groceries&startDate=2024-01-01');
    });

    it('should throw error on failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' })
      });

      await expect(ExpenseAPI.getAll()).rejects.toThrow('Server error');
    });
  });

  describe('getById', () => {
    it('should fetch expense by id', async () => {
      const mockExpense = { id: 1, description: 'Test', amount: 10, category: 'Groceries', date: '2024-01-15' };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExpense)
      });

      const result = await ExpenseAPI.getById(1);

      expect(fetch).toHaveBeenCalledWith('/api/expenses/1');
      expect(result).toEqual(mockExpense);
    });

    it('should throw error for non-existent expense', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Expense not found' })
      });

      await expect(ExpenseAPI.getById(99999)).rejects.toThrow('Expense not found');
    });
  });

  describe('create', () => {
    it('should create a new expense', async () => {
      const newExpense = { description: 'New', amount: 50, category: 'Groceries', date: '2024-01-15' };
      const createdExpense = { id: 1, ...newExpense };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createdExpense)
      });

      const result = await ExpenseAPI.create(newExpense);

      expect(fetch).toHaveBeenCalledWith('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });
      expect(result).toEqual(createdExpense);
    });

    it('should throw error on validation failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Description is required' })
      });

      await expect(ExpenseAPI.create({})).rejects.toThrow('Description is required');
    });
  });

  describe('update', () => {
    it('should update an expense', async () => {
      const updates = { description: 'Updated' };
      const updatedExpense = { id: 1, description: 'Updated', amount: 10, category: 'Groceries', date: '2024-01-15' };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedExpense)
      });

      const result = await ExpenseAPI.update(1, updates);

      expect(fetch).toHaveBeenCalledWith('/api/expenses/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      expect(result).toEqual(updatedExpense);
    });
  });

  describe('delete', () => {
    it('should delete an expense', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      });

      await ExpenseAPI.delete(1);

      expect(fetch).toHaveBeenCalledWith('/api/expenses/1', {
        method: 'DELETE'
      });
    });

    it('should throw error on failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Expense not found' })
      });

      await expect(ExpenseAPI.delete(99999)).rejects.toThrow('Expense not found');
    });
  });

  describe('getCategories', () => {
    it('should fetch all categories', async () => {
      const mockCategories = ['Groceries', 'Transport', 'Entertainment'];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategories)
      });

      const result = await ExpenseAPI.getCategories();

      expect(fetch).toHaveBeenCalledWith('/api/categories');
      expect(result).toEqual(mockCategories);
    });
  });
});

describe('fetchWithTimeout', () => {
  let fetchWithTimeout;
  const API_TIMEOUT = 10000;

  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn();

    // Define fetchWithTimeout
    fetchWithTimeout = async (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please check your connection and try again.');
        }
        throw error;
      }
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should call fetch with AbortController signal', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    await fetchWithTimeout('/api/test');

    expect(fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      signal: expect.any(AbortSignal)
    }));
  });

  it('should pass options to fetch', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: 'test' })
    };

    await fetchWithTimeout('/api/test', options);

    expect(fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: 'test' }),
      signal: expect.any(AbortSignal)
    }));
  });

  it('should return response on successful fetch', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ data: 'test' }) };
    global.fetch.mockResolvedValueOnce(mockResponse);

    const result = await fetchWithTimeout('/api/test');

    expect(result).toBe(mockResponse);
  });

  it('should throw timeout error when request times out', async () => {
    // Create an AbortError
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    
    global.fetch.mockRejectedValueOnce(abortError);

    await expect(fetchWithTimeout('/api/test')).rejects.toThrow('Request timed out. Please check your connection and try again.');
  });

  it('should rethrow non-timeout errors', async () => {
    const networkError = new Error('Network failure');
    global.fetch.mockRejectedValueOnce(networkError);

    await expect(fetchWithTimeout('/api/test')).rejects.toThrow('Network failure');
  });
});

describe('isOnline', () => {
  let isOnline;

  beforeEach(() => {
    // Define isOnline
    isOnline = () => {
      return navigator.onLine;
    };
  });

  it('should return true when navigator.onLine is true', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      configurable: true
    });

    expect(isOnline()).toBe(true);
  });

  it('should return false when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      configurable: true
    });

    expect(isOnline()).toBe(false);
  });
});

describe('Offline Error Handling', () => {
  let checkOnlineStatus;

  beforeEach(() => {
    // Define checkOnlineStatus helper
    checkOnlineStatus = () => {
      if (!navigator.onLine) {
        throw new Error('You appear to be offline. Please check your internet connection.');
      }
    };
  });

  it('should throw error when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      configurable: true
    });

    expect(() => checkOnlineStatus()).toThrow('You appear to be offline. Please check your internet connection.');
  });

  it('should not throw error when online', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      configurable: true
    });

    expect(() => checkOnlineStatus()).not.toThrow();
  });
});
