const { Worker } = require('worker_threads');
const path = require('path');
const logger = require('../utils/logger');
const FileService = require('../services/fileService');

const fileService = new FileService();

function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode);
    res.end(JSON.stringify(data));
}

function runWorker(task) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.resolve(__dirname, '../workers/fileWorker.js'));
        worker.once('message', resolve);
        worker.once('error', reject);
        worker.postMessage(task);
    });
}

class FilesController {

    // GET /api/files/read?path=ruta
    static async readFile(req, res) {
        try {
            const urlObj = new URL(req.url, `http://${req.headers.host}`);
            const filePath = urlObj.searchParams.get('path');

            if (!filePath) return sendJSON(res, 400, { success: false, error: 'Path is required' });

            const result = await runWorker({ operation: 'read', data: { filePath }, taskId: Date.now() });

            sendJSON(res, 200, { success: true, data: result.result });
        } catch (error) {
            logger.error('Error reading file', { error: error.message });
            sendJSON(res, 500, { success: false, error: error.message });
        }
    }

    // POST /api/files/write
    static async writeFile(req, res) {
        try {
            const { path: filePath, content } = req.body;
            if (!filePath || !content) return sendJSON(res, 400, { success: false, error: 'Path and content are required' });

            const result = await runWorker({ operation: 'write', data: { filePath, content }, taskId: Date.now() });

            sendJSON(res, 200, { success: true, data: result.result });
        } catch (error) {
            logger.error('Error writing file', { error: error.message });
            sendJSON(res, 500, { success: false, error: error.message });
        }
    }

    // POST /api/files/copy
    static async copyFile(req, res) {
        try {
            const { source, destination } = req.body;
            if (!source || !destination) return sendJSON(res, 400, { success: false, error: 'Source and destination are required' });

            const result = await runWorker({ operation: 'copy', data: { source, destination }, taskId: Date.now() });

            sendJSON(res, 200, { success: true, data: result.result });
        } catch (error) {
            logger.error('Error copying file', { error: error.message });
            sendJSON(res, 500, { success: false, error: error.message });
        }
    }

    // POST /api/files/process
    static async processFile(req, res) {
        try {
            const { path: filePath } = req.body;
            if (!filePath) return sendJSON(res, 400, { success: false, error: 'Path is required' });

            const result = await runWorker({ operation: 'process', data: { filePath }, taskId: Date.now() });

            sendJSON(res, 200, { success: true, data: result.result });
        } catch (error) {
            logger.error('Error processing file', { error: error.message });
            sendJSON(res, 500, { success: false, error: error.message });
        }
    }

    // POST /api/files/batch
    static async processBatch(req, res) {
        try {
            const { files, operation } = req.body;
            if (!files || !Array.isArray(files) || files.length === 0)
                return sendJSON(res, 400, { success: false, error: 'Files array is required' });
            if (!operation) return sendJSON(res, 400, { success: false, error: 'Operation is required' });

            // Ejecutar todas las tareas en paralelo
            const tasks = files.map(filePath =>
                runWorker({ operation, data: { filePath }, taskId: Date.now() })
            );

            const resultsArr = await Promise.all(tasks);
            const results = resultsArr.map(r => r.result);

            sendJSON(res, 200, { success: true, data: results, count: results.length });
        } catch (error) {
            logger.error('Error processing batch', { error: error.message });
            sendJSON(res, 500, { success: false, error: error.message });
        }
    }


    // GET /api/files/stats
    static getStats(req, res) {
        try {
            const stats = fileService.getStats(); // Devuelve totalWorkers, busyWorkers, queuedTasks, activeTasks
            sendJSON(res, 200, { success: true, data: stats });
        } catch (error) {
            logger.error('Error getting stats', { error: error.message });
            sendJSON(res, 500, { success: false, error: error.message });
        }
    }
}

module.exports = FilesController;