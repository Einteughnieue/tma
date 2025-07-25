// Це єдиний вміст файлу /api/test.js

module.exports = (req, res) => {
    // Встановлюємо правильні заголовки
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Дозволяє запити з будь-якого домену

    // Просто відправляємо успішну відповідь з текстом
    res.status(200).json({ 
        status: "success",
        message: "Hello from your Vercel Serverless Function! It works!",
        timestamp: new Date().toISOString()
    });
};