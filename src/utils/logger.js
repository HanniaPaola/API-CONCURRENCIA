const fs = require('fs');
const path = require('path');

// Patrón Singleton para el logger
class Logger {
    constructor() {
        if (Logger.instance) {
            return Logger.instance;
        }

        this.logDir = path.join(__dirname, '../../logs');
        this.ensureLogDirectory();
        Logger.instance = this;
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    log(level, message, data = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data,
            pid: process.pid
        };

        const logMessage = JSON.stringify(logEntry);
        console.log(logMessage);

        // Escribir en archivo (operación I/O)
        const logFile = path.join(this.logDir, `app-${this.getDateString()}.log`);
        fs.appendFileSync(logFile, logMessage + '\n');
    }

    getDateString() {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    info(message, data) {
        this.log('INFO', message, data);
    }

    error(message, data) {
        this.log('ERROR', message, data);
    }

    warn(message, data) {
        this.log('WARN', message, data);
    }

    debug(message, data) {
        this.log('DEBUG', message, data);
    }
}

// Exportar instancia única (Singleton)
module.exports = new Logger();