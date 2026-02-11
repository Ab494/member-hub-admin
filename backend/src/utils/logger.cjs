const path = require('path');
const fs = require('fs');

const logsDir = path.join(__dirname, '..', '..', 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = {
  info: (msg) => {
    const time = new Date().toISOString();
    console.log(`[${time}] INFO: ${msg}`);
    fs.appendFileSync(path.join(logsDir, 'combined.log'), `[${time}] INFO: ${msg}\n`);
  },
  error: (msg) => {
    const time = new Date().toISOString();
    console.error(`[${time}] ERROR: ${msg}`);
    fs.appendFileSync(path.join(logsDir, 'error.log'), `[${time}] ERROR: ${msg}\n`);
  },
};

module.exports = logger;
