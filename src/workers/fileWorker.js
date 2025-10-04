const { parentPort } = require('worker_threads');
const fs = require('fs').promises;
const path = require('path');

// Worker que procesa operaciones de archivos
parentPort.on('message', async (task) => {
    try {
        const { operation, data, taskId } = task;
        let result;

        switch (operation) {
            case 'read':
                result = await readFile(data.filePath);
                break;
            case 'write':
                result = await writeFile(data.filePath, data.content);
                break;
            case 'copy':
                result = await copyFile(data.source, data.destination);
                break;
            case 'process':
                result = await processFile(data.filePath);
                break;
            default:
                throw new Error(`Operación desconocida: ${operation}`);
        }

        parentPort.postMessage({
            success: true,
            taskId,
            result,
            operation
        });

    } catch (error) {
        parentPort.postMessage({
            success: false,
            taskId: task.taskId,
            error: error.message,
            operation: task.operation
        });
    }
});

// Funciones de operaciones I/O
async function readFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    return {
        filePath,
        content,
        size: content.length,
        timestamp: new Date().toISOString()
    };
}

async function writeFile(filePath, content) {
    await fs.writeFile(filePath, content, 'utf-8');
    const stats = await fs.stat(filePath);
    return {
        filePath,
        size: stats.size,
        timestamp: new Date().toISOString()
    };
}

async function copyFile(source, destination) {
    await fs.copyFile(source, destination);
    const stats = await fs.stat(destination);
    return {
        source,
        destination,
        size: stats.size,
        timestamp: new Date().toISOString()
    };
}

async function processFile(filePath) {
    // Simula procesamiento I/O: lee, procesa y guarda
    const content = await fs.readFile(filePath, 'utf-8');
    const processed = content.toUpperCase(); // Procesamiento simple
    const outputPath = filePath.replace('.txt', '_processed.txt');
    await fs.writeFile(outputPath, processed, 'utf-8');

    return {
        originalFile: filePath,
        processedFile: outputPath,
        originalSize: content.length,
        processedSize: processed.length,
        timestamp: new Date().toISOString()
    };
}