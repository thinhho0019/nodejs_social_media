const io = require('socket.io')();
 
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
  socket.on('on_listen_notification',async (data)=>{
    const jsonData = JSON.parse(JSON.stringify(data));
    io.to(users[jsonData.userid]).emit('receive_on_listen_notification', data);
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
module.exports = io;