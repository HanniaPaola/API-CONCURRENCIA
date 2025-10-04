#!/usr/bin/env node
import autocannon from 'autocannon';

const urls = [
  'http://localhost:3000/health',
  'http://localhost:3000/aggregate'
];

for (const url of urls) {
  console.log(`\n--- Prueba de carga en ${url} ---`);
  autocannon({
    url,
    connections: 10,
    amount: 100,
  }, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log(autocannon.printResult(result));
    }
  });
}
