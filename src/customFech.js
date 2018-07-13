const fetch = require('node-fetch');

class CustomFech {
  static build() {
    const customFech = new CustomFech();
    return new Proxy(customFech, {
      get: (target, property) => customFech[property] || fetch[property]
    });
  }

  constructor() {
    this.imageTotalSize = 1;
  }

  async fetch(img_url) {
    const res = await fetch(img_url);
    const contentLength = res.headers.get('content-length');
    this.imageTotalSize += Number(contentLength);
    return res;
  }

  getImageTotalSize() {
    return this.imageTotalSize;
  }
}

module.exports = CustomFech;
