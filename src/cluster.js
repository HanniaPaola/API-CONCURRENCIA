const cluster = require('cluster');
const os = require('os');
const server = require('./server');

const PORT = process.env.PORT || 3000;

if (cluster.isPrimary) {
    console.log(`Master PID ${process.pid} ejecutando`);

    const numCPUs = os.cpus().length;
    console.log(`Creando ${numCPUs} workers...`);

    for (let i = 0; i < numCPUs; i++) {
        const worker = cluster.fork();
        worker.on('message', msg => {
            console.log(`Mensaje del worker ${worker.process.pid}:`, msg);
        });
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} terminó (code: ${code}, signal: ${signal}). Reiniciando...`);
        cluster.fork();
    });

} else {
    server.listen(PORT, () => {
        console.log(`Worker PID ${process.pid} escuchando en el puerto ${PORT}`);
    });

    process.on('uncaughtException', (err) => {
        console.error(`Error no capturado en worker ${process.pid}:`, err);
        process.exit(1); 
    });

    process.on('unhandledRejection', (reason) => {
        console.error(`Promesa rechazada no manejada en worker ${process.pid}:`, reason);
        process.exit(1);
    });
}
