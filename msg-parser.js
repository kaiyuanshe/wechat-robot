const parseString = require('xml2js').parseString;
const Server_Address = process.env.SERVER_ADDRESS;
const Web_Files_Path = process.env.WEB_FILES_PATH;

exports.getJson = function (xml) {
    var json = null;
    parseString(xml, function (err, result) {
        json = result;
    });
    return json;
}

exports.saveMessageFiles = async function (bot, msg) {
    var msg_type = msg.payload.type;
    if (msg_type == bot.Message.Type.Image) {
        const file = await msg.toFileBox();
        const name = Web_Files_Path + file.name;
        console.log('Save file to: ' + name);
        file.toFile(name);
        return Server_Address + file.name;
    } else {
        return null;
    }
}

exports.getMsgText = async function (bot, msg) {
    msg_text = msg.text();
    if (msg.payload.type == bot.Message.Type.Image) {
        img_url = await this.saveMessageFiles(bot, msg).catch(error => console.log(error.message));
        msg_text = "![image](" + img_url + ")";
    }
    if (msg.payload.type == bot.Message.Type.Emoticon) {
        var json = this.getJson(msg.text());
        img_url = json.msg.emoji[0]["$"].cdnurl;
        msg_text = "![image](" + img_url + ")";
    }
    if (msg.payload.type == bot.Message.Type.Url) {
        var json = this.getJson(msg.text());
        var title = json.msg.appmsg[0].title[0];
        var url = json.msg.appmsg[0].url[0];
        msg_text = "[" + title + "](" + url + ")";
    }
    return msg_text;
}
