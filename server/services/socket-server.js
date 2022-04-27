const socketio = require("socket.io");
const { queryExec, commonQuery } = require('./db');

const io = new socketio.Server();

io.use((socket, next) => {
  // Assign a new/existing session and userID

  const { token } = socket.handshake.auth;

  // socket.userID = userSession.userID;
  next();
})

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
    // user.onlineStatus = false;
    // broadcastOnlineStatus(socket);
  });

  socket.on("chat message", data => {
    // const message = {
    //   id: v4(),
    //   from: socket.userID,
    //   to: data.to,
    //   content: data.content,
    //   attachment: data.attachment,
    //   creationTime: new Date()
    // };

    console.log("message received", data);

    // io.to(socket.userID).to(data.to).emit("chat message", message);
  })
})

module.exports = io;
