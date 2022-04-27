const socketio = require("socket.io");
const { queryExec, commonQuery } = require('./db');
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

    io.to(targetRoom).emit("chat message", {...data, ...message, sender: socket.userID});
  })
})

module.exports = io;
