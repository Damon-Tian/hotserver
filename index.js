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
    // encoding: "gzip",
    // formidable: {
    //   uploadDir: path.join(__dirname, "/upload/img"), // 设置文件上传目录
    //   keepExtensions: true, // 保持文件的后缀
    //   maxFieldsSize: 2 * 1024 * 1024, // 文件上传大小
    //   onFileBegin: (name, file) => {
    //     // 文件上传前的设置
    //     console.log(`name: ${name}`);
    //     console.log(file);
    //   },
    // },
  })
);
app.use(router.routes()).use(router.allowedMethods());

app.listen(2222, () => {
  console.log("服务已开启,http://127.0.0.1:2222/");
});

// const mongoose = require("mongoose");

// mongoose.connect("mongodb://127.0.0.1:27017/test", function (err) {
//   if (err) {
//     console.log("连接失败");
//   } else {
//     console.log("连接成功");
//   }
// });
