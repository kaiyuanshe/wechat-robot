const { Wechaty } = require('wechaty');
const { PuppetPadchat } = require('wechaty-puppet-padchat');
const QRCode = require('qrcode-terminal');
const Parser = require('./msg-parser');
const GitterUtils = require('./gitter-utils');

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
        }
    }
}

bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('logout', onLogout);
bot.on('message', onMessage);

bot.start()
    .then(() => console.log('Starter Bot Started.'))
    .catch(e => console.error(e));