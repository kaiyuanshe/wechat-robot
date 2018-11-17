const { Wechaty } = require('wechaty');
const { PuppetPadchat } = require('wechaty-puppet-padchat');
const { QRCode } = require('qrcode-terminal');

const Server_Address = process.env.SERVER_ADDRESS;
const Gitter_Token = process.env.GITTER_TOKEN;
const Web_Files_Path = process.env.WEB_FILES_PATH;

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

    console.log(qrcodeImageUrl);
}

function onLogin(user) {
    console.log(`${user} login`);
}

function onLogout(user) {
    console.log(`${user} logout`);
}

async function save_file(msg) {
    var msg_type = msg.payload.type;
    if (msg_type == Puppet.MessageType.Image) {
        const file = await msg.toFileBox();
        const name = Web_Files_Path + file.name;
        console.log('Save file to: ' + name);
        file.toFile(name);
        return Server_Address + file.name;
    } else {
        return null;
    }
}

function send_msg_to_gitter(msg, room_id, text) {
    var request = require('request');
    if (text == null) {
        text = msg.text();
    }
    request.post(
        {
            url: 'https://api.gitter.im/v1/rooms/' + room_id + '/chatMessages',
            headers: {
                "Accept": "application/json",
                "Authorization": Gitter_Token
            },
            form: {
                text: msg.from().name() + ":" + text
            }
        },
        function (error, response, body) {
            console.log(body);
        }
    );
}

function getJson(xml) {
    var parseString = require('xml2js').parseString;
    var json = null;
    parseString(xml, function (err, result) {
        json = result;
    });
    return json;
}

async function onMessage(msg) {
    if (msg.age() > 60) {
        return;
    }
    console.log(msg.toString());
    if (msg.payload) {
        if (msg.room() != null && msg.payload.type != 0) {
            var msg_text = null;
            if (msg.payload.type == bot.Message.Type.Image) {
                img_url = await save_file(msg).catch(error => console.log(error.message));
                msg_text = "![image](" + img_url + ")";
            }
            if (msg.payload.type == bot.Message.Type.Emoticon) {
                var json = getJson(msg.text());
                img_url = json.msg.emoji[0]["$"].cdnurl;
                msg_text = "![image](" + img_url + ")";
            }
            if (msg.payload.type == bot.Message.Type.Url) {
                var json = getJson(msg.text());
                var title = json.msg.appmsg[0].title[0];
                var url = json.msg.appmsg[0].url[0];
                msg_text = "[" + title + "](" + url + ")";
            }
            if (msg.room().payload.topic == "开源社2018理事会") {
                send_msg_to_gitter(msg, "5be0f401d73408ce4fadf912", msg_text);
            }
            if (msg.room().payload.topic == "开源社.KCoin开发组") {
                send_msg_to_gitter(msg, "5bd336ccd73408ce4face117", msg_text);
            }
            if (msg.room().payload.topic == "开源社.开放黑客松项目组") {
                send_msg_to_gitter(msg, "5be27cdfd73408ce4fae1a77", msg_text);
            }
            if (msg.room().payload.topic == "开源社.官网开发组") {
                send_msg_to_gitter(msg, "5bdc4807d73408ce4fada5a1", msg_text);
            }
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