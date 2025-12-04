const fs = require('fs');
const path = require('path');
const ExpenseModel = require('../models/expense');

const PUBLIC_DIR = path.join(__dirname, '../../public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendError(res, statusCode, message) {
  sendJSON(res, statusCode, { error: message });
}

function serveStaticFile(res, filePath) {
  const ext = path.extname(filePath);
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        sendError(res, 404, 'File not found');
      } else {
        sendError(res, 500, 'Server error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(content);
  });
}

function parseUrl(url) {
  const [pathname, queryString] = url.split('?');
  const query = {};
  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      query[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
  }
  return { pathname, query };
}

async function handleRequest(req, res) {
  const { pathname, query } = parseUrl(req.url);
  const method = req.method;

  // API Routes
  if (pathname.startsWith('/api/')) {
    return handleApiRequest(req, res, pathname, method, query);
  }

  // Static files
  if (method === 'GET') {
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(PUBLIC_DIR, filePath);
    
    // Security check - prevent directory traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
      sendError(res, 403, 'Forbidden');
      return;
    }
    
    serveStaticFile(res, filePath);
    return;
  }

  sendError(res, 404, 'Not found');
}

async function handleApiRequest(req, res, pathname, method, query) {
  try {
    // GET /api/expenses - Get all expenses
    if (pathname === '/api/expenses' && method === 'GET') {
      const filters = {};
      if (query.category) filters.category = query.category;
      if (query.startDate) filters.startDate = query.startDate;
      if (query.endDate) filters.endDate = query.endDate;
      
      const expenses = ExpenseModel.getAll(filters);
      sendJSON(res, 200, expenses);
      return;
    }

    // GET /api/expenses/daily/:date - Get daily expenses
    const dailyMatch = pathname.match(/^\/api\/expenses\/daily\/(\d{4}-\d{2}-\d{2})$/);
    if (dailyMatch && method === 'GET') {
      const expenses = ExpenseModel.getDailyExpenses(dailyMatch[1]);
      sendJSON(res, 200, expenses);
      return;
    }

    // GET /api/expenses/monthly/:year/:month - Get monthly expenses
    const monthlyMatch = pathname.match(/^\/api\/expenses\/monthly\/(\d{4})\/(\d{1,2})$/);
    if (monthlyMatch && method === 'GET') {
      const expenses = ExpenseModel.getMonthlyExpenses(monthlyMatch[1], monthlyMatch[2]);
      sendJSON(res, 200, expenses);
      return;
    }

    // GET /api/expenses/:id - Get single expense
    const idMatch = pathname.match(/^\/api\/expenses\/(\d+)$/);
    if (idMatch && method === 'GET') {
      const expense = ExpenseModel.getById(parseInt(idMatch[1]));
      if (!expense) {
        sendError(res, 404, 'Expense not found');
        return;
      }
      sendJSON(res, 200, expense);
      return;
    }

    // POST /api/expenses - Create expense
    if (pathname === '/api/expenses' && method === 'POST') {
      const body = await parseBody(req);
      const expense = ExpenseModel.create(body);
      sendJSON(res, 201, expense);
      return;
    }

    // PUT /api/expenses/:id - Update expense
    if (idMatch && method === 'PUT') {
      const body = await parseBody(req);
      const expense = ExpenseModel.update(parseInt(idMatch[1]), body);
      if (!expense) {
        sendError(res, 404, 'Expense not found');
        return;
      }
      sendJSON(res, 200, expense);
      return;
    }

    // DELETE /api/expenses/:id - Delete expense
    if (idMatch && method === 'DELETE') {
      const deleted = ExpenseModel.delete(parseInt(idMatch[1]));
      if (!deleted) {
        sendError(res, 404, 'Expense not found');
        return;
      }
      sendJSON(res, 204, null);
      return;
    }

    // GET /api/categories - Get all categories
    if (pathname === '/api/categories' && method === 'GET') {
      const categories = ExpenseModel.getCategories();
      sendJSON(res, 200, categories);
      return;
    }

    sendError(res, 404, 'API endpoint not found');
  } catch (error) {
    console.error('API Error:', error);
    sendError(res, 400, error.message);
  }
}

module.exports = { handleRequest, parseBody, sendJSON, sendError };
