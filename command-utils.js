const Dialog = require('./dialog');
const Parser = require('./msg-parser');
const DBUtils = require('./db-utils');
const RoomID = require('./roomid.json');
const WorkergroupLeader = require('./workgroup_leader.json');
const Leaders = require('./leaders.json');
const COSConRooms = require('./coscon_rooms.json');
const KYSRooms = require('./kys_rooms.json');

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

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
  msg_text = msg_text.trim();
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
  } else if(msg_text.slice(0,12) == '#joincoscon '){
    msg_text = msg_text.slice(12);
    room_index = 0;
    room_id = COSConRooms[room_index];
    var room = await bot.Room.load(room_id);
    if (room) {
      await room.add(msg.from());
      await room.say("欢迎新朋友：" + msg.from().name());
      await room.say(msg.from().name() + "的自我介绍：" + msg_text);
    } else {
      console.log("没有找到房间");
    }
  } else if(msg_text.slice(0,9)=='#joinkys2'){
    var room = await bot.Room.load('17853987174@chatroom');
    if(room){
      await room.add(msg.from());
    }
  } else if(msg_text == '#merge'){
    var from_name = await msg.from().name();
    if (from_name == "庄表伟"){
      var room0 = await bot.Room.load(COSConRooms[0]);
      var room0list= await room0.memberAll();
      var room0userlist = [];
      var time_count = 0;
      for(let room0user of room0list){
	room0userlist.push(room0user.id);
      }
      for(let room_id of COSConRooms){
        var room = await bot.Room.load(room_id);
	console.log(room_id);
	var list = await room.memberAll();
	for(let user of list){
	  if (room0userlist.indexOf(user.id) == -1){
	    sleep(3000*time_count).then(()=>{
	      user.say("合并现场观众到一个大群，已经加入的同学请忽略");
	      room0.add(user);
	    });
	    time_count = time_count + 1;
	  }
	}
      }
    }
  } else {
    var from_name = await msg.from().name();
    if (from_name != "开源社-bot" && from_name != "微信团队"){
      var reply = Dialog.getReply(msg_text);
      msg.say(reply);
    }
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
  if(room_topic=="开源社.2019 理事会+执行委员会" || room_topic=="COSCon'19组委会"){
    if(Leaders.indexOf(from_name)>=0){
      if (msg_text.slice(0,8)=="@开源社-bot"){
        msg_text = msg_text.slice(9);
	if (msg_text.slice(0,2)=="群发"){
	  const list = await bot.Contact.findAll();
	  list.forEach(async function (item, index) {
	    sleep(2000*index).then(()=>{
	      item.say(msg_text.slice(2));
	    });
	  });
	}
	if (msg_text.slice(0,6)=="COSCon"){
	  for(let room_id of COSConRooms){
	    var room = await bot.Room.load(room_id);
	    room.say(msg_text.slice(7));
	  }
	}
	if (msg_text.slice(0,3)=="kys"){
	  for(let room_id of KYSRooms){
	    var room = await bot.Room.load(room_id);
	    room.say(msg_text.slice(3));
	  }
	}
      }
    }
  }
}
