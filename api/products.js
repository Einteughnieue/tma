// ================== ФАЙЛ: /api/products.js (ФІНАЛЬНА НАДІЙНА ВЕРСІЯ) ================== */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

module.exports = (req, res) => {
    // Встановлюємо заголовки, щоб уникнути CORS-помилок і вказати тип відповіді
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        const dbPath = path.resolve(process.cwd(), 'db', 'database.db');
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.error('[API FATAL] DB Connection Error:', err.message);
                res.status(500).json({ error: 'Server failed to connect to the database.' });
                return;
            }
        });

        const sql = `SELECT * FROM products`;

        db.all(sql, [], (err, rows) => {
            db.close();
            if (err) {
                console.error('[API FATAL] DB Query Error:', err.message);
                res.status(500).json({ error: 'Server failed to execute query.' });
                return;
            }
            // Якщо все добре, віддаємо дані
            res.status(200).json(rows);
        });

    } catch (e) {
        console.error('[API FATAL] Unexpected server error:', e.message);
        res.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
};