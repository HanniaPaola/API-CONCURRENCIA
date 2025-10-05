import fetch from 'node-fetch';

class AggregateService {
    constructor() {
        if (AggregateService.instance) return AggregateService.instance;
        AggregateService.instance = this;
    }

    async fetchApis() {
        const urls = [
        'https://api.agify.io?name=michael',
        'https://api.genderize.io?name=michael',
        'https://api.nationalize.io?name=michael',
        'https://www.boredapi.com/api/activity',
        'https://dog.ceo/api/breeds/image/random',
        'https://catfact.ninja/fact',
        'https://api.adviceslip.com/advice',
        'https://v2.jokeapi.dev/joke/Any',
        'https://api.coindesk.com/v1/bpi/currentprice.json',
        'http://universities.hipolabs.com/search?country=Mexico'
        ];

        const start = Date.now();

        try {
        const responses = await Promise.all(
            urls.map(url => fetch(url).then(res => res.json()))
        );

        const duration = Date.now() - start;

        return {
            success: true,
            duration: `${duration} ms`,
            count: responses.length,
            data: responses
        };
        } catch (error) {
        return { success: false, error: error.message };
        }
    }
    }

    export default new AggregateService();
