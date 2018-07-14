const getImageTotalSize = reg_image =>
  Object.keys(reg_image).reduce((acc, key) => {
    const image = reg_image[key];
    return acc + image.buffer.length;
  }, 0);

module.exports = getImageTotalSize;
