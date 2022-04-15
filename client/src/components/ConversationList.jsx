import { useState, useEffect } from "react";
import ConversationItem from "./ConversationItem";
import socket from "../services/socket";
import "../stylesheets/ConversationList.css";

const ConversationList = ({ conversations, setConversations, setActiveConversationPartnerID }) => {

  useEffect(() => {
    socket.on("conversation list", data => setConversations(data));

    socket.on("chat message", message => {
      const newConversations = conversations.map(conversation => {
        const partnerID = conversation.partner.id;
        if ( partnerID === message.from || partnerID === message.to ) {
          const messages = conversation.messages.concat(message);
          return {...conversation, messages};
        }
        return conversation;
      })
      setConversations(newConversations);
    })

    return () => {
      socket.off("conversation list");
      socket.off("chat message");
    }
  })

  if (!conversations) {
    return (
      <div className="ConversationList unready-state">
        Fetching conversations ...
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="ConversationList unready-state">
        No conversations yet.
      </div>
    );
  }

  return (
    <div className="ConversationList">
        {
          conversations.map(conversation => 
            <li
              className="ConversationItem"
              key={ conversation.partner.id }
            >
              <ConversationItem
                conversation={ conversation }
                setActiveConversationPartnerID={ setActiveConversationPartnerID }
              />
            </li>
          )
        }
    </div>
  );
}

export default ConversationList;
