const socketio = require("socket.io");
const { queryExec, commonQuery, impureQueries } = require('./db');
const { getUserIDfromToken } = require('./auth');

const io = new socketio.Server();

io.use(async (socket, next) => {
  socket.userID = await getUserIDfromToken(socket.handshake.auth.token);

  if (!socket.userID) {
    socket.close();
  }

  next();
})

io.on("connection", async socket => {
  console.log("user connected");

  const conversationIDs = await commonQuery.getUserConversationsIDs(socket.userID);
  const groupIDs = await commonQuery.getUserGroupsIDs(socket.userID);

  conversationIDs.forEach(id => socket.join('conversation ' + id));
  groupIDs.forEach(id => socket.join('group ' + id));

  console.log(socket.rooms);

  socket.once("disconnect", () => {
    console.log("user disconnected");
    // user.onlineStatus = false;
    // broadcastOnlineStatus(socket);
  });

  socket.on("chat message", data => {
    const message = {
      text: data.content,
      attachment: data.attachment,
      creation_time: new Date()
    };

    const messageBelongsToGroup = data.isGroup;
    const targetRoom = (messageBelongsToGroup ? 'group ' : 'conversation ') + data.to;

    console.log("message received", data, targetRoom);
    
    if (messageBelongsToGroup)
      impureQueries.addMessageToGroup(message, data.to, socket.userID);
    else 
      impureQueries.addMessageToConversation(message, data.to, socket.userID);
    
    const socketPayload = {
      ...message,
      creator_id: socket.userID,
      seen_time: null,
      delivered_time: null,
    };

    if (messageBelongsToGroup)
      socketPayload.group_id = data.to;
    else
      socketPayload.conversation_id = data.to;

    io.to(targetRoom).emit("chat message", socketPayload);
  })
})

module.exports = io;
