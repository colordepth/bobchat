import socket from "./socket";

export function sendMessage(partnerID, content, attachment) {
  socket.emit("chat message", {
    to: partnerID,
    content,
    attachment
  })
}
