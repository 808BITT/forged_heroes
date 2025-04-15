/**
 * This script is a one-time migration tool to convert tool specs from the old format 
 * into the new format used by the server. You only need to run this once.
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const TOOLS_JSON_PATH = path.join(__dirname, '..', '..', 'data', 'tools.json');
const DB_PATH = path.join(__dirname, 'data', 'tools.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }

    console.log('Connected to SQLite database');
    db.run(`CREATE TABLE IF NOT EXISTS tools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    parameters TEXT,
    status TEXT,
    lastModified TEXT
  )`, (err) => {
        if (err) {
            console.error('Error creating tools table:', err);
            return;
        }

        migrateTools();
    });
});

function migrateTools() {
    fs.readFile(TOOLS_JSON_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading tools.json:', err);
            return;
        }

        let tools;
        try {
            tools = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing tools.json:', parseErr);
            return;
        }

        const insertStmt = db.prepare(`INSERT OR REPLACE INTO tools (id, name, description, category, parameters, status, lastModified)
                                   VALUES (?, ?, ?, ?, ?, ?, ?)`);

        for (const id in tools) {
            const tool = tools[id];
            insertStmt.run(
                id,
                tool.name,
                tool.description,
                tool.category,
                JSON.stringify(tool.parameters),
                tool.status,
                tool.lastModified,
                (err) => {
                    if (err) {
                        console.error(`Error inserting tool with ID ${id}:`, err);
                    } else {
                        console.log(`Successfully inserted tool with ID ${id}`);
                    }
                }
            );
        }

        insertStmt.finalize((err) => {
            if (err) {
                console.error('Error finalizing statement:', err);
            } else {
                console.log('Migration completed successfully.');
            }
            db.close();
        });
    });
}
