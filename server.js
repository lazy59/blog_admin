const path = require("path");
const koa = require("koa");
const static = require("koa-static");
const cors = require("koa2-cors");
const bodyparser = require("koa-bodyparser");
const router = require("koa-router");
const mongoose = require("mongoose");
const koaJwt = require("koa-jwt");

const { JWT_KEY, apiAuth } = require("./config");

// 链接数据库
const mongoUrl =
  process.env.NODE_ENV === "production"
    ? "mongodb://XXX:XXX@127.0.0.1:19889/test?authSource=admin"
    : "mongodb://127.0.0.1:27017/test";
mongoose.connect(mongoUrl, { useNewUrlParser: true }, (err) => {
  if (err) throw err;
  console.log("数据库连接成功！");
});

// 创建app
const app = new koa();

app.use(
  cors({
    origin: function (ctx) {
      return "*";
    },
    credentials: true,
    allowMethods: ["GET", "POST"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(bodyparser());

app.use(function (ctx, next) {
  return next().catch((err) => {
    if (401 == err.status) {
      ctx.status = 401;
      ctx.body = "无权限";
    } else {
      throw err;
    }
  });
});

app.use(
  koaJwt({ secret: JWT_KEY }).unless({
    path: [
      /^\/$/,
      /^\/api\/user\/login/,
      /^\/api\/user\/getkey/,
      /^\/dist/,
      /^\/avatar/,
      /^\/api\/category/,
      /(\.js|\.css|\.jpg|\.gif|\.ico|\.png|\.html)$/,
      "/api/article/getshowarticles",
      "/api/article/searcharticles",
      "/api/article/getarticleinfo",
    ],
  })
);

app.use(async (ctx, next) => {
  const url = ctx.request.path;
  let hasAuth = true;
  for (let i = 0; i < apiAuth.length; i++) {
    const item = apiAuth[i];
    if (item.apis.indexOf(url) >= 0) {
      const { role } = ctx.state.user.data;
      if (item.roles.indexOf(role) === -1) {
        hasAuth = false;
        break;
      }
    }
  }
  if (hasAuth) {
    await next();
  } else {
    ctx.status = 401;
    ctx.body = "无权限";
  }
});

// 分类管理
app.use(require("./routers/categoryRouter").routes());
// 用户管理
app.use(require("./routers/userRouter").routes());
// 文章管理
app.use(require("./routers/articleRouter").routes());

//生产环境设置静态目录
app.use(static(path.join(__dirname, "client", "dist")));
app.use(static(path.join(__dirname, "upload")));

app.listen(8002, () => {
  console.log("服务器启动在8002端口");
});
