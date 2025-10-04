const FileService = require('../services/fileService');
const logger = require('../utils/logger');

// Instancia única del servicio
const fileService = new FileService();

// Función helper para enviar respuestas JSON
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode);
    res.end(JSON.stringify(data));
}

// Controller para operaciones de archivos
class FilesController {

    // GET /api/files/read?path=ruta
    static async readFile(req, res) {
        try {
            const { path } = req.query;

            if (!path) {
                return sendJSON(res, 400, {
                    success: false,
                    error: 'Path is required'
                });
            }

            const result = await fileService.readFile(path);

            sendJSON(res, 200, {
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Error reading file', { error: error.message });
            sendJSON(res, 500, {
                success: false,
                error: error.message
            });
        }
    }

    // POST /api/files/write
    static async writeFile(req, res) {
        try {
            const { path, content } = req.body;

            if (!path || !content) {
                return sendJSON(res, 400, {
                    success: false,
                    error: 'Path and content are required'
                });
            }

            const result = await fileService.writeFile(path, content);

            sendJSON(res, 200, {
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Error writing file', { error: error.message });
            sendJSON(res, 500, {
                success: false,
                error: error.message
            });
        }
    }

    // POST /api/files/copy
    static async copyFile(req, res) {
        try {
            const { source, destination } = req.body;

            if (!source || !destination) {
                return sendJSON(res, 400, {
                    success: false,
                    error: 'Source and destination are required'
                });
            }

            const result = await fileService.copyFile(source, destination);

            sendJSON(res, 200, {
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Error copying file', { error: error.message });
            sendJSON(res, 500, {
                success: false,
                error: error.message
            });
        }
    }

    // POST /api/files/process
    static async processFile(req, res) {
        try {
            const { path } = req.body;

            if (!path) {
                return sendJSON(res, 400, {
                    success: false,
                    error: 'Path is required'
                });
            }

            const result = await fileService.processFile(path);

            sendJSON(res, 200, {
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Error processing file', { error: error.message });
            sendJSON(res, 500, {
                success: false,
                error: error.message
            });
        }
    }

    // POST /api/files/batch
    static async processBatch(req, res) {
        try {
            const { files, operation } = req.body;

            if (!files || !Array.isArray(files) || files.length === 0) {
                return sendJSON(res, 400, {
                    success: false,
                    error: 'Files array is required'
                });
            }

            if (!operation) {
                return sendJSON(res, 400, {
                    success: false,
                    error: 'Operation is required'
                });
            }

            const results = await fileService.processBatch(files, operation);

            sendJSON(res, 200, {
                success: true,
                data: results,
                count: results.length
            });
        } catch (error) {
            logger.error('Error processing batch', { error: error.message });
            sendJSON(res, 500, {
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/files/stats
    static getStats(req, res) {
        try {
            const stats = fileService.getStats();
            sendJSON(res, 200, {
                success: true,
                data: stats
            });
        } catch (error) {
            logger.error('Error getting stats', { error: error.message });
            sendJSON(res, 500, {
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = FilesController;