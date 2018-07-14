const { PENDING, INPROGRSS } = require('../constants');

const { resizeImage, getLastModified, getImageTotalSize } = require('../utils');

class CacheImg {
  constructor() {
    this.reg_image = {};
    this.startTime = null;
    this.endTime = null;

    this.status = {
      imageCount: 0,
      imageTotalSize: 0,
      previousUpdate: {
        finished: null,
        duration: null,
        imageUpdated: 0
      },
      currentUpdate: {
        status: PENDING,
        postCount: 0
      }
    };
  }

  async start(posts) {
    this.startTime = new Date();
    this.status.currentUpdate.status = INPROGRSS;
    await this._mainProcess(posts);
    this._done();
  }

  getStatus() {
    return {
      ...this.status,
      ...{
        imageCount: Object.keys(this.reg_image).length,
        imageTotalSize: getImageTotalSize(this.reg_image)
      }
    };
  }

  async _resizeAndCount(id, img_url) {
    this.reg_image[id] = await resizeImage(img_url);
    this.status.currentUpdate.postCount++;
  }

  _isNewer(timeA, timeB) {
    return new Date(timeA) - new Date(timeB) > 0;
  }

  async _mainProcess(posts) {
    for (const post of posts) {
      const { id, img_url } = post;

      if (this.reg_image[id]) {
        const lastModified = await getLastModified(img_url);
        if (this._isNewer(lastModified, this.reg_image[id].modified)) {
          await this._resizeAndCount(id, img_url);
        }
      } else {
        await this._resizeAndCount(id, img_url);
      }
    }
  }

  _done() {
    this.endTime = new Date();

    this.status.previousUpdate = {
      finished: this.endTime,
      duration: this.endTime - this.startTime,
      imageUpdated: this.status.currentUpdate.postCount
    };

    this._resetCurrentStatus();
  }

  _resetCurrentStatus() {
    this.status.currentUpdate = {
      status: PENDING,
      postCount: 0
    };
  }
}

module.exports = CacheImg;
