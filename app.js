const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');

// Import routes
const authRoutes = require('./src/routes/auth').router;
const userRoutes = require('./src/routes/user');
const adminRoutes = require('./src/routes/admin');

const app = express();

// Middleware
app.use(morgan('dev')); // Logging
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'secret-santa-session-key',
    resave: false,
    saveUninitialized: false
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Routes
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', adminRoutes);

// Default route
app.get('/', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login');
    } else {
        res.redirect('/matches');
    }
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).render('error', {
        title: '404 Not Found',
        message: 'Page not found',
        error: {}
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        title: 'Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
}); 