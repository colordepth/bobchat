import ConversationList from "./components/ConversationList";
import socket from "./services/socket";
import { useEffect, useState } from "react";

import "./stylesheets/App.css";
import ConversationView from "./components/ConversationView";

const App = () => {
  const sessionID = localStorage.getItem("session-id");
  const [ activeConversationPartnerID, setActiveConversationPartnerID ] = useState(null);
  const [ conversations, setConversations ] = useState(null);

  const activeConversation = conversations && conversations.find(conversation =>
    conversation.partner.id === activeConversationPartnerID
  );

  useEffect(() => {
    if (sessionID) {
      socket.auth = { sessionID };
    }
    else {
      socket.auth = { userID: "9412088616" };
      // LOGIN or REGISTER
    }

    socket.connect();

    socket.on("session", ({ sessionID, userID }) => {
      socket.auth = { sessionID };
      localStorage.setItem("session-id", sessionID);
      socket.userID = userID;
    });

    return () => {
      socket.off("session");
    }
  }, []);

  return (
    <div className="App">
      <ConversationView conversation={activeConversation} />
      <ConversationList
        conversations={conversations}
        setConversations={setConversations}
        setActiveConversationPartnerID={setActiveConversationPartnerID}
      />
    </div>
  );
}

export default App;
