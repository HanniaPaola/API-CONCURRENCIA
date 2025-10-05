import autocannon from 'autocannon';

const endpoints = [
  { url: 'http://localhost:3000/health', method: 'GET' },
  { url: 'http://localhost:3000/api/files/read?path=./test.txt', method: 'GET' },
  { 
    url: 'http://localhost:3000/api/files/write', 
    method: 'POST',
    body: JSON.stringify({ path: './test_write.txt', content: 'Contenido de prueba' })
  },
  {
    url: 'http://localhost:3000/api/files/copy',
    method: 'POST',
    body: JSON.stringify({ source: './test_write.txt', destination: './test_copy.txt' })
  },
  {
    url: 'http://localhost:3000/api/files/process',
    method: 'POST',
    body: JSON.stringify({ path: './test.txt' })
  },
  {
    url: 'http://localhost:3000/api/files/batch',
    method: 'POST',
    body: JSON.stringify({ files: ['./test.txt', './test_write.txt'], operation: 'process' })
  }
];

async function runTests() {
  for (const endpoint of endpoints) {
    console.log(`\n--- Prueba de carga en ${endpoint.url} ---`);
    
    await new Promise((resolve, reject) => {
      autocannon({
        url: endpoint.url,
        method: endpoint.method,
        connections: 10,
        amount: 50,
        headers: { 'Content-Type': 'application/json' },
        body: endpoint.body
      }, (err, result) => {
        if (err) return reject(err);
        console.log(autocannon.printResult(result));
        resolve();
      });
    });
  }
}

runTests().catch(console.error);
