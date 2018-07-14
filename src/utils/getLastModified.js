const request = require('request');

const getLastModified = url =>
  new Promise((resolve, reject) =>
    request(url, { method: 'HEAD' }, (err, res, body) => {
      if (err) {
        return reject('error when getting header');
      } else {
        return resolve(res.headers['last-modified']);
      }
    })
  );

module.exports = getLastModified;
