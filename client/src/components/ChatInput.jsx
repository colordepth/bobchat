import { useState } from "react";
import { sendMessage } from "../services/chat.js";
import "../stylesheets/ChatInput.css";

const ChatInput = ({ conversation }) => {
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState(null);

  function selectFile() {
    const input = document.createElement('input');
    input.type = 'file';

    input.onchange = fileChooseEvent => { 
      const file = fileChooseEvent.target.files[0];
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = readerEvent => {
        console.log(readerEvent.target.result);
        setAttachment({
          name: file.name,
          size: file.size,
          type: file.type,
          content: readerEvent.target.result
        })
      }
    }
    input.click();
  }

  function submitChatInput(event) {
    event.preventDefault();
    if (inputText.length)
      sendMessage(conversation, inputText, attachment);
    setInputText("");
  }

  return (
    <form className="ChatInputContainer" onSubmit={(event) => submitChatInput(event)}>
      <button type="button" onClick={selectFile}>Attachment</button>
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
