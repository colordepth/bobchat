import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { addContact, selectAllContacts, selectAllConversations, setConversations } from "../slices/conversationSlice";
import { postContact, postConversation } from "../services/user";
import socket from "../services/socket";
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

const AddNewConversation = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const contacts = useSelector(selectAllContacts);
  const conversations = useSelector(selectAllConversations);
  const dispatch = useDispatch();

  function onClickAddConversation(contact) {
    setModalIsOpen(false);
    postConversation(contact)
      .then(result => {
        console.log("add conversation", result);
        dispatch(setConversations([...conversations, result]));
        socket.once("disconnect", () => {
          socket.connect();
        });
        socket.disconnect();
      })
  }

  return (
    <>
      <Modal isOpen={modalIsOpen}>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          {contacts && contacts.map(contact => <button key={contact.phone} onClick={() => onClickAddConversation(contact.phone)}>{contact.phone + ' | ' + contact.name}</button>)}
        </div>
      </Modal>
      <button disabled={!conversations} onClick={() => setModalIsOpen(true)}>Add Conversation</button>
    </>
  );
}

const AddNewContact = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [contactNumber, setContactNumber] = useState('');
  const dispatch = useDispatch();

  function onClickContactPost() {
    setModalIsOpen(false);
    postContact(contactNumber)
      .then(res => {
        console.log("add contact", res);
        dispatch(addContact(res));
      })
      .catch(err => {
        alert("User doesn't exist!");
      })
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
      <AddNewContact />
      <AddNewConversation />
      { ConversationItemsList }
    </div>
  );
}

export default ConversationList;
