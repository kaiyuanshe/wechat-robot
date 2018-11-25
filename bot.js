const { Wechaty } = require('wechaty');
const { PuppetPadchat } = require('wechaty-puppet-padchat');
const QRCode = require('qrcode-terminal');
const Parser = require('./msg-parser');
const GitterUtils = require('./gitter-utils');
const Dialog = require('./dialog');

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
            var msg_text = await Parser.getMsgText(bot, msg);
            GitterUtils.sendMsgToGitter(msg, msg_text);
        } else if (msg.payload.type != bot.Message.Type.Unknown && msg.from().name() != "开源社-bot") {
            var msg_text = await Parser.getMsgText(bot, msg);
            console.log(msg_text);
            if (msg_text.slice(0, 6) == '#join ') {
                msg_text = msg_text.slice(6);
                var room = await bot.Room.find({topic: '开源社迎新群'}); 
		if(room){
                  await room.add(msg.from());
                  await room.say("欢迎新朋友："+msg.from().name());
                  await room.say(msg.from().name()+"的自我介绍："+msg_text);
		} else {
		  console.log("没有找到房间");
		}
            } else {
                var reply = Dialog.getReply(msg_text);
                msg.say(reply);
            }
        }
    }
}

async function onFriendship(friendship) {
    console.log(friendship.toString());
    if (friendship.type() == bot.Friendship.Type.Receive) {
        await friendship.accept();
    } else if (friendship.type() == bot.Friendship.Type.Confirm) {
        friendship.contact().say(Dialog.greeting);
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
