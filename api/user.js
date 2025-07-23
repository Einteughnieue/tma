// ================== ФАЙЛ: api/user.js (ФІНАЛЬНА ВЕРСІЯ) ================== */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(process.cwd(), 'db', 'database.db');

module.exports = (req, res) => {
    // Налаштування CORS для локальної розробки (можна прибрати для продакшену)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        const { id, name, surname, phone, email, username } = req.body;
        if (!id) return res.status(400).json({ error: 'User ID is required' });

        const db = new sqlite3.Database(dbPath);
        const sql = `
            INSERT INTO users (id, name, surname, phone, email, username) VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name, surname = excluded.surname, phone = excluded.phone, 
                email = excluded.email, username = excluded.username;`;
        
        db.run(sql, [id, name, surname, phone, email, username], (err) => {
            db.close();
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'User updated successfully' });
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};