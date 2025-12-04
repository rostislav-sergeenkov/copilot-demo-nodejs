const http = require('http');
const { handleRequest } = require('./routes/api');
const { initializeDatabase } = require('./database/init');

const PORT = process.env.PORT || 3000;

// Initialize database
initializeDatabase();

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  handleRequest(req, res);
});

server.listen(PORT, () => {
  console.log(`Expense Tracker server running on http://localhost:${PORT}`);
});

module.exports = server;
