import { useSelector } from "react-redux";
import { selectActiveConversationID, selectConversationByPartnerID } from "../slices/conversationSlice";
import ChatInput from "./ChatInput";
import "../stylesheets/ConversationView.css";

const ConversationHeader = ({ conversation }) => {
  return (
    <div className="ConversationHeader">
      { conversation.name }
    </div>
  );
}

const ConversationContent = ({ conversation }) => {
  return (
    <div className="ConversationContent">
      { conversation.messages && conversation.messages.map(message => <li key={message.partial_id}>{message.text}</li>) }
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
