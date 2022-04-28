import { io } from "socket.io-client";
import store from '../app/store';
import { storeMessage } from "../slices/conversationSlice";

const socket = io({ autoConnect: false });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

socket.on('chat message', data => {
  store.dispatch(storeMessage(data));
})

function onDisconnect(e) {
  var confirmationMessage = "\o/";
  socket.close();

  (e || window.event).returnValue = confirmationMessage; //Gecko + IE
  return confirmationMessage;                            //Webkit, Safari, Chrome
}

window.addEventListener("beforeunload", onDisconnect);
window.addEventListener("unload", onDisconnect);

export default socket;
