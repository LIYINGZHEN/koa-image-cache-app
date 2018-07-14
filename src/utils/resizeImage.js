const fetch = require('node-fetch');
const sharp = require('sharp');
const md5 = require('md5');

/**
 * Resize image and return the required data format.
 *
 * @param {string} img_url the image url
 * @param {object} options {width, height}
 */
const resizeImage = async (img_url, options) => {
  const res = await fetch(img_url);
  const buffer = await res.buffer();

  const { data, info } = await sharp(buffer)
    .resize(options.width, options.height)
    .toBuffer({
      resolveWithObject: true
    });

  return {
    buffer: data,
    hash: md5(data),
    fileExt: info.format,
    modified: res.headers.get('last-modified'),
    mimeType: res.headers.get('content-type')
  };
};

module.exports = resizeImage;
