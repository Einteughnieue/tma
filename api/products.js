// ================== ФАЙЛ: /api/products.js (ФІНАЛЬНА, НАЙНАДІЙНІША ВЕРСІЯ) ================== */

// ВИКОРИСТОВУЄМО СТАРИЙ СИНТАКСИС, ЯКИЙ ТЕПЕР ПРАЦЮЄ
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Обгортаємо весь код в обробник
module.exports = (req, res) => {
    // Встановлюємо заголовки одразу
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        // Шлях до бази даних. process.cwd() вказує на корінь проекту на сервері Vercel.
        const dbPath = path.resolve(process.cwd(), 'db', 'database.db');
        
        // Перевіряємо, чи є доступ до папки. Це для логів.
        const fs = require('fs');
        try {
            const files = fs.readdirSync(path.resolve(process.cwd()));
            console.log('[API LOG] Files in root directory:', files); // Покаже, чи бачить Vercel папку db
        } catch (e) {
            console.log('[API WARN] Could not read root directory.');
        }

        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                // Якщо не може підключитися, ми побачимо це в логах
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
            
            // Якщо все успішно
            console.log(`[API SUCCESS] Fetched ${rows.length} products successfully.`);
            res.status(200).json(rows);
        });

    } catch (e) {
        // Ловимо будь-які інші непередбачувані помилки
        console.error('[API FATAL] Unexpected server error:', e.message);
        res.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
};