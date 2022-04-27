import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectAllConversations } from "../slices/conversationSlice";
import { postContact } from "../services/user";
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
  const [contactNumber, setContactNumber] = useState('');
  const dispatch = useDispatch();

  function onClickContactPost() {
    setModalIsOpen(false);
    postContact(contactNumber)
      .then(res => {
        console.log("add contact", res);
      })
      .catch(err => {
        alert("User doesn't exist!");
      })
  }

  function addChat() {
    var choice = prompt("Choose type of chat (group/conversation)");

    if (choice.toLocaleLowerCase() === 'group') {
      const groupName = prompt("Enter group name");
    }
    else if (choice.toLocaleLowerCase() === 'conversation') {
      
    }
    else {
      alert("Invalid choice!");
    }
  }

  return (
    <>
      <Modal isOpen={modalIsOpen}>
        <div>
          <input type="text" value={contactNumber} onChange={event => setContactNumber(event.target.value)} />
          <button onClick={onClickContactPost}>Connect</button>
        </div>
      </Modal>
      <button onClick={() => setModalIsOpen(true)}>Add Contact</button>
      <button onClick={addChat}>Add Conversation/Group</button>
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
