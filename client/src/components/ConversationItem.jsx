import { useDispatch, useSelector } from "react-redux";
import { selectMessages, selectOnlineUsers, setActiveConversationID } from "../slices/conversationSlice";

import "../stylesheets/ConversationItem.css";

const ConversationItem = ({ conversation }) => {
  const dispatch = useDispatch();

  const chatID = conversation.partnerID;
  const allMessages = useSelector(selectMessages);
  const currentMessages = allMessages && allMessages.filter(message => {
    if (conversation.isGroup) {
      return message.group_id === conversation.id;
    }
    return message.conversation_id === conversation.id;
  });

  const onlineUsers = useSelector(selectOnlineUsers);
  const onlineState = !conversation.isGroup && onlineUsers.find(onlineUser => onlineUser == conversation.partnerID);

  return (
    <li
      className="ConversationItem"  
      onClick={() => { dispatch(setActiveConversationID(chatID)) }}
    >
      <span className="ConversationItemTitle">
        { conversation.name + '  ' + (conversation.isGroup ? '' : (onlineState ? '🟢' : '🔴'))}
      </span>
      <span className="ConversationItemContent">
        { currentMessages && currentMessages.length ? currentMessages.at(-1).text : <i></i> }
      </span>
    </li>
  );
}

export default ConversationItem;
