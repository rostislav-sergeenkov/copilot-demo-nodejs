const { getDatabase } = require('../database/init');

const VALID_CATEGORIES = [
  'Groceries',
  'Transport',
  'Housing and Utilities',
  'Restaurants and Cafes',
  'Health and Medicine',
  'Clothing & Footwear',
  'Entertainment'
];

class ExpenseModel {
  static getAll(filters = {}) {
    const db = getDatabase();
    let query = 'SELECT * FROM expenses';
    const params = [];
    const conditions = [];

    if (filters.category) {
      conditions.push('category = ?');
      params.push(filters.category);
    }

    if (filters.startDate) {
      conditions.push('date >= ?');
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      conditions.push('date <= ?');
      params.push(filters.endDate);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY date DESC, id DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static getById(id) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM expenses WHERE id = ?');
    return stmt.get(id);
  }

  static getDailyExpenses(date) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM expenses WHERE date = ? ORDER BY id DESC');
    return stmt.all(date);
  }

  static getMonthlyExpenses(year, month) {
    const db = getDatabase();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    const stmt = db.prepare('SELECT * FROM expenses WHERE date >= ? AND date <= ? ORDER BY date DESC, id DESC');
    return stmt.all(startDate, endDate);
  }

  static create(expense) {
    const { description, amount, category, date } = expense;
    
    // Validation
    if (!description || typeof description !== 'string' || description.trim() === '') {
      throw new Error('Description is required and must be a non-empty string');
    }
    
    if (amount === undefined || amount === null || isNaN(parseFloat(amount)) || parseFloat(amount) < 0) {
      throw new Error('Amount is required and must be a non-negative number');
    }
    
    if (!category || !VALID_CATEGORIES.includes(category)) {
      throw new Error(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }
    
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Date is required and must be in YYYY-MM-DD format');
    }

    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO expenses (description, amount, category, date)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(description.trim(), parseFloat(amount), category, date);
    return this.getById(result.lastInsertRowid);
  }

  static update(id, expense) {
    const existing = this.getById(id);
    if (!existing) {
      return null;
    }

    const { description, amount, category, date } = expense;
    
    // Validation
    if (description !== undefined && (typeof description !== 'string' || description.trim() === '')) {
      throw new Error('Description must be a non-empty string');
    }
    
    if (amount !== undefined && (isNaN(parseFloat(amount)) || parseFloat(amount) < 0)) {
      throw new Error('Amount must be a non-negative number');
    }
    
    if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
      throw new Error(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }
    
    if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }

    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE expenses 
      SET description = ?, amount = ?, category = ?, date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      description !== undefined ? description.trim() : existing.description,
      amount !== undefined ? parseFloat(amount) : existing.amount,
      category !== undefined ? category : existing.category,
      date !== undefined ? date : existing.date,
      id
    );
    
    return this.getById(id);
  }

  static delete(id) {
    const existing = this.getById(id);
    if (!existing) {
      return false;
    }

    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
    stmt.run(id);
    return true;
  }

  static getCategories() {
    return VALID_CATEGORIES;
  }
}

module.exports = ExpenseModel;
