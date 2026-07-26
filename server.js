const express = require('express');
const mysql = require('mysql');
const app = express();


/* ---------- SQL SERVER CONFIG (SQL AUTH) ---------- */
const dbConfig = {
    user: 'sales_user',
    password: 'sales123',
    server: 'DESKTOP-LN70SB9\\SQLEXPRESS',
    database: 'EcommerceApp',
    driver: 'tedious',  // ← This forces the correct driver
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        instanceName: 'SQLEXPRESS'  // ← Add this too
    }
};

connection.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Secure API endpoint
app.get('/api/products/:id', (req, res) => {
  const productId = req.params.id;

  const query = 'SELECT * FROM products WHERE id = ?';

  connection.query(query, [productId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
app.get('/api/Products', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Products');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

