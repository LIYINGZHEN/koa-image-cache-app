const request = require('request');

/**
 * Get last-modified header.
 *
 * @param {string} url the image url
 * @returns {string} returns the last-modified header
 */
const getLastModified = url =>
  new Promise((resolve, reject) =>
    request(url, { method: 'HEAD' }, (err, res) => {
      if (err) {
        return reject('error when getting header');
      } else {
        return resolve(res.headers['last-modified']);
      }
    })
  );

module.exports = getLastModified;
