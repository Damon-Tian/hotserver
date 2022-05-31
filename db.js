const mongoose = require("mongoose");

mongoose.connect(
  "mongodb://damon:qqtianjiang520@127.0.0.1:27017/damonDB",
  function (err) {
    if (err) {
      console.log("连接失败");
    } else {
      console.log("连接成功");
    }
  }
);

let imgSchema = mongoose.Schema({
  name: String,
  width: String,
  height: String,
  src: String,
});
const Img = mongoose.model("damonImg", imgSchema);

module.exports = {
  Img,
};
