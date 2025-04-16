const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/data/tools.db');

// Get all provider configurations
router.get('/', (req, res) => {
  db.all('SELECT * FROM providers', [], (err, rows) => {
    if (err) {
      console.error('Error fetching providers:', err);
      return res.status(500).json({ error: 'Failed to fetch providers' });
    }
    res.json(rows);
  });
});

// Create a new provider configuration
router.post('/', (req, res) => {
  const { id, providerName, apiKey, config } = req.body;
  const query = `INSERT INTO providers (id, providerName, apiKey, config) VALUES (?, ?, ?, ?)`;
  db.run(query, [id, providerName, apiKey, JSON.stringify(config)], (err) => {
    if (err) {
      console.error('Error creating provider:', err);
      return res.status(500).json({ error: 'Failed to create provider' });
    }
    res.status(201).json({ message: 'Provider created successfully' });
  });
});

module.exports = router;