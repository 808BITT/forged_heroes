const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/data/tools.db');

// Get all tools in the armory
router.get('/', (req, res) => {
    db.all('SELECT * FROM tools', [], (err, rows) => {
        if (err) {
            console.error('Error fetching tools:', err);
            return res.status(500).json({ error: 'Failed to fetch tools' });
        }
        res.json(rows);
    });
});

module.exports = router;