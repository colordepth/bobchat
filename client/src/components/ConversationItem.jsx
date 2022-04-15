import '../stylesheets/ConversationItem.css';

const ConversationItem = ({ conversation, setActiveConversationPartnerID }) => {
  return (
    <div
      onClick={() => setActiveConversationPartnerID(conversation.partner.id)}
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
