const axios = require('axios');

// Replace with your actual Render backend URL
const RENDER_URL = 'https://poll-master-1.onrender.com/api/ping';

console.log('--- PollMaster Keep-Alive Script ---');
console.log(`Pinging: ${RENDER_URL}`);

async function pingServer() {
    try {
        const start = Date.now();
        const response = await axios.get(RENDER_URL);
        const duration = Date.now() - start;
        console.log(`[${new Date().toLocaleTimeString()}] Pulse detected! Status: ${response.status} (${duration}ms)`);
    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] Pulse failed: ${error.message}`);
    }
}

// Ping immediately on start
pingServer();

// Ping every 14 minutes (Render sleeps after 15 mins of inactivity)
const INTERVAL_MS = 14 * 60 * 1000;
setInterval(pingServer, INTERVAL_MS);

console.log(`Monitoring started. Sending heartbeat every 14 minutes.`);
console.log(`Keep this terminal open to prevent your Render server from sleeping!`);
