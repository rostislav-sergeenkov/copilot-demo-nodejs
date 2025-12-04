const http = require('http');
const path = require('path');
const fs = require('fs');

// Set test database path before requiring modules
const TEST_DB_PATH = path.join(__dirname, '../../data/test-api-expenses.db');
process.env.DB_PATH = TEST_DB_PATH;

const { handleRequest } = require('../../src/routes/api');
const { initializeDatabase, closeDatabase, getDatabase } = require('../../src/database/init');
const ExpenseModel = require('../../src/models/expense');

// Helper to create mock request/response
function createMockReqRes(method, url, body = null) {
  const req = new http.IncomingMessage();
  req.method = method;
  req.url = url;
  
  // Add event emitter functionality for body parsing
  const listeners = {};
  req.on = (event, callback) => {
    listeners[event] = listeners[event] || [];
    listeners[event].push(callback);
  };
  
  // Simulate body data
  setTimeout(() => {
    if (body && listeners['data']) {
      listeners['data'].forEach(cb => cb(JSON.stringify(body)));
    }
    if (listeners['end']) {
      listeners['end'].forEach(cb => cb());
    }
  }, 0);

  const res = {
    statusCode: null,
    headers: {},
    body: '',
    writeHead(code, headers) {
      this.statusCode = code;
      this.headers = { ...this.headers, ...headers };
    },
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(data) {
      this.body = data;
    }
  };

  return { req, res };
}

describe('API Routes', () => {
  beforeAll(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    initializeDatabase();
  });

  afterAll(() => {
    closeDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  beforeEach(() => {
    const db = getDatabase();
    db.exec('DELETE FROM expenses');
  });

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const { req, res } = createMockReqRes('GET', '/api/categories');
      
      await handleRequest(req, res);
      
      expect(res.statusCode).toBe(200);
      const categories = JSON.parse(res.body);
      expect(categories).toHaveLength(7);
      expect(categories).toContain('Groceries');
    });
  });

  describe('GET /api/expenses', () => {
    beforeEach(() => {
      ExpenseModel.create({ description: 'Test 1', amount: 10, category: 'Groceries', date: '2024-01-15' });
      ExpenseModel.create({ description: 'Test 2', amount: 20, category: 'Transport', date: '2024-01-16' });
    });

    it('should return all expenses', async () => {
      const { req, res } = createMockReqRes('GET', '/api/expenses');
      
      await handleRequest(req, res);
      
      expect(res.statusCode).toBe(200);
      const expenses = JSON.parse(res.body);
      expect(expenses).toHaveLength(2);
    });

    it('should filter by category', async () => {
      const { req, res } = createMockReqRes('GET', '/api/expenses?category=Groceries');
      
      await handleRequest(req, res);
      
      expect(res.statusCode).toBe(200);
      const expenses = JSON.parse(res.body);
      expect(expenses).toHaveLength(1);
      expect(expenses[0].description).toBe('Test 1');
    });
  });

  describe('GET /api/expenses/:id', () => {
    it('should return expense by id', async () => {
      const created = ExpenseModel.create({ 
        description: 'Single expense', 
        amount: 25, 
        category: 'Entertainment', 
        date: '2024-01-20' 
      });

      const { req, res } = createMockReqRes('GET', `/api/expenses/${created.id}`);
      
      await handleRequest(req, res);
      
      expect(res.statusCode).toBe(200);
      const expense = JSON.parse(res.body);
      expect(expense.description).toBe('Single expense');
    });

    it('should return 404 for non-existent expense', async () => {
      const { req, res } = createMockReqRes('GET', '/api/expenses/99999');
      
      await handleRequest(req, res);
      
      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.body);
      expect(body.error).toBe('Expense not found');
    });
  });

  describe('GET /api/expenses/daily/:date', () => {
    beforeEach(() => {
      ExpenseModel.create({ description: 'Daily 1', amount: 10, category: 'Groceries', date: '2024-01-15' });
      ExpenseModel.create({ description: 'Daily 2', amount: 20, category: 'Transport', date: '2024-01-15' });
    });

    it('should return expenses for specific date', async () => {
      const { req, res } = createMockReqRes('GET', '/api/expenses/daily/2024-01-15');
      
      await handleRequest(req, res);
      
      expect(res.statusCode).toBe(200);
      const expenses = JSON.parse(res.body);
      expect(expenses).toHaveLength(2);
    });
  });

  describe('GET /api/expenses/monthly/:year/:month', () => {
    beforeEach(() => {
      ExpenseModel.create({ description: 'Monthly 1', amount: 10, category: 'Groceries', date: '2024-01-15' });
      ExpenseModel.create({ description: 'Monthly 2', amount: 20, category: 'Transport', date: '2024-01-25' });
      ExpenseModel.create({ description: 'Monthly 3', amount: 30, category: 'Entertainment', date: '2024-02-10' });
    });

    it('should return expenses for specific month', async () => {
      const { req, res } = createMockReqRes('GET', '/api/expenses/monthly/2024/1');
      
      await handleRequest(req, res);
      
      expect(res.statusCode).toBe(200);
      const expenses = JSON.parse(res.body);
      expect(expenses).toHaveLength(2);
    });
  });

  describe('POST /api/expenses', () => {
    it('should create a new expense', async () => {
      const newExpense = {
        description: 'New expense',
        amount: 50,
        category: 'Groceries',
        date: '2024-01-15'
      };

      const { req, res } = createMockReqRes('POST', '/api/expenses', newExpense);
      
      await handleRequest(req, res);
      
      // Wait for async body parsing
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(res.statusCode).toBe(201);
      const created = JSON.parse(res.body);
      expect(created.description).toBe('New expense');
      expect(created.id).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidExpense = {
        description: '',
        amount: 50,
        category: 'Groceries',
        date: '2024-01-15'
      };

      const { req, res } = createMockReqRes('POST', '/api/expenses', invalidExpense);
      
      await handleRequest(req, res);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/expenses/:id', () => {
    let expenseId;

    beforeEach(() => {
      const expense = ExpenseModel.create({
        description: 'Original',
        amount: 100,
        category: 'Groceries',
        date: '2024-01-15'
      });
      expenseId = expense.id;
    });

    it('should update an expense', async () => {
      const updates = {
        description: 'Updated',
        amount: 150
      };

      const { req, res } = createMockReqRes('PUT', `/api/expenses/${expenseId}`, updates);
      
      await handleRequest(req, res);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(res.statusCode).toBe(200);
      const updated = JSON.parse(res.body);
      expect(updated.description).toBe('Updated');
      expect(updated.amount).toBe(150);
    });

    it('should return 404 for non-existent expense', async () => {
      const { req, res } = createMockReqRes('PUT', '/api/expenses/99999', { description: 'Test' });
      
      await handleRequest(req, res);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    it('should delete an expense', async () => {
      const expense = ExpenseModel.create({
        description: 'To delete',
        amount: 50,
        category: 'Transport',
        date: '2024-01-15'
      });

      const { req, res } = createMockReqRes('DELETE', `/api/expenses/${expense.id}`);
      
      await handleRequest(req, res);
      
      expect(res.statusCode).toBe(204);
      
      const deleted = ExpenseModel.getById(expense.id);
      expect(deleted).toBeUndefined();
    });

    it('should return 404 for non-existent expense', async () => {
      const { req, res } = createMockReqRes('DELETE', '/api/expenses/99999');
      
      await handleRequest(req, res);
      
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Invalid routes', () => {
    it('should return 404 for unknown API endpoint', async () => {
      const { req, res } = createMockReqRes('GET', '/api/unknown');
      
      await handleRequest(req, res);
      
      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.body);
      expect(body.error).toBe('API endpoint not found');
    });
  });
});
