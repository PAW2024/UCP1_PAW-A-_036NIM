const express = require('express');
const app = express();
const db = require('./database/db');
require('dotenv').config();
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

// Mengimpor routes
const authRoutes = require('./routes/authRoutes');

// Menggunakan express-ejs-layouts untuk layout
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfigurasi session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Menyertakan middleware routes untuk auth (login, logout)
app.use('/', authRoutes);

// Route untuk halaman utama (index)
app.get('/', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect ke login jika user belum login
    }

    // Ambil data pengguna dari database berdasarkan session userId
    db.query('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, results) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }

        const user = results[0]; // Ambil data user pertama

        res.render('index', {
            layout: 'layouts/main-layout',
            user: user // Kirim data user ke EJS
        });
    });
});


// Route untuk halaman tiket (Daftar tiket yang tersedia)
app.get('/tickets', (req, res) => {
    db.query('SELECT * FROM tiket', (err, tickets) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        res.render('ticket', {
            layout: 'layouts/main-layout',
            tickets: tickets
        });
    });
});

// Route untuk memproses pesanan tiket
app.post('/orders', (req, res) => {
    const { tiket_id, jumlah_tiket } = req.body;
    const pengunjung_id = req.session.userId; // Menggunakan session untuk ID pengunjung yang login

    // Mengambil detail tiket berdasarkan tiket_id
    db.query('SELECT * FROM tiket WHERE id = ?', [tiket_id], (err, result) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }

        const tiket = result[0];

        // Validasi stok tiket
        if (jumlah_tiket > tiket.stok) {
            return res.status(400).send('Stok tidak mencukupi');
        }

        // Hitung total harga
        const total_harga = tiket.harga * jumlah_tiket;

        // Menyimpan pesanan ke dalam tabel orders
        db.query('INSERT INTO orders (users_id, tiket_id, jumlah_tiket, total_harga) VALUES (?, ?, ?, ?)', 
            [pengunjung_id, tiket_id, jumlah_tiket, total_harga], 
            (err) => {
                if (err) {
                    return res.status(500).send('Internal Server Error');
                }

                // Update stok tiket setelah pesanan berhasil
                db.query('UPDATE tiket SET stok = stok - ? WHERE id = ?', 
                    [jumlah_tiket, tiket_id], 
                    (err) => {
                        if (err) {
                            return res.status(500).send('Internal Server Error');
                        }

                        res.redirect('/tickets'); // Redirect ke halaman tiket setelah pemesanan berhasil
                    }
                );
            }
        );
    });
});

// Route untuk halaman kontak
app.get('/contact', (req, res) => {
    res.render('contact', { layout: 'layouts/main-layout' });
});

// Menjalankan server pada port yang ditentukan di file .env
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
