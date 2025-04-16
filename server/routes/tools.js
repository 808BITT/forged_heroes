const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/data/tools.db');

// Get all tools
router.get('/', (req, res) => {
    db.all('SELECT * FROM tools', [], (err, rows) => {
        if (err) {
            console.error('Error fetching tools:', err);
            return res.status(500).json({ error: 'Failed to fetch tools' });
        }
        res.json(rows);
    });
});

// Get a tool by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM tools WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error fetching tool:', err);
            return res.status(500).json({ error: 'Failed to fetch tool' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Tool not found' });
        }
        res.json(row);
    });
});

// Create a new tool
router.post('/', (req, res) => {
    const { id, name, description, category, parameters, status, lastModified } = req.body;
    const query = `INSERT INTO tools (id, name, description, category, parameters, status, lastModified) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [id, name, description, category, JSON.stringify(parameters), status, lastModified], (err) => {
        if (err) {
            console.error('Error creating tool:', err);
            return res.status(500).json({ error: 'Failed to create tool' });
        }
        res.status(201).json({ message: 'Tool created successfully' });
    });
});

// Update a tool
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, category, parameters, status, lastModified } = req.body;
    const query = `UPDATE tools SET name = ?, description = ?, category = ?, parameters = ?, status = ?, lastModified = ? WHERE id = ?`;
    db.run(query, [name, description, category, JSON.stringify(parameters), status, lastModified, id], (err) => {
        if (err) {
            console.error('Error updating tool:', err);
            return res.status(500).json({ error: 'Failed to update tool' });
        }
        res.json({ message: 'Tool updated successfully' });
    });
});

// Delete a tool
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM tools WHERE id = ?`;
    db.run(query, [id], (err) => {
        if (err) {
            console.error('Error deleting tool:', err);
            return res.status(500).json({ error: 'Failed to delete tool' });
        }
        res.status(204).send();
    });
});

module.exports = router;