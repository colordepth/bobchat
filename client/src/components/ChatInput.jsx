import { useState } from "react";
import { sendMessage } from "../services/chat.js";
import "../stylesheets/ChatInput.css";

const ChatInput = ({ conversation }) => {
  const [inputText, setInputText] = useState("");

  function submitChatInput(event) {
    event.preventDefault();
    sendMessage(conversation, inputText, null);
    setInputText("");
  }

  return (
    <form className="ChatInputContainer" onSubmit={(event) => submitChatInput(event)}>
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

export default ChatInput;
