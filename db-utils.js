const mysql = require('mysql');
const db = mysql.createConnection ({
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
  if(nick_name.slice(0,1)=="@"){
    nick_name = nick_name.slice(1);
  }
  let query = "select * from users where `nick_name`='" + nick_name + "'";
  db.query(query, (err, result) => {
    if(!err){
      func(result[0]);
    } else {
      func(null);
    }
  });
}

exports.update_user_status = function (wechat_id, user_status, func) {
  let query = "update `users` set `status`='"+user_status+"' where `wechat_id`='"+wechat_id+"'";
  db.query(query, (err, result) => {
    if(func) { func(); }
  });
}


exports.save_wechat_friend = async function (user){
  var wechat_id = user.id;
  var nick_name = await user.name();
  console.log(wechat_id+","+nick_name);
  db.query("SET NAMES utf8mb4", (err, result) => {
    db.query("insert into `wechat_friends` (wechat_id,nick_name) values ('"+wechat_id+"','"+nick_name+"')", (err1, result1) => {
      if (err1){
        console.log(err1);
      }
    });
  });
}
