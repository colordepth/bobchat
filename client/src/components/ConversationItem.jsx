import { useDispatch } from "react-redux";
import { setActiveConversationID } from "../slices/conversationSlice";

import "../stylesheets/ConversationItem.css";

const ConversationItem = ({ conversation }) => {
  const dispatch = useDispatch();

  return (
    <li
      className="ConversationItem"  
      onClick={() => { dispatch(setActiveConversationID(conversation.partner.id)) }}
    >
      <span className="ConversationItemTitle">
        { conversation.partner.name }
      </span>
      <span className="ConversationItemContent">
        { conversation.messages.at(-1).content }
      </span>
    </li>
  );
}

export default ConversationItem;
