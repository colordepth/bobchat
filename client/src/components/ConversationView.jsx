import { useSelector } from "react-redux";
import { selectActiveConversationID, selectConversationByPartnerID } from "../slices/conversationSlice";
import ChatInput from "./ChatInput";
import "../stylesheets/ConversationView.css";

const ConversationHeader = ({ conversation }) => {
  return (
    <div className="ConversationHeader">
      {conversation.partner.name}
    </div>
  );
}

const ConversationContent = ({ conversation }) => {
  return (
    <div className="ConversationContent">
      {conversation.messages.map(message => <li key={message.id}>{message.content}</li>)}
    </div>
  );
}

const ConversationView = () => {
  const activeConversationID = useSelector(selectActiveConversationID);
  const activeConversation = useSelector(selectConversationByPartnerID(activeConversationID));

  console.log(activeConversation);
  
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
