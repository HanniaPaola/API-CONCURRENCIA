import fetch from 'node-fetch';

class ApiFetcher {
  constructor(url) {
    this.url = url;
  }
  async fetch() {
    const res = await fetch(this.url);
    return res.json();
  }
}

class AggregateService {
  constructor() {
    if (AggregateService.instance) return AggregateService.instance;
    AggregateService.instance = this;
    this.apiMap = {
      users: new ApiFetcher('https://jsonplaceholder.typicode.com/users'),
      posts: new ApiFetcher('https://jsonplaceholder.typicode.com/posts')
    };
  }

  async getAggregatedData() {
    const fetchers = Object.values(this.apiMap).map(f => f.fetch());
    const [users, posts] = await Promise.all(fetchers);

    return {
      totalUsers: users.length,
      totalPosts: posts.length,
      sampleUser: users[0],
      samplePost: posts[0]
    };
  }
}

export default new AggregateService();
