const ExternalApiController = require('../controllers/ExternalApiController');

module.exports = (app) => {
    app.get('/api/external/aggregate', ExternalApiController.aggregateApis);
};
