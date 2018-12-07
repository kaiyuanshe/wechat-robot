const Dialog = require('./dialog');
const Parser = require('./msg-parser');
const DBUtils = require('./db-utils');

exports.accept_user = async function (bot, user_name){
  DBUtils.get_user(user_name, async function (user) {
    if (user){
      var contact = await bot.Contact.load(user.wechat_id);
      if (contact.friend()){
        var room = await bot.Room.find({ topic: '开源社.'+user.work_group});
	var wechat_user = await bot.Contact.load(user.wechat_id);
        if(room){
          await room.add(wechat_user);
          await room.say("欢迎新朋友：" + user.nick_name);
          await room.say(user.nick_name + "的自我介绍：" + user.introduce);
          DBUtils.update_user_status(user.wechat_id,"已加入");
        }
      }
    }
  });
}

exports.do_user_command = async function (bot, msg){ 
  var msg_text = await Parser.getMsgText(bot, msg);
  if (msg_text.slice(0, 6) == '#join ') {
    msg_text = msg_text.slice(6);
    var room = await bot.Room.find({ topic: '开源社迎新群' });
    if (room) {
      await room.add(msg.from());
      await room.say("欢迎新朋友：" + msg.from().name());
      await room.say(msg.from().name() + "的自我介绍：" + msg_text);
    } else {
      console.log("没有找到房间");
    }
  } else {
    var reply = Dialog.getReply(msg_text);
    msg.say(reply);
  }
}

exports.do_room_command = async function (bot, msg) {
  var msg_text = await Parser.getMsgText(bot, msg);
  var room_topic = await msg.room().topic();
  var from_name = await msg.from().name();
  console.log(msg_text);
  console.log(room_topic);
  console.log(from_name);
  if (room_topic=="开源社.成员发展工作组" && (from_name=="Yolanda钟源" || from_name=="庄表伟")){
    if (msg_text.slice(0,8)=="@开源社-bot"){
      msg_text = msg_text.slice(9);
      if (msg_text.slice(0,2)=="接纳" || msg_text.slice(0,2)=="同意"){
        this.accept_user(bot, msg_text.slice(2));
      }
    }
  }
}
