import ConversationList from "./components/ConversationList";
import socket from "./services/socket";
import { useEffect, useState } from "react";

import "./stylesheets/App.css";
import ConversationView from "./components/ConversationView";
import Login from "./components/Login";

const App = () => {
  const [ sessionID, setSessionID ] = useState(null);
  const [ activeConversationPartnerID, setActiveConversationPartnerID ] = useState(null);
  const [ conversations, setConversations ] = useState(null);

  const activeConversation = conversations && conversations.find(conversation =>
    conversation.partner.id === activeConversationPartnerID
  );

  function receiveConversationList() {
    socket.on("conversation list", data => setConversations(data));
    return () => socket.off("conversation list");
  }

  function pushToConversation(message) {
    if (!conversations) return;

    const newConversations = conversations.map(conversation => {
      const partnerID = conversation.partner.id;
      if ( partnerID === message.from || partnerID === message.to ) {
        const messages = conversation.messages.concat(message);
        return {...conversation, messages};
      }
      return conversation;
    })
    setConversations(newConversations);
  }

  useEffect(() => {
    socket.on("chat message", message => pushToConversation(message));
    return () => socket.off("chat message");
  }, [pushToConversation]);

  useEffect(receiveConversationList, []);

  return (
    <div className="App">
      {!sessionID && <Login setSessionID={setSessionID}/>}
      <ConversationView conversation={activeConversation} />
      <ConversationList
        conversations={conversations}
        setActiveConversationPartnerID={setActiveConversationPartnerID}
      />
    </div>
  );
}

export default App;
