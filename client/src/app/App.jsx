import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

import ConversationView from "../components/ConversationView";
import ConversationList from "../components/ConversationList";
import { getUserChats } from "../services/user";
import { getMessagesFromChat } from "../services/chat";
import socket from "../services/socket";
import { upgradeConnectionToSocket } from "../services/auth";
import { setConversations, addMessageToConversations, setActiveConversationID } from "../slices/conversationSlice";

import "../stylesheets/App.css";


const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  function fetchChats() {
    async function fetch() {
      dispatch(setConversations([]));
      dispatch(setActiveConversationID(null));

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

    if (!localStorage.getItem('token')) return;
    console.log("Fetching chats");
    fetch();
  }

  function receiveMessage() {
    if (!localStorage.getItem('token')) return;

    console.log("Connecting to socket");
    upgradeConnectionToSocket(localStorage.getItem('token'));
    // socket.on("chat message", message => dispatch(addMessageToConversations(message)));
    return () => socket.off("chat message");
  }

  useEffect(receiveMessage, [ location ]);
  useEffect(fetchChats, [ location ]);

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
