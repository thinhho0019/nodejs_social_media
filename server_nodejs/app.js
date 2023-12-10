//env
const dotenv = require('dotenv').config();
const conversasionService = require('./services/conversasionService');
const userService = require('./services/userService');
const fcm = require('./utils/fcm');
 
//cors
const cors = require('cors');
//bodyParser
var bodyParser = require('body-parser');
const morgan = require('morgan');
//express --- setup 
const app = require('express')();
//app.use(bodyParser.json({ limit: "50mb" }));
//firebase init 
 
 
app.use(cors());
app.use(morgan("common"));
const http = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(http, {
  
  cors: {
    origin: "http://localhost:3000/",
    methods: ["GET", "POST"]
  },
});
http.listen(3000, () => {
  console.log('listening on 3000');
});
//route
const userRoute = require("./routes/userRoute");
const conversasionRoute = require("./routes/conversasionRoute");
const postRoute = require("./routes/postRoute");
const notificationRoute = require("./routes/notificationRoute");
const postService = require('./services/postService');
app.use('/user', userRoute);
app.use('/chat', conversasionRoute);
app.use('/post',postRoute);
app.use('/notification',notificationRoute );
//uitll show images
app.use('/showimage',(req,res)=>{
  const img = req.query.image;
  res.status(200).sendFile(img, { root: __dirname });
});
//socket io
const users = {};
io.on("connection", (socket) => {
  socket.emit("message-notify", "ket noi thanh cong");
  console.log("da co user connect " + socket.id);

  socket.on('join', async (data) => {
    console.log('socket id: ' + socket.id + " da join phong: " + data);
    if (!users.hasOwnProperty(data)) {
      await userService.updateUserOnline(data);
      users[data] = socket.id;
    } else {
      await userService.updateUserOnline(data);
      console.log('socket id: ' + socket.id + " da join phong tu truoc");
    }

    const numRooms = io.sockets.adapter.rooms.size;
    console.log(`Số lượng các phòng đang tồn tại là: ${numRooms}`);

  });
  socket.on("send_update_like_realtime",async (data)=>{
    const count =  await postService.countLikePost(data.idpost);
    data["count"] = count;
    console.log(data);
    socket.broadcast.emit('receive_update_like_realtime', JSON.stringify(data));
  });
  socket.on('verify_message_seen',async (data)=>{
    console.log(data);
    const id = await conversasionService.verifyMessage(data.conversationid,"seen",data.sender);
    console.log(id);
    io.to(users[data.sender]).emit('receive_verify_message_seen', data);
  });
  socket.on('verify_message_received',async (data)=>{
    const jsonData = JSON.parse(JSON.stringify(data)) ;
     
    const id = await conversasionService.verifyMessage(jsonData.conversasion,"received",data.sender);
     
    io.to(users[jsonData.from]).emit('receive_verify_message_received', data);
  });
  socket.on('request_user_online',async (data)=>{
    const result = await userService.findStateOnline(data.ques);
    io.to(users[data.ask]).emit('receive_user_online', JSON.stringify(result[0]));
  });
  socket.on('send_typing', (data) => {
    console.log('Đã nhận được tin nhắn typing từ ' + data.from
      + ' đến ' + data.to + ' : '
      + data.message + "với conversasion:" + data.conversasion);

    io.to(users[data.to]).emit('receiver_typing', JSON.stringify(data));
  });
  socket.on('updateNotifiUser',async (data)=>{
    await userService.updateTokenNotification(data.token,data.iduser);
    console.log(data);
  })
  socket.on('send_message', async (data) => {
    console.log(data);
    console.log('Đã nhận được tin nhắn từ ' + data.from
      + ' đến ' + data.to + ' : '
      + data.message);
    data.created_at = new Date();
    await conversasionService.addConversasion(data.to, data.from, data.message);
    io.to(users[data.to]).emit('receive_message', JSON.stringify(data));
    io.to(users[data.to]).emit('receive_conversation', JSON.stringify(data));
  });
  socket.on('disconnect', async () => {
    console.log('Đã ngắt kết nối: ' + socket.id);
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        await userService.updateUserOfline(userId);
        break;
      }
    }
    console.log(users);
  });


});






