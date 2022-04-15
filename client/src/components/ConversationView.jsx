import "../stylesheets/ConversationView.css";
import socket from "../services/socket";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectActiveConversationID, selectConversationByPartnerID } from "../slices/conversationSlice";

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

const ChatInput = ({ conversation }) => {
  const [inputText, setInputText] = useState('');

  function sendMessage(event) {
    event.preventDefault();

    socket.emit("chat message", {
      to: conversation.partner.id,
      content: inputText,
      attachment: null
    })
    setInputText('');
  }

  return (
    <form className="ChatInputContainer" onSubmit={(event) => sendMessage(event)}>
      <button>Attachment Icon</button>
      <input
        type="text"
        value={inputText}
        placeholder="Type your message here..."
        onChange={event => setInputText(event.target.value)}
      />
      <input type="submit" value="Send"/>
    </form>
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
