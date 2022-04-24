import socket from "../services/socket";

export function upgradeConnectionToSocket(token) {  
  if (!token) {
    return;
  }

  socket.auth = { token };
  socket.connect();
}

export function postLogin(userID) {
  return fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID })
    })
    .then(response => response.json());
}
