const sharp = require('sharp');
const md5 = require('md5');

const resizeImage = async ({ catchRes, customFech, img_url }) => {
  const res = catchRes ? catchRes : await customFech.fetch(img_url);
  const mimeType = res.headers.get('content-type');
  const modified = res.headers.get('last-modified');
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
    modified,
    mimeType
  };
};

module.exports = resizeImage;
