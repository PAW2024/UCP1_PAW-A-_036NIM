// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/middleware');

// Halaman login
router.get('/login', (req, res) => {
    res.render('login', { layout: 'layouts/main-layout' });
});

// Proses login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.length === 0) {
            return res.render('login', { layout: 'layouts/main-layout', error: 'Username or password is incorrect' });
        }

        const user = results[0];

        // Verifikasi password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).send('Internal Server Error');
            if (!isMatch) {
                return res.render('login', { layout: 'layouts/main-layout', error: 'Username or password is incorrect' });
            }

            req.session.user = user;
            res.redirect('/');
        });
    });
});

// Halaman sign-up
router.get('/signup', (req, res) => {
    res.render('signup', { layout: 'layouts/main-layout' });
});

// Proses sign-up
router.post('/signup', (req, res) => {
    const { username, password } = req.body;
    
    // Enkripsi password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).send('Error hashing password');
        
        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, results) => {
            if (err) return res.status(500).send('Internal Server Error');
            res.redirect('/login');
        });
    });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Failed to logout');
        res.redirect('/login');
    });
});

module.exports = router;
