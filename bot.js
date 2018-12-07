const { Wechaty } = require('wechaty');
const { PuppetPadchat } = require('wechaty-puppet-padchat');
const QRCode = require('qrcode-terminal');
const Parser = require('./msg-parser');
const GitterUtils = require('./gitter-utils');
const CommandUtils = require('./command-utils');
const Dialog = require('./dialog');
const DBUtils = require('./db-utils');

const puppet = new PuppetPadchat();

const bot = new Wechaty({
    name: "kaiyuanshe",
    puppet: puppet
});

function onScan(qrcode, status) {
    QRCode.generate(qrcode, { small: true });
    const qrcodeImageUrl = [
        'https://api.qrserver.com/v1/create-qr-code/?data=',
        encodeURIComponent(qrcode),
    ].join('');
    console.log(status);
    console.log(qrcodeImageUrl);
}

function onLogin(user) {
    console.log(`${user} login`);
}

function onLogout(user) {
    console.log(`${user} logout`);
}

async function onMessage(msg) {
    if (msg.age() > 60) {
        return;
    }
    if (msg.payload) {
        if (msg.room() != null && msg.payload.type != bot.Message.Type.Unknown) {
	    var room = await msg.room();
            console.log(room.topic()+":"+room.id);
            GitterUtils.sendMsgToGitter(bot, msg);
            CommandUtils.do_room_command(bot, msg);
        } else if (msg.payload.type != bot.Message.Type.Unknown && msg.from().name() != "开源社-bot") {
	    CommandUtils.do_user_command(bot, msg);
        }
    }
}

async function onFriendship(friendship) {
    console.log(friendship.toString());
    if (friendship.type() == bot.Friendship.Type.Receive) {
        await friendship.accept();
    } else if (friendship.type() == bot.Friendship.Type.Confirm) {
	var contact = await friendship.contact();
        contact.say(Dialog.greeting);
	DBUtils.save_wechat_friend(contact);
	CommandUtils.accept_user(bot, await friendship.contact().name());
    }
}

bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('logout', onLogout);
bot.on('message', onMessage);
bot.on('friendship', onFriendship);

bot.start()
    .then(() => console.log('Starter Bot Started.'))
    .catch(e => console.error(e));

const kue = require('kue');
const queue = kue.createQueue();
queue.process("UserApply", 1, async function(job, done){
  var room = await bot.Room.load("6683911535@chatroom");
  if(room){
    room.sync();
    var text = "有新人申请加入："+job.data.nick_name +"\n"+"申请加入的小组："+job.data.work_group+"\n"+"申请理由与自我介绍："+job.data.introduce;
    await room.say(text);
  }
  done();
});

queue.process("AddFriend", 1, async function(job, done){
  var wechat_id = job.data;
  console.log(wechat_id);
  var contact = bot.Contact.load(wechat_id);
  await bot.Friendship.add(contact, "test add friend");
  done();
});

