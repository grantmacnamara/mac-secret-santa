const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { checkAuth } = require('./auth');

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

router.get('/', checkAuth, (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.id === req.session.userId);
    
    if (!user) {
        return res.redirect('/login');
    }

    if (user.isAdmin) {
        return res.redirect('/admin');
    }

    const notReadyUsers = users.filter(u => !u.ready && !u.isAdmin);
    res.render('index', { 
        user, 
        notReadyUsers: notReadyUsers.map(u => u.username),
        title: 'Home'
    });
});

router.post('/update-preferences', checkAuth, (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.id === req.session.userId);

    if (!user) {
        return res.redirect('/login');
    }

    user.likes = Array.isArray(req.body.likes) ? req.body.likes.filter(Boolean) : [];
    user.dislikes = Array.isArray(req.body.dislikes) ? req.body.dislikes.filter(Boolean) : [];
    user.ready = true;

    saveUsers(users);
    res.redirect('/');
});

router.get('/matches', checkAuth, (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.id === req.session.userId);
    
    if (!user) {
        return res.redirect('/login');
    }

    const notReadyUsers = users.filter(u => !u.ready && !u.isAdmin);
    const allUsersReady = notReadyUsers.length === 0;
    
    let matchedUser = null;
    if (user.matchedWith) {
        matchedUser = users.find(u => u.id === user.matchedWith);
    }

    res.render('matches', {
        user,
        matchedUser,
        allUsersReady,
        notReadyUsers,
        title: 'Your Match'
    });
});

module.exports = router; 