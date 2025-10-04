// cluster.js
import cluster from 'node:cluster';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { fork } from 'node:child_process';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Proceso primario PID ${process.pid}`);
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} terminó. Reiniciando...`);
    cluster.fork();
  });
} else {

  import('./server.js');
  console.log(`Worker PID ${process.pid} ejecutando servidor`);
}
