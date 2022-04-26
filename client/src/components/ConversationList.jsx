import { useState } from "react";
import { useSelector } from "react-redux";

import { selectAllConversations } from "../slices/conversationSlice";
import ConversationItem from "./ConversationItem";
import Modal from "./Modal";

import "../stylesheets/ConversationList.css";


const FetchingState = () => {
  return (
    <div className="ConversationList unready-state">
      Fetching conversations ...
    </div>
  );
}

const EmptyConversationsList = () => {
  return (
    <div className="ConversationList unready-state">
      No conversations yet.
    </div>
  );
}

const MessageNewEntity = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <>
      <Modal isOpen={modalIsOpen}>
        <div>
          <input type="text" />
          <button onClick={() => setModalIsOpen(false)}>Connect</button>
        </div>
      </Modal>
      <button onClick={() => setModalIsOpen(true)}>Message New User</button>
    </>
  );
}

const ConversationList = () => {
  const conversations = useSelector(selectAllConversations);

  if (!conversations) return <FetchingState />;
  if (!conversations.length) return <EmptyConversationsList />;

  const ConversationItemsList = conversations.map(conversation => 
    <ConversationItem conversation={ conversation } key={ conversation.partnerID } />
  );

  return (
    <div className="ConversationList">
      { ConversationItemsList }
      <MessageNewEntity />
    </div>
  );
}

export default ConversationList;
