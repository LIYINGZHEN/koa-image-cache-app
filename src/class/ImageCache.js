const { PENDING, INPROGRSS } = require('../constants');

const { resizeImage, getLastModified, getImageTotalSize } = require('../utils');

class ImageCache {
  constructor({ width, height }) {
    this.imageWidth = width;
    this.imageHeight = height;

    this.reg_image = {};

    this.status = {
      imageCount: 0,
      imageTotalSize: 0,
      previousUpdate: {
        finished: null,
        duration: null,
        imageUpdated: 0
      },
      currentUpdate: {
        status: PENDING
      }
    };

    this.updateCount = 0;
    this.startTime = null;
    this.endTime = null;
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
    this.reg_image[id] = await resizeImage(img_url, {
      width: this.imageWidth,
      height: this.imageHeight
    });
    this.updateCount++;
  }

  _isNewer(timeA, timeB) {
    return new Date(timeA) - new Date(timeB) > 0;
  }

  async _mainProcess(posts) {
    for (const post of posts) {
      const { id, img_url } = post;
      try {
        if (this.reg_image[id]) {
          const lastModified = await getLastModified(img_url);
          if (this._isNewer(lastModified, this.reg_image[id].modified)) {
            await this._resizeAndCount(id, img_url);
          }
        } else {
          await this._resizeAndCount(id, img_url);
        }
      } catch (error) {
        console.error('error at _mainProcess', error);
      }
    }
  }

  _done() {
    this.endTime = new Date();

    this.status.previousUpdate = {
      finished: this.endTime,
      duration: this.endTime - this.startTime,
      imageUpdated: this.updateCount
    };

    this._resetStatus();
  }

  _resetStatus() {
    this.status.currentUpdate.status = PENDING;
    this.updateCount = 0;
  }
}

module.exports = ImageCache;
