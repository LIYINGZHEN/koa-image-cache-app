const Koa = require('koa');
const Router = require('koa-router');
const respond = require('koa-respond');

const { PENDING, INPROGRSS } = require('./constants');
const {
  resizeImage,
  CustomFech,
  getImageTotalSize,
  getLastModified
} = require('./utils');

let customFech = CustomFech.build();

const app = new Koa();

app.use(respond());

let router = new Router();

const reg_post1 = require('./data/reg_post1');
const reg_post2 = require('./data/reg_post2');

const reg_image = {};

let finished = null;
let duration = null;
let imageUpdated = 0;
let status = PENDING;

async function main(posts) {
  customFech = CustomFech.build();
  const start = new Date();
  status = INPROGRSS;
  let updateCount = 0;

  for (const post of posts) {
    const { id, img_url } = post;

    if (reg_image[id]) {
      const lastModified = await getLastModified(img_url);
      if (new Date(lastModified) - new Date(reg_image[id].modified) > 0) {
        reg_image[id] = await resizeImage({ img_url, customFech });
        updateCount++;
      }
    } else {
      reg_image[id] = await resizeImage({ img_url, customFech });
      updateCount++;
    }
  }

  const end = new Date();

  customFech.finish();
  duration = end - start;
  finished = end;
  imageUpdated = updateCount;
  status = PENDING;
}

router.get('/tumbnail/:postid/:filename', async (ctx, next) => {
  const postId = ctx.params.postid;
  const image = reg_image[postId];
  ctx.ok(image.buffer).set({ 'last-modified': image.modified });
});

router.get('/status', async (ctx, next) => {
  const { postCount } = customFech.getStatus();
  const imageTotalSize = getImageTotalSize(reg_image);

  ctx.ok({
    imageCount: Object.keys(reg_image).length,
    imageTotalSize,
    previousUpdate: {
      finished,
      duration,
      imageUpdated
    },
    currentUpdate: {
      status,
      postCount
    }
  });
});

router.get('/test1', async (ctx, next) => {
  await main(reg_post1);
  console.log('reg_image', reg_image);
  ctx.ok('OK');
});

router.get('/test2', async (ctx, next) => {
  await main(reg_post2);
  console.log('reg_image', reg_image);
  ctx.ok('OK');
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
