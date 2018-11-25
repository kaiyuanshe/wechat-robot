exports.greeting = "你好，我是开源社的微信机器人。输入help可以查看如何与我交流。";

exports.getReply = function (msg) {
  switch(msg) {
    case "help":
      return "命令格式：#keyword 其他内容\n#join 申请理由。      申请加入开源社，机器人会将你拉入一个预备成员群。\n#projects         列出目前开源社的开源项目。\n#about        关于这个微信机器人的介绍.";
    case "#projects":
      return "1. KCoin：基于区块链的开源项目激励平台\n2. 开放黑客松：Open Hackathon Platform\n3. 开源社官网：基于Github Pages的开源社官方网站\n4. Wechat-Robot：开源社微信机器人\n#project 序号，了解更多";
    case "#project 1":
      return "KCoin，基于区块链（超级账本）技术，服务开源项目，实现快捷方便的开源贡献积分平台，并提供兑换机制，激励更多的开源贡献。项目地址：  https://github.com/kaiyuanshe/kcoin";
    default:
      return "输入help可以查看如何与我交流。";
  }
}
