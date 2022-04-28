import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { addContact, selectAllContacts, selectAllConversations, selectSelfInfo, setConversations, setSelfInfo } from "../slices/conversationSlice";
import { postContact, postConversation, postGroup, putUserSettings } from "../services/user";
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
        <div style={{display: 'flex', flexDirection: 'column', background: '#255544', padding: '2rem', borderRadius: '13px', gap: '1rem', color: '#ddeeee'}}>
          {contacts && contacts.map(contact => <button key={contact.phone} onClick={() => onClickAddConversation(contact.phone)}>{contact.phone + ' | ' + contact.name}</button>)}
          <button onClick={() => setModalIsOpen(false)} style={{marginTop: "2rem"}}>Close</button>
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
      <div style={{display: 'flex', flexDirection: 'column', background: '#255544', padding: '2rem', borderRadius: '13px', gap: '1rem', color: '#ddeeee'}}>
          <input type="text" value={contactNumber} onChange={event => setContactNumber(event.target.value)} />
          <button onClick={onClickContactPost}>Connect</button>
          <button onClick={() => setModalIsOpen(false)} style={{marginTop: "2rem"}}>Close</button>
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
          <button onClick={() => setModalIsOpen(false)} style={{marginTop: "2rem"}}>Close</button>
        </div>
      </Modal>
      <button disabled={!conversations} onClick={() => setModalIsOpen(true)}>Add New Group</button>
    </>
  );
}

const UserSettings = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [readReceiptSetting, setReadReceiptSetting] = useState(0);
  const [aboutVisibilitySetting, setAboutVisibilitySetting] = useState(0);
  const [lastSeenVisibleSetting, setLastSeenVisibleSetting] = useState(0);
  const [description, setDescription] = useState('');
  const selfInfo = useSelector(selectSelfInfo);
  const dispatch = useDispatch();

  console.log(selfInfo);

  useEffect(() => {
    if (!selfInfo) return;

    setName(selfInfo.name);
    setDescription(selfInfo.about);
    setReadReceiptSetting(!!parseInt(selfInfo.read_receipt_setting));
    setAboutVisibilitySetting(!!parseInt(selfInfo.about_visibility_setting));
    setLastSeenVisibleSetting(!!parseInt(selfInfo.last_seen_on_setting));
  }, [selfInfo])

  function onClickSubmit() {
    if (!(name.length && description.length)) return alert('Please enter name and about');

    setModalIsOpen(false);
    putUserSettings(name, description, +readReceiptSetting, +aboutVisibilitySetting, +lastSeenVisibleSetting)
      .then(result => {
        console.log("user settings", result);
        dispatch(setSelfInfo(result));
      })
  }

  return (
    <>
      <Modal isOpen={modalIsOpen}>
        <div style={{display: 'flex', flexDirection: 'column', background: '#255544', padding: '2rem', borderRadius: '13px', gap: '1rem', color: '#ddeeee'}}>
          <span>Name:</span>
          <input type="text" value={name} onChange={event => setName(event.target.value)}></input>
          <span>About:</span>
          <input type="text" value={description} onChange={event => setDescription(event.target.value)}></input>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.2rem'}}>
            <label>
              <input
                type='checkbox'
                checked={lastSeenVisibleSetting}
                onChange={event => setLastSeenVisibleSetting(!lastSeenVisibleSetting)}
                style={{marginRight: '0.4rem'}}
              />
              Users can see my Last Seen
            </label>
            <label>
              <input
                type='checkbox'
                checked={aboutVisibilitySetting}
                onChange={event => setAboutVisibilitySetting(!aboutVisibilitySetting)}
                style={{marginRight: '0.4rem'}}
              />
              My about info should be publicly visible
            </label>
            <label>
              <input
                type='checkbox'
                checked={readReceiptSetting}
                onChange={event => setReadReceiptSetting(!readReceiptSetting)}
                style={{marginRight: '0.4rem'}}
              />
              Users can see my read receipts
            </label>
          </div>
          <button onClick={onClickSubmit}>Submit</button>
          <button onClick={() => setModalIsOpen(false)} style={{marginTop: "2rem"}}>Close</button>
        </div>
      </Modal>
      <button disabled={!selfInfo} onClick={() => setModalIsOpen(true)}>User Settings</button>
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
      <UserSettings />
      { ConversationItemsList }
    </div>
  );
}

export default ConversationList;
