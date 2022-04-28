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

export function postRegister(userID, name, about) {
  return fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID, name, about })
    })
    .then(async response => {
      if (response.status != 200) throw await response.json();
      return response;
    })
    .then(response => response.json());
}
