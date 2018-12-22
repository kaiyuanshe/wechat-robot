const mysql = require('mysql');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'kaiyuanshe'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to Kaiyuanshe DB");
});

global.db = db;

exports.get_user = function (nick_name, func) {
  if (nick_name.slice(0, 1) == "@") {
    nick_name = nick_name.slice(1);
  }
  let query = "select * from users where `nick_name`='" + nick_name + "'";
  console.log(query);
  db.query(query, (err, result) => {
    if (!err) {
      func(result[0]);
    } else {
      func(null);
    }
  });
}

exports.update_user_status = function (wechat_id, user_status, func) {
  let query = "update `users` set `status`='" + user_status + "' where `wechat_id`='" + wechat_id + "'";
  db.query(query, (err, result) => {
    if (func) { func(); }
  });
}

exports.update_user_position = function (wechat_id, position, func) {
  let query = "update `users` set `position`='" + position + "' where `wechat_id`='" + wechat_id + "'";
  db.query(query, (err, result) => {
    if (func) { func(); }
  });
}


exports.save_wechat_friend = async function (user) {
  var wechat_id = user.id;
  var nick_name = await user.name();
  console.log(wechat_id + "," + nick_name);
  db.query("SET NAMES utf8mb4", (err, result) => {
    db.query("insert into `wechat_friends` (wechat_id,nick_name) values ('" + wechat_id + "','" + nick_name + "')", (err1, result1) => {
      if (err1) {
        console.log(err1);
      }
    });
  });
}

const MessageType = ["Unknown", "Attachment", "Audio", "Contact", "Emoticon", "Image", "Text", "Video", "Url"];

exports.save_msg = async function (msg) {
  var fields = "`type`,";
  var values = "'" + MessageType[msg.type()] + "',";
  var room = await msg.room();
  if (room) {
    var room_id = room.id;
    var room_topic = await room.topic();
    fields = fields + "`room_id`,`room_topic`,";
    values = values + "'" + room_id + "','" + room_topic + "',";
  }
  var from = await msg.from();
  if (from) {
    var from_user_id = from.id;
    var from_user_name = await from.name();
    fields = fields + "`from_user_id`,`from_user_name`,";
    values = values + "'" + from_user_id + "','" + from_user_name + "',";
  }
  var mention_list = await msg.mention();
  if (mention_list) {
    var mention_id_list = "";
    var mention_name_list = "";
    mention_list.forEach(function (item, index) {
      mention_id_list = mention_id_list + item.id + ",";
      mention_name_list = mention_name_list + await item.name() + ",";
    });
    fields = fields + "`mention_id_list`,`mention_nane_list`,";
    values = values + "'" + mention_id_list + "','" + mention_name_list + "',";
  }
  text = await msg.text();
  fields = fields + "`text`,`create_at`";
  values = values + "'" + text + "',CURRENT_TIMESTAMP";
  sql = "INSERT INTO `messages` (" + fields + ") VALUES (" + values + ")";
  db.query("SET NAMES utf8mb4", (err, result) => {
    db.query(sql);
  });
}