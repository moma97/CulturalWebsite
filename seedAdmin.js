// seedAdmin.js
const bcrypt = require('bcrypt');
const db = require('./db/db');

const username = 'admin';
const password = 'password'; 

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err.message);
    } else {
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash], (err) => {
            if (err) {
                console.error('Error inserting admin user:', err.message);
            } else {
                console.log('Admin user inserted successfully.');
            }
        });
    }
});