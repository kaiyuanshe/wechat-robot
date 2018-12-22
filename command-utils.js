const Dialog = require('./dialog');
const Parser = require('./msg-parser');
const DBUtils = require('./db-utils');
const RoomID = require('./roomid.json');
const WorkergroupLeader = require('./workgroup_leader.json');

exports.accept_user = async function (bot, user_name, type){
  console.log(type);
  DBUtils.get_user(user_name, async function (user) {
    if (user){
      var contact = await bot.Contact.load(user.wechat_id);
      if (contact.friend()){
	var room_id = RoomID[user.work_group];
	console.log(room_id);
        var room = await bot.Room.load(room_id);
	var wechat_user = await bot.Contact.load(user.wechat_id);
        if(room){
	  var text = "欢迎新朋友：" + user.nick_name + "\n" + user.nick_name + "的自我介绍：" + user.introduce;
          room.add(wechat_user);
          room.say(text);
	  DBUtils.update_user_status(user.wechat_id, '已加入');
	  if(type=="正式"){
	    var formal_room_id = RoomID["正式个人成员群"];
	    var formal_room = await bot.Room.load(formal_room_id);
	    formal_room.add(wechat_user);
	    formal_room.say(text);
	    DBUtils.update_user_position(user.wechat_id, '正式成员');
	  }
        }
      }
    }
  });
}

exports.do_user_command = async function (bot, msg){ 
  var msg_text = await Parser.getMsgText(bot, msg);
  if (msg_text.slice(0, 6) == '#join ') {
    msg_text = msg_text.slice(6);
    var room_id = RoomID['开源社迎新群'];
    var room = await bot.Room.load(room_id);
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
  if(WorkergroupLeader[room_topic]){
    if(WorkergroupLeader[room_topic]==from_name || from_name=='庄表伟'){
      if (msg_text.slice(0,8)=="@开源社-bot"){
        msg_text = msg_text.slice(9);
        if (msg_text.slice(0,2)=="接纳" || msg_text.slice(0,2)=="同意"){
          this.accept_user(bot, msg_text.slice(2), "预备");
        }
	if (msg_text.slice(0,2)=="正式"){
	  this.accept_user(bot, msg_text.slice(2), "正式");
	}
      }
    }
  }
}
