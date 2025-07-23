// Це файл /api/test.js
module.exports = (req, res) => {
    // Встановлюємо правильні заголовки
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Просто відправляємо успішну відповідь
    res.status(200).json({ message: "Hello from Vercel Serverless Function!" });
};