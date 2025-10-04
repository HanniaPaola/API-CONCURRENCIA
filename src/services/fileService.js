const WorkerFactory = require('./workerFactory');
const Observer = require('../utils/observer');
const logger = require('../utils/logger');
const os = require('os');

// Service que coordina las operaciones con workers
class FileService {
    constructor() {
        const numCPUs = os.cpus().length;
        this.workerFactory = new WorkerFactory(numCPUs);
        this.observer = new Observer();

        // Suscribir logger a eventos del worker factory
        this.setupObservers();
    }

    setupObservers() {
        this.workerFactory.on('taskStarted', (data) => {
            logger.info('Tarea iniciada', data);
            this.observer.notify({ event: 'taskStarted', ...data });
        });

        this.workerFactory.on('taskCompleted', (data) => {
            logger.info('Tarea completada', data);
            this.observer.notify({ event: 'taskCompleted', ...data });
        });

        this.workerFactory.on('taskFailed', (data) => {
            logger.error('Tarea fallida', data);
            this.observer.notify({ event: 'taskFailed', ...data });
        });
    }

    async readFile(filePath) {
        return await this.workerFactory.executeTask('read', { filePath });
    }

    async writeFile(filePath, content) {
        return await this.workerFactory.executeTask('write', { filePath, content });
    }

    async copyFile(source, destination) {
        return await this.workerFactory.executeTask('copy', { source, destination });
    }

    async processFile(filePath) {
        return await this.workerFactory.executeTask('process', { filePath });
    }

    async processBatch(files, operation) {
        const promises = files.map(file => {
            switch (operation) {
                case 'read':
                    return this.readFile(file);
                case 'process':
                    return this.processFile(file);
                default:
                    throw new Error(`Operación no soportada: ${operation}`);
            }
        });

        return await Promise.all(promises);
    }

    getStats() {
        return this.workerFactory.getStats();
    }

    subscribeToEvents(callback) {
        this.observer.subscribe(callback);
    }

    async shutdown() {
        await this.workerFactory.terminateAll();
    }
}

module.exports = FileService;