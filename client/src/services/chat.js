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

export async function getMessagesFromChat() {
  const promises = [];

  promises.push(
    fetch(`/chat/group`, {
      headers: { Authorization: `bearer ${sessionStorage.getItem('token')}` }
    })
      .then(res => res.json())
  );

  promises.push(
    fetch(`/chat/conversation`, {
      headers: { Authorization: `bearer ${sessionStorage.getItem('token')}` }
    })
      .then(res => res.json())
  );

  const [groupMessages, conversationMessages] = await Promise.all(promises);

  return [...groupMessages, ...conversationMessages];
}
