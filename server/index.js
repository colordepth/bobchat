const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const { v4 } = require("uuid");

const app = express();
const httpServer = http.createServer(app);
const io = new socketio.Server(httpServer);

const sampleMessage1 = {
  id: v4(),
  from: "8126416373",
  to: "9412088616",
  content: "hello",
  attachment: null,
  creationTime: new Date()
};

const sampleMessage2 = {
  id: v4(),
  from: "8126416373",
  to: "2489cc65-f46e-4d1d-915c-6a741f31d183",
  content: "hello group",
  attachment: null,
  creationTime: new Date()
};

const messageReport = [
  {
    messageID: sampleMessage1.id,
    receiver: sampleMessage1.to,
    deliveredTime: new Date(),
    seenTime: null
  }
];

const sampleSession = {
  sessionID: "d7cc881a-8436-4459-bd97-60b2e07249a8",
  userID: "8126416373"
};

const sampleUser1 = {
  id: "8126416373",
  name: "Deep",
  about: "head empty",
  lastSeenEnabled: true,
  aboutVisibility: true,
  readReceipts: true,
  onlineStatus: false,
  lastSeen: new Date()
}

const sampleUser2 = {
  id: "9412088616",
  name: "Mom",
  about: "hello",
  lastSeenEnabled: true,
  aboutVisibility: true,
  readReceipts: true,
  onlineStatus: false,
  lastSeen: new Date()
}

const sampleGroup = {
  id: "2489cc65-f46e-4d1d-915c-6a741f31d183",
  members: [ sampleUser1.userID, sampleUser2.userID ],
  name: "Home2",
  description: "a home2"
}

const sampleConversation = {
  partner: sampleGroup || sampleUser1,
  message: [ sampleMessage1 ]
}

const messages = [ sampleMessage1, sampleMessage2 ];
const sessions = [ sampleSession ];
const users = [ sampleUser1, sampleUser2 ];
const groups = [ sampleGroup ];

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

function joinGroupRooms(socket) {

}

function broadcastOnlineStatus(socket) {
  const user = users.find(user => user.id === socket.userID);
  const sockets = io.in(user.id).allSockets();

  if (sockets.length === 1) {
    socket.broadcast.emit("user connected", user.id);
  }
  else if (sockets.length === 0) {
    socket.broadcast.emit("user disconnected", {
      userID: user.id,
      lastSeen: new Date()
    });
  }
}

function getUserInfo(userID) {
  const user = users.find(user => user.id === userID);

  if (!user) return null;

  const userInfo = {
    name: user.name,
    id: user.id,
    about: user.aboutVisibility ? user.about : null,
    onlineStatus: user.onlineStatus,
    lastSeen: user.lastSeenEnabled ? user.lastSeen : null 
  };

  return userInfo;
}

function getGroupInfo(groupID) {

  return groups.find(group => group.id === groupID);
}

function supplyConversationsList(socket) {
  const user = users.find(user => user.id === socket.userID);
  const conversations = new Map();

  const userMessages = messages.filter(message =>
    message.to === user.id || message.from === user.id
  );

  userMessages.forEach(message => {
    const partnerID = message.to === user.id ? message.from : message.to;
    const existingConversation = conversations.get(message.partnerID);

    console.log(message);

    const reports = messageReport.filter(report =>
        report.messageID === message.id
      )
      .map(report => {
        return {
          receiver: report.receiver,
          deliveredTime: report.deliveredTime,
          seenTime: report.seenTime
        }
      });

    if (!existingConversation) {
      const newConversation = {};
      const partnerIsGroup = groups.find(group => group.id === partnerID);

      if (partnerIsGroup) {
        newConversation.partner = getGroupInfo(partnerID);
      }
      else {
        newConversation.partner = getUserInfo(partnerID);
      }

      newConversation.messages = [ {...message, reports} ];
      conversations.set(partnerID, newConversation);
    }
    else existingConversation.messages.push({...message, reports});
  });

  socket.emit("conversation list", [...conversations.values()]);
  console.log([...conversations.values()]);
}

io.on("connection", (socket) => {
  console.log("user connected");

  const user = users.find(user => user.id === socket.userID);
  user.onlineStatus = true;

  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID
  });

  socket.join(socket.userID);         // For private messages
  joinGroupRooms(socket);             // For group messages
  broadcastOnlineStatus(socket);
  supplyConversationsList(socket);    // Connection will receive conversations list

  socket.on("disconnect", () => {
    console.log("user disconnected");
    user.onlineStatus = false;
    user.lastSeen = new Date();
    broadcastOnlineStatus(socket);
  });

  socket.on("chat message", data => {
    console.log(data);
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

app.use(express.static(path.join(__dirname, "build")));

const PORT = 3001;

httpServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
});
