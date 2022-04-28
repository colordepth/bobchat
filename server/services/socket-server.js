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
  // Broadcast user connection
  socket.broadcast.emit("user online", socket.userID);

  // Fetch online users
  io.fetchSockets()
    .then(sockets => {
      sockets.forEach(onlineSocket => {
        socket.emit("user online", onlineSocket.userID);
      })
    })

  const conversationIDs = await commonQuery.getUserConversationsIDs(socket.userID);
  const groupIDs = await commonQuery.getUserGroupsIDs(socket.userID);

  conversationIDs.forEach(id => socket.join('conversation ' + id));
  groupIDs.forEach(id => socket.join('group ' + id));
  socket.join('user ' + socket.userID);

  console.log(socket.rooms);

  socket.once("disconnect", async () => {
    const onlineUserConnections = (await io.in('user ' + socket.userID).fetchSockets()).length;
    if (onlineUserConnections == 0)
      socket.broadcast.emit("user offline", socket.userID);
    console.log("user disconnected, remaining user sockets:", onlineUserConnections);
  });

  socket.on("chat message", data => {
    const message = {
      text: data.content,
      attachment: data.attachment && Buffer.from(data.attachment.content),
      creation_time: new Date()
    };

    const messageBelongsToGroup = data.isGroup;
    const targetRoom = (messageBelongsToGroup ? 'group ' : 'conversation ') + data.to;

    console.log("message received", data, targetRoom);
    
    const socketPayload = {
      ...message,
      partial_id: commonQuery.lastIDs.lastPartialID + 1,
      creator_id: socket.userID,
      seen_time: null,
      delivered_time: null,
      attachment: !!message.attachment
    };

    if (messageBelongsToGroup)
      socketPayload.group_id = data.to;
    else
      socketPayload.conversation_id = data.to;

    io.to(targetRoom).emit("chat message", socketPayload);

    if (messageBelongsToGroup)
      impureQueries.addMessageToGroup(message, data.to, socket.userID);
    else
      impureQueries.addMessageToConversation(message, data.to, socket.userID);
  })
})

module.exports = io;
