import { useEffect, useState } from "react";

import ConversationView from "../components/ConversationView";
import Login from "../components/Login";
import ConversationList from "../components/ConversationList";

import socket from "../services/socket";
import { setConversations, addMessageToConversations } from "../slices/conversationSlice";

import "../stylesheets/App.css";
import { useDispatch } from "react-redux";

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

  return (
    <div className="App">
      {!sessionID && <Login setSessionID={setSessionID}/>}
      <ConversationList />
      <ConversationView />
    </div>
  );
}

export default App;
