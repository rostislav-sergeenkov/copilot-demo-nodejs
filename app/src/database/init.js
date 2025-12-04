const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/expenses.db');

let db = null;

function getDatabase() {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

function initializeDatabase() {
  const database = getDatabase();
  
  database.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL CHECK(category IN (
        'Groceries',
        'Transport',
        'Housing and Utilities',
        'Restaurants and Cafes',
        'Health and Medicine',
        'Clothing & Footwear',
        'Entertainment'
      )),
      date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database initialized successfully');
  return database;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// Reset database for testing
function resetDatabase() {
  closeDatabase();
  db = null;
}

module.exports = {
  getDatabase,
  initializeDatabase,
  closeDatabase,
  resetDatabase
};
