import { io } from "socket.io-client";
import store from '../app/store';
import { addMessageToConversations } from "../slices/conversationSlice";

const socket = io({ autoConnect: false });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

socket.on('chat message', data => {
  console.log("WTF5", data);
  store.dispatch(addMessageToConversations({message: data, chatID: data.isGroup ? data.to : data.toPerson}));
}) 

export default socket;
