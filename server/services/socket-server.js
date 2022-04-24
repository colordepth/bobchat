const socketio = require("socket.io");

const { v4 } = require("uuid");
const { queryDB, commonQuery } = require('./db');

const io = new socketio.Server();

io.use((socket, next) => {
  // Assign a new/existing session and userID

  const { sessionID, userID } = socket.handshake.auth;

  const existingSession = sessions.find(session => session.sessionID === sessionID);

  if (existingSession) {
    socket.sessionID = existingSession.sessionID;
    socket.userID = existingSession.userID;
    return next();
  }

  // Create a new session

  const userSession = {
    sessionID: v4(),
    userID
  }

  sessions.push(userSession);

  socket.sessionID = userSession.sessionID;
  socket.userID = userSession.userID;
  next();
})

io.on("connection", (socket) => {
  console.log("user connected");

  const user = users.find(user => user.id === socket.userID);

  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID
  });

  socket.join(socket.userID);         // For private messages
  // TODO:  For group messages

  socket.on("disconnect", () => {
    console.log("user disconnected");
    user.onlineStatus = false;
    user.lastSeen = new Date();
    broadcastOnlineStatus(socket);
  });

  socket.on("chat message", data => {
    const message = {
      id: v4(),
      from: socket.userID,
      to: data.to,
      content: data.content,
      attachment: data.attachment,
      creationTime: new Date()
    };
    messages.push(message);
    io.to(socket.userID).to(data.to).emit("chat message", message);
  })
})

module.exports = io;
