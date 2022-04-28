import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { addContact, selectAllContacts, selectAllConversations, selectSelfInfo, setConversations } from "../slices/conversationSlice";
import { postContact, postConversation, postGroup } from "../services/user";
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
    <div className="ConversationList">
      <AddNewContact />
      <AddNewConversation />
      <div className='unready-state' style={{flexGrow: '1'}}>No conversations yet.</div>
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
      <Modal isOpen={contacts && contacts.length && modalIsOpen}>
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

const AddNewGroup = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [members, setMember] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const selfInfo = useSelector(selectSelfInfo);
  const contacts = useSelector(selectAllContacts);
  const conversations = useSelector(selectAllConversations);
  const dispatch = useDispatch();

  function onClickAddGroup() {
    if (!(name.length && description.length)) return alert('Please enter group name and description');

    setModalIsOpen(false);
    postGroup(name, description, members.map(member => member.phone))
      .then(result => {
        console.log("add group", result);
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
        <div style={{display: 'flex', flexDirection: 'column', background: '#255544', padding: '2rem', borderRadius: '13px', gap: '1rem', color: '#ddeeee'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.1rem'}}>
            <label>
                <input
                  type='checkbox'
                  defaultChecked={true}
                  disabled
                />
                You
              </label>
          {
          contacts && 
          contacts
            .filter(contact => selfInfo ? contact.phone !== selfInfo.phone : true)
            .map(contact => {
              const isChecked = members.find(existing => existing.phone === contact.phone);
              function toggleChecked() {
                isChecked ?
                  setMember(members.filter(existing => existing.phone !== contact.phone)) :
                  setMember(members.concat(contact))
              }
              return <label key={contact.phone} style={{}}>
                <input
                  type='checkbox'
                  defaultChecked={isChecked}
                  onChange={toggleChecked}
                />
                {contact.phone + ' | ' + contact.name}
              </label>
            }
          )}
          </div>
          <span>Group Name:</span>
          <input type="text" value={name} onChange={event => setName(event.target.value)}></input>
          <span>Group Description:</span>
          <input type="text" value={description} onChange={event => setDescription(event.target.value)}></input>
          <button onClick={onClickAddGroup}>Create Group</button>
        </div>
      </Modal>
      <button disabled={!conversations} onClick={() => setModalIsOpen(true)}>Add New Group</button>
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
      <AddNewGroup />
      { ConversationItemsList }
    </div>
  );
}

export default ConversationList;
