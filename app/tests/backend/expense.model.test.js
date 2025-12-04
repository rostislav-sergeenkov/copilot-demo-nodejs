const path = require('path');
const fs = require('fs');

// Set test database path before requiring modules
const TEST_DB_PATH = path.join(__dirname, '../../data/test-expenses.db');
process.env.DB_PATH = TEST_DB_PATH;

const ExpenseModel = require('../../src/models/expense');
const { initializeDatabase, closeDatabase, getDatabase } = require('../../src/database/init');

describe('ExpenseModel', () => {
  beforeAll(() => {
    // Ensure clean test database
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    initializeDatabase();
  });

  afterAll(() => {
    closeDatabase();
    // Clean up test database
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  beforeEach(() => {
    // Clear all expenses before each test
    const db = getDatabase();
    db.exec('DELETE FROM expenses');
  });

  describe('getCategories', () => {
    it('should return all valid categories', () => {
      const categories = ExpenseModel.getCategories();
      expect(categories).toHaveLength(7);
      expect(categories).toContain('Groceries');
      expect(categories).toContain('Transport');
      expect(categories).toContain('Housing and Utilities');
      expect(categories).toContain('Restaurants and Cafes');
      expect(categories).toContain('Health and Medicine');
      expect(categories).toContain('Clothing & Footwear');
      expect(categories).toContain('Entertainment');
    });
  });

  describe('create', () => {
    it('should create a new expense with valid data', () => {
      const expenseData = {
        description: 'Lunch',
        amount: 15.50,
        category: 'Restaurants and Cafes',
        date: '2024-01-15'
      };

      const expense = ExpenseModel.create(expenseData);

      expect(expense).toBeDefined();
      expect(expense.id).toBeDefined();
      expect(expense.description).toBe('Lunch');
      expect(expense.amount).toBe(15.50);
      expect(expense.category).toBe('Restaurants and Cafes');
      expect(expense.date).toBe('2024-01-15');
    });

    it('should throw error for missing description', () => {
      const expenseData = {
        amount: 15.50,
        category: 'Groceries',
        date: '2024-01-15'
      };

      expect(() => ExpenseModel.create(expenseData)).toThrow('Description is required');
    });

    it('should throw error for empty description', () => {
      const expenseData = {
        description: '   ',
        amount: 15.50,
        category: 'Groceries',
        date: '2024-01-15'
      };

      expect(() => ExpenseModel.create(expenseData)).toThrow('Description is required');
    });

    it('should throw error for negative amount', () => {
      const expenseData = {
        description: 'Test',
        amount: -10,
        category: 'Groceries',
        date: '2024-01-15'
      };

      expect(() => ExpenseModel.create(expenseData)).toThrow('Amount is required and must be a non-negative number');
    });

    it('should throw error for invalid category', () => {
      const expenseData = {
        description: 'Test',
        amount: 10,
        category: 'InvalidCategory',
        date: '2024-01-15'
      };

      expect(() => ExpenseModel.create(expenseData)).toThrow('Category must be one of');
    });

    it('should throw error for invalid date format', () => {
      const expenseData = {
        description: 'Test',
        amount: 10,
        category: 'Groceries',
        date: '01-15-2024'
      };

      expect(() => ExpenseModel.create(expenseData)).toThrow('Date is required and must be in YYYY-MM-DD format');
    });

    it('should trim description whitespace', () => {
      const expenseData = {
        description: '  Lunch  ',
        amount: 15.50,
        category: 'Restaurants and Cafes',
        date: '2024-01-15'
      };

      const expense = ExpenseModel.create(expenseData);
      expect(expense.description).toBe('Lunch');
    });
  });

  describe('getById', () => {
    it('should return expense by id', () => {
      const created = ExpenseModel.create({
        description: 'Test expense',
        amount: 25.00,
        category: 'Transport',
        date: '2024-01-20'
      });

      const expense = ExpenseModel.getById(created.id);

      expect(expense).toBeDefined();
      expect(expense.id).toBe(created.id);
      expect(expense.description).toBe('Test expense');
    });

    it('should return undefined for non-existent id', () => {
      const expense = ExpenseModel.getById(99999);
      expect(expense).toBeUndefined();
    });
  });

  describe('getAll', () => {
    beforeEach(() => {
      // Create test expenses
      ExpenseModel.create({ description: 'Grocery shopping', amount: 50, category: 'Groceries', date: '2024-01-15' });
      ExpenseModel.create({ description: 'Bus ticket', amount: 5, category: 'Transport', date: '2024-01-16' });
      ExpenseModel.create({ description: 'Movie', amount: 12, category: 'Entertainment', date: '2024-02-10' });
    });

    it('should return all expenses', () => {
      const expenses = ExpenseModel.getAll();
      expect(expenses).toHaveLength(3);
    });

    it('should filter by category', () => {
      const expenses = ExpenseModel.getAll({ category: 'Groceries' });
      expect(expenses).toHaveLength(1);
      expect(expenses[0].description).toBe('Grocery shopping');
    });

    it('should filter by date range', () => {
      const expenses = ExpenseModel.getAll({ startDate: '2024-01-01', endDate: '2024-01-31' });
      expect(expenses).toHaveLength(2);
    });

    it('should return empty array when no matches', () => {
      const expenses = ExpenseModel.getAll({ category: 'Health and Medicine' });
      expect(expenses).toHaveLength(0);
    });
  });

  describe('getDailyExpenses', () => {
    beforeEach(() => {
      ExpenseModel.create({ description: 'Coffee', amount: 5, category: 'Restaurants and Cafes', date: '2024-01-15' });
      ExpenseModel.create({ description: 'Lunch', amount: 15, category: 'Restaurants and Cafes', date: '2024-01-15' });
      ExpenseModel.create({ description: 'Dinner', amount: 25, category: 'Restaurants and Cafes', date: '2024-01-16' });
    });

    it('should return expenses for specific date', () => {
      const expenses = ExpenseModel.getDailyExpenses('2024-01-15');
      expect(expenses).toHaveLength(2);
    });

    it('should return empty array for date with no expenses', () => {
      const expenses = ExpenseModel.getDailyExpenses('2024-01-20');
      expect(expenses).toHaveLength(0);
    });
  });

  describe('getMonthlyExpenses', () => {
    beforeEach(() => {
      ExpenseModel.create({ description: 'Jan expense 1', amount: 10, category: 'Groceries', date: '2024-01-05' });
      ExpenseModel.create({ description: 'Jan expense 2', amount: 20, category: 'Transport', date: '2024-01-25' });
      ExpenseModel.create({ description: 'Feb expense', amount: 30, category: 'Entertainment', date: '2024-02-10' });
    });

    it('should return expenses for specific month', () => {
      const expenses = ExpenseModel.getMonthlyExpenses(2024, 1);
      expect(expenses).toHaveLength(2);
    });

    it('should return empty array for month with no expenses', () => {
      const expenses = ExpenseModel.getMonthlyExpenses(2024, 3);
      expect(expenses).toHaveLength(0);
    });
  });

  describe('update', () => {
    let expenseId;

    beforeEach(() => {
      const expense = ExpenseModel.create({
        description: 'Original description',
        amount: 100,
        category: 'Groceries',
        date: '2024-01-15'
      });
      expenseId = expense.id;
    });

    it('should update expense with valid data', () => {
      const updated = ExpenseModel.update(expenseId, {
        description: 'Updated description',
        amount: 150
      });

      expect(updated.description).toBe('Updated description');
      expect(updated.amount).toBe(150);
      expect(updated.category).toBe('Groceries'); // Unchanged
      expect(updated.date).toBe('2024-01-15'); // Unchanged
    });

    it('should return null for non-existent expense', () => {
      const result = ExpenseModel.update(99999, { description: 'Test' });
      expect(result).toBeNull();
    });

    it('should throw error for invalid amount', () => {
      expect(() => ExpenseModel.update(expenseId, { amount: -50 }))
        .toThrow('Amount must be a non-negative number');
    });

    it('should throw error for invalid category', () => {
      expect(() => ExpenseModel.update(expenseId, { category: 'Invalid' }))
        .toThrow('Category must be one of');
    });
  });

  describe('delete', () => {
    it('should delete existing expense', () => {
      const expense = ExpenseModel.create({
        description: 'To delete',
        amount: 50,
        category: 'Transport',
        date: '2024-01-15'
      });

      const result = ExpenseModel.delete(expense.id);
      expect(result).toBe(true);

      const deleted = ExpenseModel.getById(expense.id);
      expect(deleted).toBeUndefined();
    });

    it('should return false for non-existent expense', () => {
      const result = ExpenseModel.delete(99999);
      expect(result).toBe(false);
    });
  });
});
