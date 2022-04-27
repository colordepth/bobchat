import socket from "./socket";

export function sendMessage(conversation, content, attachment) {
  socket.emit("chat message", {
    to: conversation.id,
    toPerson: conversation.phone,
    isGroup: !conversation.phone,
    content,
    attachment
  })
}

export function getMessagesFromChat(chat) {
  let chatType  = chat.phone ? 'conversation' : 'group';

  return fetch(`/chat/${chatType}/${chat.id}`, {
    headers: { Authorization: `bearer ${localStorage.getItem('token')}` }
  })
    .then(res => res.json())
}
