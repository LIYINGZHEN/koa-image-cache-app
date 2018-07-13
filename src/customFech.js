const fetch = require('node-fetch');

class CustomFech {
  static build() {
    const customFech = new CustomFech();
    return new Proxy(customFech, {
      get: (target, property) => customFech[property] || fetch[property]
    });
  }

  constructor() {
    this.status = {
      imageTotalSize: 0,
      postCount: 0
    };
  }

  async fetch(img_url) {
    const res = await fetch(img_url);
    const contentLength = res.headers.get('content-length');
    this.status.imageTotalSize += Number(contentLength);
    this.status.postCount++;
    return res;
  }

  getStatus() {
    return this.status;
  }

  finish() {
    this.status.postCount = 0;
  }
}

module.exports = CustomFech;
