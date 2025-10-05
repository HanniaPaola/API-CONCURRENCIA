const fetch = require('node-fetch');

class ExternalApiController {
  static async aggregateApis(req, res) {
    try {
      // URLs de las 3 APIs externas
      const apis = [
        'https://api.agify.io?name=michael',
        'https://api.genderize.io?name=michael',
        'https://api.nationalize.io?name=michael'
      ];

      // Consumir todas en paralelo
      const results = await Promise.all(
        apis.map(url => fetch(url).then(r => r.json()))
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: results }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
  }
}

module.exports = ExternalApiController;
