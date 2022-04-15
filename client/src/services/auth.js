import socket from "../services/socket";

export function loginWithUserID(userID) {
  socket.auth = { userID };
  socket.connect();
}

export function loginWithSessionID(sessionID) {  
  if (!sessionID) {
    return;
  }

  socket.auth = { sessionID };
  socket.connect();
}

export function setSessionListenerCallback(callback) {
  socket.on("session", ({ sessionID, userID }) => {
    socket.auth = { sessionID };
    socket.userID = userID;
    localStorage.setItem("session-id", sessionID);
    callback(sessionID);
  });

  loginWithSessionID(localStorage.getItem("session-id"));

  return () => socket.off("session");
}
