const { Worker } = require('worker_threads');
const path = require('path');
const EventEmitter = require('events');

// Patrón Factory para crear y gestionar workers
class WorkerFactory extends EventEmitter {
    constructor(maxWorkers = 4) {
        super();
        this.maxWorkers = maxWorkers;
        this.workers = [];
        this.taskQueue = [];
        this.activeTask = new Map();
        this.taskIdCounter = 0;
    }

    // Crea un nuevo worker
    createWorker() {
        const worker = new Worker(path.join(__dirname, '../workers/fileWorker.js'));

        worker.on('message', (result) => {
            this.handleWorkerMessage(worker, result);
        });

        worker.on('error', (error) => {
            this.handleWorkerError(worker, error);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker detenido con código: ${code}`);
            }
            this.removeWorker(worker);
        });

        this.workers.push({ worker, busy: false });
        return worker;
    }

    // Ejecuta una tarea usando un worker disponible
    executeTask(operation, data) {
        return new Promise((resolve, reject) => {
            const taskId = ++this.taskIdCounter;
            const task = {
                taskId,
                operation,
                data,
                resolve,
                reject,
                startTime: Date.now()
            };

            this.taskQueue.push(task);
            this.processQueue();
        });
    }

    // Procesa la cola de tareas
    processQueue() {
        if (this.taskQueue.length === 0) return;

        const availableWorker = this.workers.find(w => !w.busy);

        if (availableWorker) {
            const task = this.taskQueue.shift();
            this.assignTaskToWorker(availableWorker, task);
        } else if (this.workers.length < this.maxWorkers) {
            const newWorker = this.createWorker();
            const workerObj = this.workers.find(w => w.worker === newWorker);
            const task = this.taskQueue.shift();
            this.assignTaskToWorker(workerObj, task);
        }
    }

    // Asigna una tarea a un worker específico
    assignTaskToWorker(workerObj, task) {
        workerObj.busy = true;
        this.activeTask.set(workerObj.worker, task);

        workerObj.worker.postMessage({
            taskId: task.taskId,
            operation: task.operation,
            data: task.data
        });

        // Notificar mediante patrón Observer
        this.emit('taskStarted', {
            taskId: task.taskId,
            operation: task.operation
        });
    }

    // Maneja el mensaje del worker
    handleWorkerMessage(worker, result) {
        const workerObj = this.workers.find(w => w.worker === worker);
        const task = this.activeTask.get(worker);

        if (workerObj && task) {
            workerObj.busy = false;
            this.activeTask.delete(worker);

            const executionTime = Date.now() - task.startTime;

            if (result.success) {
                task.resolve({
                    ...result.result,
                    executionTime
                });

                // Notificar mediante patrón Observer
                this.emit('taskCompleted', {
                    taskId: result.taskId,
                    operation: result.operation,
                    executionTime
                });
            } else {
                task.reject(new Error(result.error));

                // Notificar mediante patrón Observer
                this.emit('taskFailed', {
                    taskId: result.taskId,
                    operation: result.operation,
                    error: result.error
                });
            }

            this.processQueue();
        }
    }

    // Maneja errores del worker
    handleWorkerError(worker, error) {
        const task = this.activeTask.get(worker);
        if (task) {
            task.reject(error);
            this.activeTask.delete(worker);
        }
        this.removeWorker(worker);
        this.processQueue();
    }

    // Remueve un worker
    removeWorker(worker) {
        const index = this.workers.findIndex(w => w.worker === worker);
        if (index !== -1) {
            this.workers.splice(index, 1);
        }
    }

    // Termina todos los workers
    async terminateAll() {
        const promises = this.workers.map(w => w.worker.terminate());
        await Promise.all(promises);
        this.workers = [];
        this.taskQueue = [];
        this.activeTask.clear();
    }

    // Obtiene estadísticas
    getStats() {
        return {
            totalWorkers: this.workers.length,
            busyWorkers: this.workers.filter(w => w.busy).length,
            queuedTasks: this.taskQueue.length,
            activeTasks: this.activeTask.size
        };
    }
}

module.exports = WorkerFactory;