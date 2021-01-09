# wechat-robot

这是一个开源社的微信机器人项目，基于[wechaty](http://github.com/chatie/wechaty)开源项目开发。

# 环境变量

* WECHATY_PUPPET_PADCHAT_TOKEN: Wechaty iPad协议所需的token
* SERVER_ADDRESS: Web Server对外提供的HTTP地址
* GITTER_TOKEN: 为同步消息到Gitter，所需账号的access token
* WEB_FILES_PATH: 微信文件，将要存在服务器上的路径，通常为/var/www/html

# 加入项目的讨论组

[![Join the chat at https://gitter.im/kaiyuanshe/wechat-robot](https://badges.gitter.im/kaiyuanshe/wechat-robot.svg)](https://gitter.im/kaiyuanshe/wechat-robot?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# 欢迎加这个机器人为好友

![](logo.png)

# 工作流程

1. 【Web-Members】访问 http://members.kaiyuanshe.cn/ 
    1. 添加机器人为好友
    2. 填写加入开源社申请（正式成员 add_member 、志愿者 add_volunteer）
2. 【Web-Members】将申请存入MySQL数据库，并通过redis，通知Wechat-Robot
3. 【Wechat-Robot】通过redis收到通知，并在微信群中通知管理员
    根据申请人申请加入的工作组，将申请转发到相应的工作组微信群
    如果申请人填写了推荐人，将申请转发到成员发展工作组微信群
4. 【Wechat-Robot】根据组长命令，确定如何拉人进群    
    "组长可以@机器人，并发布命令：“接纳@nick_name” 或 “同意@nick_name” ，机器人将会把他拉入工作组群。";
    "如果组长@机器人，并发布命令：“正式@nick_name”，机器人将会同时把他拉入工作组群与开源社正式成员群。";
5. 【Wechat-Robot】收到命令后，更新MySQL数据库，申请人的状态，从待审核，改为已加入