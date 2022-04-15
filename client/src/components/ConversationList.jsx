import { useState } from "react";
import ConversationItem from "./ConversationItem";
import Modal from "./Modal";
import "../stylesheets/ConversationList.css";

const ConversationList = ({ conversations, setActiveConversationPartnerID }) => {

  const [modalIsOpen, setModalIsOpen] = useState(false);

  if (!conversations) {
    return (
      <div className="ConversationList unready-state">
        Fetching conversations ...
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="ConversationList unready-state">
        No conversations yet.
      </div>
    );
  }

  return (
    <div className="ConversationList">
        {
          conversations.map(conversation => 
            <li
              className="ConversationItem"
              key={ conversation.partner.id }
            >
              <ConversationItem
                conversation={ conversation }
                setActiveConversationPartnerID={ setActiveConversationPartnerID }
              />
            </li>
          )
        }
        <Modal isOpen={modalIsOpen}>
          <div>
            <input type="text" value="partnerID" />
            <button onClick={() => setModalIsOpen(false)}>Connect</button>
          </div>
        </Modal>
        <button onClick={() => setModalIsOpen(true)}>Message New User</button>
    </div>
  );
}

export default ConversationList;
