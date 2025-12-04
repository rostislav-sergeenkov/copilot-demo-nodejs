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
