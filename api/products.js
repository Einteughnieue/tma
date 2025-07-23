// Це оновлений /api/products.js

// Цей лог виконається в момент, коли Vercel намагається зібрати функцію
console.log('[API BUILD] products.js file is being parsed.');

module.exports = (req, res) => {
    // Цей лог виконається при кожному запиті
    console.log('[API RUNTIME] Request received for /api/products.');

    try {
        const path = require('path');
        const sqlite3 = require('sqlite3').verbose();
        
        console.log('[API RUNTIME] Dependencies (path, sqlite3) loaded successfully.');

        const dbPath = path.resolve(process.cwd(), 'db', 'database.db');
        console.log(`[API RUNTIME] Database path resolved to: ${dbPath}`);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.error('[API RUNTIME ERROR] DB Connection Error:', err.message);
                // Повертаємо помилку у відповіді
                return res.status(500).json({ error: 'DB Connection Error', details: err.message });
            }
        });

        console.log('[API RUNTIME] Database object created.');

        const sql = `SELECT * FROM products ORDER BY id ASC`;
        db.all(sql, [], (err, rows) => {
            db.close();
            if (err) {
                console.error('[API RUNTIME ERROR] DB Query Error:', err.message);
                return res.status(500).json({ error: 'DB Query Error', details: err.message });
            }
            console.log(`[API RUNTIME] Query successful, fetched ${rows.length} rows.`);
            return res.status(200).json(rows);
        });

    } catch (e) {
        // Ловимо будь-які інші помилки, наприклад, якщо `require('sqlite3')` не спрацював
        console.error('[API FATAL ERROR] A critical error occurred:', e.message);
        return res.status(500).json({ error: 'Fatal Server Error', details: e.message });
    }
};