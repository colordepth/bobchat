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

export default socket;
