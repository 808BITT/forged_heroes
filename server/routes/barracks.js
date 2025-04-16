const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/data/tools.db');

// Get all agents
router.get('/', (req, res) => {
    db.all('SELECT * FROM agents', [], (err, rows) => {
        if (err) {
            console.error('Error fetching agents:', err);
            return res.status(500).json({ error: 'Failed to fetch agents' });
        }
        res.json(rows);
    });
});

// Create a new agent
router.post('/', (req, res) => {
    const { id, name, description, assignedToolIds, personality, lastUpdated } = req.body;
    const query = `INSERT INTO agents (id, name, description, assignedToolIds, personality, lastUpdated) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(query, [id, name, description, JSON.stringify(assignedToolIds), personality, lastUpdated], (err) => {
        if (err) {
            console.error('Error creating agent:', err);
            return res.status(500).json({ error: 'Failed to create agent' });
        }
        res.status(201).json({ message: 'Agent created successfully' });
    });
});

module.exports = router;