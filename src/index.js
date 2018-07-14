const Koa = require('koa');
const Router = require('koa-router');
const respond = require('koa-respond');

const ImageCache = require('./class/ImageCache');

const { IMAGE_WIDTH, IMAGE_HEIGHT } = require('./constants');

const imageCache = new ImageCache({
  width: IMAGE_WIDTH,
  height: IMAGE_HEIGHT
});

const app = new Koa();
const port = process.env.PORT || 3000;

app.use(respond());

let router = new Router();

router.get('/tumbnail/:postid/:filename', async ctx => {
  const postId = ctx.params.postid;
  const image = imageCache.reg_image[postId];
  if (image) {
    ctx.ok(image.buffer).set({ 'last-modified': image.modified });
  } else {
    ctx.notFound('Image not found');
  }
});

router.get('/status', async ctx => {
  ctx.ok(imageCache.getStatus());
});

router.get('/test1', async ctx => {
  const reg_post1 = require('./data/reg_post1');
  await imageCache.start(reg_post1);
  console.log('reg_image', imageCache.reg_image);
  ctx.ok('OK');
});

router.get('/test2', async ctx => {
  const reg_post2 = require('./data/reg_post2');
  await imageCache.start(reg_post2);
  console.log('reg_image', imageCache.reg_image);
  ctx.ok('OK');
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(port, err => {
  if (err) throw err;
  console.log(`> ready on http://localhost:${port}`);
});
