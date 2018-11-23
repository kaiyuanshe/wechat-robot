exports.greeting = "你好，我是开源社的微信机器人。输入help可以查看如何与我交流。";

exports.getReply = function (msg) {
  switch(msg) {
    case "help":
      return "命令格式：#keyword 其他内容\n#join 申请理由。      申请加入开源社，机器人会将你拉入一个预备成员群。\n#projects         列出目前开源社的开源项目。\n#about        关于这个微信机器人的介绍.";
    default:
      return "输入help可以查看如何与我交流。";
  }
}
