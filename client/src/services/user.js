export function getUserInfo(userID) {
  return fetch('/user/' + userID);
}

export function getUserChats() {
  return fetch('/chat', {
      headers: { Authorization: `bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json());
}

export function setPersonalInfo({ about, lastSeenVisibility, onlineStatusVisibility }) {
  return fetch('/user', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ about, lastSeenVisibility, onlineStatusVisibility })
    })
    .then(res => res.json());
}