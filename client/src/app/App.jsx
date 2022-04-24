import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";

import ConversationView from "../components/ConversationView";
import ConversationList from "../components/ConversationList";
import socket from "../services/socket";
import { setConversations, addMessageToConversations } from "../slices/conversationSlice";

import "../stylesheets/App.css";


const App = () => {
  const [ sessionID, setSessionID ] = useState(null);
  const dispatch = useDispatch();

  function receiveConversationList() {
    socket.on("conversation list", data => dispatch(setConversations(data)));
    return () => socket.off("conversation list");
  }

  function receiveMessage() {
    socket.on("chat message", message => dispatch(addMessageToConversations(message)));
    return () => socket.off("chat message");
  }

  useEffect(receiveMessage, []);
  useEffect(receiveConversationList, []);

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
