import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";

import ConversationView from "../components/ConversationView";
import ConversationList from "../components/ConversationList";
import { getUserChats } from "../services/user";
import { getMessagesFromChat } from "../services/chat";
import socket from "../services/socket";
import { upgradeConnectionToSocket } from "../services/auth";
import { setConversations, addMessageToConversations } from "../slices/conversationSlice";

import "../stylesheets/App.css";


const App = () => {
  const dispatch = useDispatch();

  function fetchChats() {
    async function fetch() {
      const data = await getUserChats();
      const chats = [...data.conversations, ...data.groups];
      dispatch(setConversations(chats));

      console.log(chats);
      console.log("Fetching messages");

      chats.forEach(async chat => {
        const messages = await getMessagesFromChat(chat);
        console.log(messages);
        messages.forEach(message => {
          dispatch(addMessageToConversations({
            message,
            chatID: chat.partnerID
          }))
        })
      })
    }
    console.log("Fetching chats");
    fetch();
  }

  function receiveMessage() {
    console.log("Connecting to socket");
    upgradeConnectionToSocket(localStorage.getItem('token'));
    // socket.on("chat message", message => dispatch(addMessageToConversations(message)));
    return () => socket.off("chat message");
  }

  useEffect(receiveMessage, []);
  useEffect(fetchChats, []);

  if (!localStorage.getItem('token')) {
    return <Navigate to='/login' />
  }

  return (
    <div className="App">
      <ConversationList />
      <ConversationView />
    </div>
  );
}

export default App;
