const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const pollRoutes = require('./routes/polls');

const app = express();
const db = require('./db');

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health check route
app.get('/api/health', async (req, res) => {
    const debugInfo = db.getDebugInfo ? db.getDebugInfo() : { error: 'debug tool missing' };
    try {
        const dbStatus = process.env.DATABASE_URL ? 'Defined' : 'UNDEFINED (CRITICAL)';
        if (!process.env.DATABASE_URL) {
            return res.status(500).json({ status: 'error', database: 'missing_url', env: 'DATABASE_URL is not set in Render settings', debug: debugInfo });
        }

        await db.query('SELECT 1');
        res.json({
            status: 'ok',
            database: 'connected',
            url_status: dbStatus,
            debug: debugInfo,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('HEALTH CHECK FAILED:', err);
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error_message: err.message,
            error_code: err.code,
            debug: debugInfo,
            hint: 'Check your DATABASE_URL and SSL settings in Render'
        });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);

app.get('/', (req, res) => {
    res.send('Online Polling System API is running. Visit /api/health to check status.');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    res.status(500).json({ message: 'Something went wrong on the server!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
