// routes/tododb.js
const express = require('express');
const db = require('../database/db');
const router = express.Router();

// Ambil semua tiket
router.get('/tickets', (req, res) => {
    db.query('SELECT * FROM tiket', (err, tickets) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.json(tickets);
    });
});

// Proses pembelian tiket
router.post('/orders', (req, res) => {
    const { users_id, tiket_id, jumlah_tiket } = req.body;

    // Ambil harga tiket berdasarkan tiket_id
    db.query('SELECT harga FROM tiket WHERE id = ?', [tiket_id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.length === 0) return res.status(404).send('Tiket tidak ditemukan');

        const harga_tiket = results[0].harga;
        const total_harga = harga_tiket * jumlah_tiket;

        // Simpan pesanan tiket ke tabel orders
        db.query('INSERT INTO orders (pengunjung_id, tiket_id, jumlah_tiket, total_harga) VALUES (?, ?, ?, ?)', 
            [users_id, tiket_id, jumlah_tiket, total_harga], (err, result) => {
                if (err) return res.status(500).send('Error processing order');
                res.redirect('/orders');
        });
    });
});

// Ambil semua pesanan
router.get('/orders', (req, res) => {
    db.query('SELECT * FROM orders', (err, orders) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.json(orders);
    });
});

module.exports = router;
