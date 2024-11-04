const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { checkAuth, checkAdmin } = require('./auth');
const { generateMatches } = require('../utils/matching');
const User = require('../models/User');

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

router.get('/admin', [checkAuth, checkAdmin], (req, res) => {
    const users = readUsers();
    const notReadyUsers = users.filter(u => !u.ready && !u.isAdmin);
    const allUsersReady = notReadyUsers.length === 0;
    
    console.log('Users with matches:', users.map(u => ({
        username: u.username,
        matchedWith: u.matchedWith
    })));
    
    res.render('admin', {
        users,
        allUsersReady,
        title: 'Admin Panel',
        error: req.query.error
    });
});

router.post('/match-users', [checkAuth, checkAdmin], (req, res) => {
    const users = readUsers();
    try {
        const updatedUsers = generateMatches(users);
        saveUsers(updatedUsers);
        
        console.log('Matches generated:', updatedUsers.map(u => ({
            username: u.username,
            matchedWith: u.matchedWith
        })));
        
        res.redirect('/admin');
    } catch (error) {
        console.error('Matching error:', error);
        res.redirect('/admin');
    }
});

router.post('/add-user', [checkAuth, checkAdmin], (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();

    // Check if username already exists or is 'admin' (case insensitive)
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return res.redirect('/admin?error=Username already exists');
    }

    if (username.toLowerCase() === 'admin') {
        return res.redirect('/admin?error=Username cannot be "admin"');
    }

    const newUser = {
        id: Date.now(),
        username,
        password,
        isAdmin: false,
        ready: false,
        likes: [],
        dislikes: [],
        matchedWith: null
    };

    users.push(newUser);
    saveUsers(users);
    res.redirect('/admin');
});

router.post('/delete-user/:id', [checkAuth, checkAdmin], (req, res) => {
    const users = readUsers();
    const userToDelete = users.find(u => u.id === parseInt(req.params.id));
    
    // Check if user exists and is not an admin
    if (!userToDelete || userToDelete.isAdmin) {
        return res.redirect('/admin?error=Cannot delete admin user');
    }

    const updatedUsers = users.filter(u => u.id !== parseInt(req.params.id));
    saveUsers(updatedUsers);
    res.redirect('/admin');
});

module.exports = router; 