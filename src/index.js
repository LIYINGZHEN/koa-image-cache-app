const Koa = require('koa');
const Router = require('koa-router');
const respond = require('koa-respond');
const sharp = require('sharp');
const md5 = require('md5');

let CustomFech = require('./customFech');
let customFech;

const app = new Koa();

app.use(respond());

let router = new Router();

const reg_post = require('./reg_post');

const reg_image = {};

let finished = null;
let duration = null;
let imageUpdated = 0;
let status = 'inprogress';
let postCount = 0;

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

async function main() {
  customFech = CustomFech.build();
  const start = new Date();
  status = 'inprogress';

  for (const post of reg_post) {
    const { id, img_url } = post;

    if (reg_image[id]) {
      const res = await customFech.fetch(img_url);
      const lastModified = res.headers.get('last-modified');
      if (new Date(lastModified) - new Date(reg_image[id].modified) > 0) {
        reg_image[id] = await resizeImage({ catchRes: res });
      }
    } else {
      reg_image[id] = await resizeImage({ img_url, customFech });
    }

    postCount++;
  }

  const end = new Date();

  duration = end - start;
  finished = end;
  imageUpdated = postCount;
  status = 'pending';
  postCount = 0;
}

main().then(() => console.log('reg_image', reg_image));

router.get('/tumbnail/:postid/:filename', async (ctx, next) => {
  const postId = ctx.params.postid;

  const image = reg_image[postId];

  ctx.ok(image.buffer).set({ 'last-modified': image.modified });
});

router.get('/status', async (ctx, next) => {
  ctx.ok({
    imageCount: reg_image.length,
    imageTotalSize: customFech.getImageTotalSize(),
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

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
