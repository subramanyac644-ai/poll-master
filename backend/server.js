const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
const envPath = path.join(__dirname, '.env');
if (!isProduction && fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`[INIT] .env loaded successfully.`);
}

const authRoutes = require('./routes/auth');
const pollRoutes = require('./routes/polls');
const exploreRoutes = require('./routes/explore_v2');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const app = express();
const db = require('./db');

// Performance Middleware
app.use(compression());

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'https://poll-master-sigma.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(cookieParser());
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

// Heartbeat route to prevent sleeping
app.get('/api/ping', (req, res) => {
    res.status(200).send('pong');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/explore', exploreRoutes);

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
