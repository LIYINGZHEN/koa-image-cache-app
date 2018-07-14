const sharp = require('sharp');
const md5 = require('md5');

/**
 * Resize image and return the required data format.
 *
 * @param {object}
 * @returns {object} the required data format
 */
const resizeImage = async ({ customFech, img_url }) => {
  const res = await customFech.fetch(img_url);
  const buffer = await res.buffer();

  const { data, info } = await sharp(buffer)
    .resize(200)
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
