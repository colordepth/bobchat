import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

import ConversationView from "../components/ConversationView";
import ConversationList from "../components/ConversationList";
import { getSelfInfo, getUserChats } from "../services/user";
import { getMessagesFromChat } from "../services/chat";
import { upgradeConnectionToSocket } from "../services/auth";
import { setConversations, storeMessage, setActiveConversationID, addContact, selectSelfInfo, selectMessages, clearChat, setSelfInfo } from "../slices/conversationSlice";

import "../stylesheets/App.css";


const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  function fetchChats() {
    async function fetch() {
      dispatch(clearChat());

      const data = await getUserChats();
      const chats = [...data.conversations, ...data.groups];
      dispatch(setConversations(chats));
      data.contacts.forEach(contact => dispatch(addContact(contact)));

      console.log(data);
      console.log("Fetching messages");
      const messages = await getMessagesFromChat();
      console.log(messages);
      messages.forEach(message => dispatch(storeMessage(message)));
      getSelfInfo().then(self => dispatch(setSelfInfo(self)));
    }

    if (!localStorage.getItem('token')) return;
    console.log("Fetching chats");
    fetch();
  }

  function receiveMessage() {
    if (!localStorage.getItem('token')) return;

    console.log("Connecting to socket");
    upgradeConnectionToSocket(localStorage.getItem('token'));
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
