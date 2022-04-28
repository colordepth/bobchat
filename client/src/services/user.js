export function getUserInfo(userID) {
  return fetch('/user/' + userID);
}

export function getSelfInfo() {
  return fetch('/user', {
    headers: { Authorization: `bearer ${sessionStorage.getItem('token')}` }
  })
  .then(res => res.json());
}

export function getReadReceipts() {
  return fetch('/chat/receipts', {
    headers: { Authorization: `bearer ${sessionStorage.getItem('token')}` }
  })
  .then(res => res.json())
  .then(res => res.receipts);
}

export function getUserChats() {
  return fetch('/chat', {
      headers: { Authorization: `bearer ${sessionStorage.getItem('token')}` }
    })
    .then(res => res.json());
}

export function setPersonalInfo({ about, lastSeenVisibility, onlineStatusVisibility }) {
  return fetch('/user', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ about, lastSeenVisibility, onlineStatusVisibility })
    })
    .then(res => res.json());
}

export function postContact(contactNumber) {
  return fetch('/user/contact', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({contact: contactNumber})
    })
    .then(res => res.json());
}

export function postGroup(name, description, members) {
  return fetch('/user/group', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name, description, members})
    })
    .then(res => res.json());
}

export function putUserSettings(name, about, read_receipt_setting, about_visibility_setting, last_seen_on_setting) {
  return fetch('/user', {
      method: 'PUT',
      headers: {
        'Authorization': `bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name, about, read_receipt_setting, about_visibility_setting, last_seen_on_setting})
    })
    .then(res => res.json());
}

export function postConversation(contactNumber) {
  return fetch('/user/conversation', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({contact: contactNumber})
    })
    .then(res => res.json());
}
