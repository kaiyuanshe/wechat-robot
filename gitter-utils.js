const request = require('request');
const Gitter_Token = process.env.GITTER_TOKEN;

function getRoomID(topic) {
    switch (topic) {
        case "开源社2018理事会":
            return "5be0f401d73408ce4fadf912";
        case "开源社.KCoin开发组":
            return "5bd336ccd73408ce4face117";
        case "开源社.开放黑客松项目组":
            return "5be27cdfd73408ce4fae1a77";
        case "开源社.官网开发组":
            return "5bdc4807d73408ce4fada5a1";
        default:
            return null;
    }
}

exports.sendMsgToGitter = function (msg, text) {
    var room_topic = msg.room().payload.topic;
    var room_id = getRoomID(room_topic);
    if (text == null) {
        text = msg.text();
    }
    if (room_id != null) {
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
}