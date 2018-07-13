const Koa = require('koa');
const Router = require('koa-router');
const respond = require('koa-respond');
const sharp = require('sharp');
const md5 = require('md5');

const { PENDING, INPROGRSS } = require('./constants');

let CustomFech = require('./customFech');
let customFech = CustomFech.build();

const app = new Koa();

app.use(respond());

let router = new Router();

const reg_post1 = require('./reg_post1');
const reg_post2 = require('./reg_post2');

const reg_image = {};

let finished = null;
let duration = null;
let imageUpdated = 0;
let status = PENDING;

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

async function main(posts) {
  customFech = CustomFech.build();
  const start = new Date();
  status = INPROGRSS;
  let updateCount = 0;

  for (const post of posts) {
    const { id, img_url } = post;

    if (reg_image[id]) {
      const res = await customFech.fetch(img_url);
      const lastModified = res.headers.get('last-modified');
      if (new Date(lastModified) - new Date(reg_image[id].modified) > 0) {
        reg_image[id] = await resizeImage({ catchRes: res });
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
  const { imageTotalSize, postCount } = customFech.getStatus();

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
