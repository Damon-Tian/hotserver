const { resolve } = require("path/posix");
const fs = require("fs");
const path = require("path");

const Router = require("koa-router"),
  cheerio = require("cheerio"),
  charset = require("superagent-charset"),
  superagent = charset(require("superagent")),
  router = new Router();

const userAgent = [
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36 OPR/26.0.1656.60",
  "Opera/8.0 (Windows NT 5.1; U; en)",
  "Mozilla/5.0 (Windows NT 5.1; U; en; rv:1.8.1) Gecko/20061208 Firefox/2.0.0 Opera 9.50",
  "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; en) Opera 9.50",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11",
  "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.133 Safari/534.16",
];

const phoneUserAgent = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366 MicroMessenger/6.7.3(0x16070321) NetType/WIFI Language/zh_CN",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366 MicroMessenger/6.7.3(0x16070321) NetType/WIFI Language/zh_HK",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 11_2 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0 MQQBrowser/8.8.2 Mobile/15B87 Safari/604.1 MttCustomUA/2 QBWebViewType/1 WKType/1",
  "Mozilla/5.0 (iPhone 6s; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0 MQQBrowser/8.3.0 Mobile/15B87 Safari/604.1 MttCustomUA/2 QBWebViewType/1 WKType/1",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 10_1 like Mac OS X) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0 MQQBrowser/8.8.2 Mobile/14B72c Safari/602.1 MttCustomUA/2 QBWebViewType/1 WKType/1",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0_2 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Mobile/15A421 wxwork/2.5.8 MicroMessenger/6.3.22 Language/zh",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15G77 wxwork/2.5.1 MicroMessenger/6.3.22 Language/zh",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 10_1_1 like Mac OS X) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0 MQQBrowser/8.8.2 Mobile/14B100 Safari/602.1 MttCustomUA/2 QBWebViewType/1 WKType/1",
];

const dbModel = require("./db");

router.get("/d", async (ctx, next) => {
  function getData() {
    return new Promise((resolve, reject) => {
      let xx = "";
      superagent
        .get("https://www.bilibili.com/v/popular/all")
        .set({
          "User-Agent": userAgent[Math.floor(Math.random() * 7)],
        })
        .buffer(true)
        .charset("utf-8")
        .end((err, data) => {
          if (err) {
            console.log(err);
            return err;
          }
          let reg = /rankList(.*)}]/g;
          xx = data.text.match(reg);
          resolve(xx);
        });
    });
  }
  let xx = await getData();
  ctx.body = {
    data: { xx, name: "damon" },
    code: 200,
  };
});

router.get("/douban/movie/:page", async (ctx, next) => {
  let page = ctx.params.page;
  if (page > 11) {
    ctx.body = "没有更多了~";
    return;
  }
  let res = await getData();
  function getData() {
    return new Promise((resolve, reject) => {
      superagent
        .get("https://movie.douban.com/top250?start=" + (page - 1) * 25)
        .set({
          "User-Agent": userAgent[Math.floor(Math.random() * 7)],
        })
        .buffer(true)
        .charset("utf-8")
        .end((err, data) => {
          if (err) {
            doubanRes = err;
            console.log("错了");
            return;
          }
          let $ = cheerio.load(data.text, {
              decodeEntities: false,
              ignoreWhitespace: false,
              xmlMode: false,
              lowerCaseTags: false,
            }),
            arr = [];
          $(".grid_view .item").each((index, ele) => {
            let img = $(ele).find(".pic a img").attr("src");
            let title = $(ele).find(".info .hd a").text();
            let pageHref = $(ele).find(".info .hd a").attr("href");
            let directors = $(ele).find(".info .bd p:first-child").text();
            let rank = $(ele).find(".info .bd .star .rating_num").text();
            let rankNumber = $(ele)
              .find(".info .bd .star span:last-child")
              .text();
            let quote = $(ele).find(".info .bd .quote .inq").text();

            let itemObj = {
              img,
              title,
              pageHref,
              directors,
              rank,
              rankNumber,
              quote,
            };
            arr.push(itemObj);
          });
          resolve(arr);
        });
    });
  }
  ctx.body = {
    data: { data: res, name: "damon" },
    code: 200,
  };
});

router.get("/douban/tv/:page", async (ctx, next) => {
  let page = ctx.params.page;
  if (page > 11) {
    ctx.body = "没有更多了~";
    return;
  }
  let res = await getData();
  function getData() {
    return new Promise((resolve, reject) => {
      superagent
        .get(
          "https://www.douban.com/doulist/116238969/?start=" + (page - 1) * 25
        )
        .set({
          "User-Agent": userAgent[Math.floor(Math.random() * 7)],
        })
        .buffer(true)
        .charset("utf-8")
        .end((err, data) => {
          if (err) {
            doubanRes = err;
            console.log("错了");
            return;
          }
          let $ = cheerio.load(data.text, {
              decodeEntities: false,
              ignoreWhitespace: false,
              xmlMode: false,
              lowerCaseTags: false,
            }),
            arr = [];
          $(".doulist-subject").each((index, ele) => {
            let img = $(ele).find(".post a img").attr("src");
            let title = $(ele).find(".title a").text();
            let pageHref = $(ele).find(".title a").attr("href");
            let directors = $(ele).find(".abstract").html();
            let rank = $(ele).find(".rating .rating_nums").text();
            let rankNumber = $(ele).find(".rating span:last-child").text();

            let itemObj = {
              img,
              title,
              pageHref,
              directors,
              rank,
              rankNumber,
            };
            arr.push(itemObj);
          });
          resolve(arr);
        });
    });
  }
  ctx.body = {
    data: { data: res, name: "damon" },
    code: 200,
  };
});

router.get("/douban/book/:page", async (ctx, next) => {
  let page = ctx.params.page;
  if (page > 11) {
    ctx.body = "没有更多了~";
    return;
  }
  let res = await getData();
  function getData() {
    return new Promise((resolve, reject) => {
      superagent
        .get("https://book.douban.com/top250?start=" + (page - 1) * 25)
        .set({
          "User-Agent": userAgent[Math.floor(Math.random() * 7)],
        })
        .buffer(true)
        .charset("utf-8")
        .end((err, data) => {
          if (err) {
            doubanRes = err;
            console.log("错了");
            return;
          }
          let $ = cheerio.load(data.text, {
              decodeEntities: false,
              ignoreWhitespace: false,
              xmlMode: false,
              lowerCaseTags: false,
            }),
            arr = [];
          $("table tbody .item").each((index, ele) => {
            let img = $(ele).find("td:first-child a img").attr("src");
            let title = $(ele).find("td:last-child .pl2").text();
            let pageHref = $(ele).find("td:last-child .pl2 a").attr("href");
            let directors = $(ele).find("td:last-child>.pl").text();
            let rank = $(ele).find("td:last-child .star .rating_nums").text();
            let rankNumber = $(ele).find("td:last-child .star .pl").text();
            let quote = $(ele).find("td:last-child .quote .inq").text();

            let itemObj = {
              img,
              title,
              pageHref,
              directors,
              rank,
              rankNumber,
              quote,
            };
            arr.push(itemObj);
          });
          resolve(arr);
        });
    });
  }
  ctx.body = {
    data: { data: res, name: "damon" },
    code: 200,
  };
});

router.get("/zhihu", async (ctx, next) => {
  let res = await getData();
  function getData() {
    return new Promise((resolve, reject) => {
      superagent
        .get("https://www.zhihu.com/hot")
        .set({
          "User-Agent": phoneUserAgent[Math.floor(Math.random() * 8)],
        })
        .buffer(true)
        .charset("utf-8")
        .end((err, data) => {
          if (err) {
            doubanRes = err;
            console.log("错了");
            return;
          }
          let $ = cheerio.load(data.text, {
              decodeEntities: false,
              ignoreWhitespace: false,
              xmlMode: false,
              lowerCaseTags: false,
            }),
            arr = [];
          $(".css-hi1lih").each((index, ele) => {
            let img = $(ele).find(".css-uw6cz9").attr("src");
            let title = $(ele).find(".css-3yucnr").text();
            let describe = $(ele).find(".css-1o6sw4j").text();
            let pageHref = $(ele).attr("href");
            let hotNumber = $(ele).find(".css-1iqwfle").text();

            let itemObj = {
              img,
              title,
              describe,
              pageHref,
              hotNumber,
            };
            arr.push(itemObj);
          });
          resolve(arr);
        });
    });
  }
  ctx.body = {
    data: res,
    code: 200,
  };
});

router.get("/pic", async (ctx, next) => {
  const list = await dbModel.Img.find();
  ctx.body = {
    code: 200,
    data: list,
  };
});
router.get("/pic/delete/:id", async (ctx, next) => {
  const id = ctx.request.params.id;
  try {
    let item = await dbModel.Img.findById(id);
    await dbModel.Img.deleteOne({ id });
    fs.unlinkSync(path.join(__dirname, "/upload" + item.src));
    ctx.body = {
      code: 200,
      msg: "删除成功",
    };
  } catch {
    ctx.body = {
      code: -1,
      msg: "删除失败",
    };
  }
});
router.post("/upload", async (ctx, next) => {
  let file = ctx.request.files.file; // 获取上传文件
  let data = ctx.request.body;
  // 创建可读流
  let filePath = path.join(__dirname, `/upload/img` + `/${file.name}`);
  const reader = fs.createReadStream(file.path);
  // 创建可写流
  const upStream = fs.createWriteStream(filePath);
  reader.pipe(upStream);

  const imgObj = {
    name: file.name,
    width: data.width,
    height: data.height,
    src: "/img/" + file.name,
  };
  const img = new dbModel.Img(imgObj);
  await img.save();

  ctx.body = {
    data: imgObj,
    code: 200,
  };
});
module.exports = router;
