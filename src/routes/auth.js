const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../../users.json');

function readUsers() {
    try {
        const data = fs.readFileSync(usersPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function saveUsers(users) {
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

// Middleware to check if user is authenticated
const checkAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Middleware to check if user is admin
const checkAdmin = (req, res, next) => {
    const users = readUsers();
    const user = users.find(u => u.id === req.session.userId);
    if (user && user.isAdmin) {
        next();
    } else {
        res.redirect('/');
    }
};

router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        req.session.userId = user.id;
        res.redirect(user.isAdmin ? '/admin' : '/');
    } else {
        res.redirect('/login');
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = { router, checkAuth, checkAdmin }; 