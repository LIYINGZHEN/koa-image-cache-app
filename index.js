const Koa = require('koa');
const Router = require('koa-router');
const respond = require('koa-respond');
const fetch = require('node-fetch');
const sharp = require('sharp');

const app = new Koa();

app.use(respond());

let router = new Router();

router.get('/catch-image', async (ctx, next) => {
  const res = await fetch(
    'https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg'
  );
  const mimeType = res.headers.get('content-type');
  const modified = res.headers.get('last-modified');
  const buffer = await res.buffer();
  const { data, info } = await sharp(buffer).resize(200).toBuffer({
    resolveWithObject: true
  });
  ctx
    .ok({
      buffer: data,
      modified,
      mimeType
    })
    .set({ 'last-modified': modified });
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
