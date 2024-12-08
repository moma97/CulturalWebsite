const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const db = require('./db/db');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware för att hantera statiska filer
app.use(express.static(path.join(__dirname, 'public')));

// Body-parser middleware för att hantera POST-data (t.ex. login, form submission)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Middleware för att kontrollera autentisering
function checkAuth(req, res, next) {
    if (req.session.user && req.session.user.isAuthenticated) {
        next();
    } else {
        res.redirect('/public/login.html');
    }
}

// Route för startsidan
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route för login-sidan
app.get('/public/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route för admin-sidan, med autentiseringskontroll
app.get('/public/admin.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Route för admin-inloggning
app.post('/public/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        if (!user) {
            return res.status(401).send('Felaktigt användarnamn eller lösenord');
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                req.session.user = {
                    isAuthenticated: true,
                    username: user.username
                };
                res.redirect('/public/admin.html');
            } else {
                res.status(401).send('Felaktigt användarnamn eller lösenord');
            }
        });
    });
});

// Route för att uppdatera aktiviteter
app.post('/admin/update', checkAuth, (req, res) => {
    const { 'event-title': title, 'event-date': date, 'event-time': time } = req.body;
    db.run(`INSERT INTO events (title, date, time) VALUES (?, ?, ?)`, [title, date, time], (err) => {
        if (err) {
            res.status(500).send('Database error');
        } else {
            res.send('Event updated successfully');
        }
    });
});

// Route för att hämta kommande aktiviteter
app.get('/events', (req, res) => {
    db.all(`SELECT * FROM events ORDER BY date`, [], (err, rows) => {
        if (err) {
            res.status(500).send('Database error');
        } else {
            res.json(rows);
        }
    });
});

// Starta servern
app.listen(PORT, () => {
    console.log(`Servern är igång på port ${PORT}`);
});