const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/data/tools.db');

// Get all sessions
router.get('/', (req, res) => {
  db.all('SELECT * FROM sessions', [], (err, rows) => {
    if (err) {
      console.error('Error fetching sessions:', err);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }
    res.json(rows);
  });
});

// Create a new session
router.post('/', (req, res) => {
  const { id, agentId, createdAt, messages } = req.body;
  const query = `INSERT INTO sessions (id, agentId, createdAt, messages) VALUES (?, ?, ?, ?)`;
  db.run(query, [id, agentId, createdAt, JSON.stringify(messages)], (err) => {
    if (err) {
      console.error('Error creating session:', err);
      return res.status(500).json({ error: 'Failed to create session' });
    }
    res.status(201).json({ message: 'Session created successfully' });
  });
});

module.exports = router;