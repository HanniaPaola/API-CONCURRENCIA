const http = require('http');
const url = require('url');
const FilesController = require('./controllers/filesController');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Función para parsear el body de las peticiones
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

// Crear servidor HTTP
const server = http.createServer(async (req, res) => {
    // Headers CORS y JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    logger.info('Request received', {
        method: req.method,
        path: pathname,
        pid: process.pid
    });

    try {
        // Health check
        if (pathname === '/health' && req.method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify({
                status: 'OK',
                pid: process.pid,
                uptime: process.uptime()
            }));
            return;
        }

        // GET /api/files/stats
        if (pathname === '/api/files/stats' && req.method === 'GET') {
            await FilesController.getStats({ query }, res);
            return;
        }

        // GET /api/files/read
          if (pathname === '/api/files/read' && req.method === 'GET') {
              await FilesController.readFile(req, res); // ✅ pasa el request real
              return;
          }


          // POST /api/files/write
          if (pathname === '/api/files/write' && req.method === 'POST') {
              req.body = await parseBody(req);
              await FilesController.writeFile(req, res);
              return;
          }

          // POST /api/files/copy
          if (pathname === '/api/files/copy' && req.method === 'POST') {
              req.body = await parseBody(req);
              await FilesController.copyFile(req, res);
              return;
          }

          // POST /api/files/process
            if (pathname === '/api/files/process' && req.method === 'POST') {
                req.body = await parseBody(req);
                await FilesController.processFile(req, res);
                return;
            }

            // GET /api/external/aggregate
            if (pathname === '/api/external/aggregate' && req.method === 'GET') {
                const ExternalApiController = require('./controllers/ExternalApiController');
                await ExternalApiController.aggregateApis(req, res);
                return;
            }


          // POST /api/files/batch
          if (pathname === '/api/files/batch' && req.method === 'POST') {
              req.body = await parseBody(req);
              await FilesController.processBatch(req, res);
              return;
          }


        // 404 Not Found
        res.writeHead(404);
        res.end(JSON.stringify({
            success: false,
            error: 'Not Found'
        }));

    } catch (error) {
        logger.error('Server error', { error: error.message, stack: error.stack });
        res.writeHead(500);
        res.end(JSON.stringify({
            success: false,
            error: 'Internal server error'
        }));
    }
});

// Start server
if (require.main === module) {
    server.listen(PORT, () => {
        logger.info('Server started', { port: PORT, pid: process.pid });
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = server;