const express = require('express');
const router = express.Router();
const db = require('../database/db');  // Mengimpor koneksi database

// Menampilkan halaman tiket
router.get('/ticket-view', (req, res) => {
    db.query('SELECT * FROM tiket', (err, rows) => {
        if (err) return res.status(500).send('Database error');
        res.render('ticket', { tickets: rows });  // Render halaman tiket.ejs dengan data tiket
    });
});

// Menambahkan tiket baru dari halaman form
router.post('/add-ticket', (req, res) => {
    const { nama_tiket, harga, stok } = req.body;
    const query = 'INSERT INTO tiket (nama_tiket, harga, stok) VALUES (?, ?, ?)';
    db.query(query, [nama_tiket, harga, stok], (err, result) => {
        if (err) return res.status(500).send('Database error');
        res.redirect('/ticket-view');  // Redirect ke halaman tiket setelah berhasil menambah tiket
    });
});

// Menampilkan pesanan tiket
router.get('/orders', (req, res) => {
    db.query('SELECT * FROM orders', (err, rows) => {
        if (err) return res.status(500).send('Database error');
        res.render('order-view', { orders: rows });  // Render halaman pesanan tiket
    });
});

module.exports = router;
