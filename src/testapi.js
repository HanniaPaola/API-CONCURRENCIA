const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper para hacer GET
function get(path) {
    return new Promise((resolve, reject) => {
        http.get(BASE_URL + path, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
        }).on('error', reject);
    });
}

// Helper para hacer POST
function post(path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        const req = http.request(BASE_URL + path, options, (res) => {
            let response = '';
            res.on('data', chunk => response += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(response) }));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function runTests() {
    console.log('🔹 Test GET /health');
    console.log(await get('/health'));

    console.log('\n🔹 Test GET /api/files/read');
    console.log(await get('/api/files/read?path=./test.txt'));

    console.log('\n🔹 Test POST /api/files/write');
    console.log(await post('/api/files/write', {
        path: './test_write.txt',
        content: 'Hola desde testApi.js'
    }));

    console.log('\n🔹 Test POST /api/files/copy');
    console.log(await post('/api/files/copy', {
        source: './test_write.txt',
        destination: './test_copy.txt'
    }));

    console.log('\n🔹 Test POST /api/files/process');
    console.log(await post('/api/files/process', {
        path: './test.txt'
    }));
}

runTests().catch(err => console.error('Error en tests:', err));
