import { useSelector } from "react-redux";
import { selectActiveConversationID, selectAllContacts, selectConversationByPartnerID } from "../slices/conversationSlice";
import ChatInput from "./ChatInput";
import "../stylesheets/ConversationView.css";
import { useEffect, useRef } from "react";

const ConversationHeader = ({ conversation }) => {
  return (
    <div className="ConversationHeader">
      { conversation.name }
    </div>
  );
}

const MessageCloud = ({ message }) => {
  const date = new Date(message.creation_time);
  const contacts = useSelector(selectAllContacts);
  const contact = contacts && contacts.find(contact => contact.phone == message.sender);

  console.log("wtf", contact)

  return (
    <div className="MessageCloud">
      <div>
        {contact ? contact.name : message.sender}Deepam Sarmah
      </div>
      <div>
        {message.content || message.text}
      </div>
      <div>
        { date.toDateString() + ' | ' + date.toLocaleTimeString() }
      </div>
    </div>
  );
}

const ConversationContent = ({ conversation }) => {
  const conversationContentRef = useRef();

  useEffect(() => {
    conversationContentRef
    && conversationContentRef.current
    && conversationContentRef.current.scrollTo(0, 9999999999);
  })

  return (
    <div className="ConversationContent" ref={conversationContentRef}>
      { conversation.messages && conversation.messages.map(message => {
          return <MessageCloud message={message} key={JSON.stringify(message)}/>;
        })
      }
    </div>
  );
}

const ConversationView = () => {
  const activeConversationID = useSelector(selectActiveConversationID);
  const activeConversation = useSelector(selectConversationByPartnerID(activeConversationID));

  console.log(activeConversation, activeConversationID);
  
  if (!activeConversation) {
    return (
      <div className="ConversationView unready-state">
        Click on a conversation to view...
      </div>
    );
  }

  return (
    <div className="ConversationView">
      <ConversationHeader conversation={ activeConversation } />
      <ConversationContent conversation={ activeConversation } />
      <ChatInput conversation={ activeConversation } />
    </div>
  );
}

export default ConversationView;
