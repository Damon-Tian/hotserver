const Koa = require("koa"),
  app = new Koa(),
  cors = require("koa2-cors");

const router = require("./router");
const koaBody = require("koa-body");
const path = require("path");
const koaStatic = require("koa-static");
app.use(
  cors({
    origin: function (ctx) {
      //设置允许来自指定域名请求
      return "*"; // 允许来自所有域名请求
    },
    maxAge: 5, //指定本次预检请求的有效期，单位为秒。
    credentials: true, //是否允许发送Cookie
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], //设置所允许的HTTP请求方法
    allowHeaders: ["Content-Type", "Authorization", "Accept"], //设置服务器支持的所有头信息字段
    exposeHeaders: ["WWW-Authenticate", "Server-Authorization"], //设置获取其他自定义字段
  })
);
app.use(koaStatic(path.join(__dirname, "/upload")));
app.use(
  koaBody({
    multipart: true, // 支持文件上传
  })
);
app.use(router.routes()).use(router.allowedMethods());

app.listen(2222, () => {
  console.log("服务已开启,http://127.0.0.1:2222/");
});
