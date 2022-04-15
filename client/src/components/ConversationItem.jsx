import { useDispatch } from "react-redux";
import "../stylesheets/ConversationItem.css";
import { setActiveConversationID } from "../slices/conversationSlice";

const ConversationItem = ({ conversation }) => {
  const dispatch = useDispatch();

  return (
    <div
      onClick={() => { dispatch(setActiveConversationID(conversation.partner.id)) }}
      className="ConversationItem"
    >
      <span className="ConversationItemTitle">
        { conversation.partner.name }
      </span>
      <span className="ConversationItemContent">
        { conversation.messages.at(-1).content }
      </span>
    </div>
  );
}

export default ConversationItem;
