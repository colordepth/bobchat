import { useDispatch } from "react-redux";
import { setActiveConversationID } from "../slices/conversationSlice";

import "../stylesheets/ConversationItem.css";

const ConversationItem = ({ conversation }) => {
  const dispatch = useDispatch();

  const chatID = conversation.partnerID;

  return (
    <li
      className="ConversationItem"  
      onClick={() => { dispatch(setActiveConversationID(chatID)) }}
    >
      <span className="ConversationItemTitle">
        { conversation.name }
      </span>
      <span className="ConversationItemContent">
        { conversation.messages ? conversation.messages.at(-1).text : '...' }
      </span>
    </li>
  );
}

export default ConversationItem;
