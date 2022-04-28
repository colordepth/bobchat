import { useSelector } from "react-redux";
import { selectActiveConversationID, selectAllContacts, selectConversationByPartnerID, selectMessages, selectSelfInfo } from "../slices/conversationSlice";
import ChatInput from "./ChatInput";
import "../stylesheets/ConversationView.css";
import { useEffect, useRef } from "react";

const ConversationHeader = ({ conversation }) => {
  console.log(conversation);
  const contacts = useSelector(selectAllContacts);
  const self = useSelector(selectSelfInfo);

  return (
    <div className="ConversationHeader">
      <div>{ conversation.name } <br/></div>
      <div>
      {
        conversation.isGroup && conversation.users.map(user => {
          return <span title={user.phone}>{' ' + user.name.split(' ').at(0) + ', '}</span>
        })
      }
      </div>
    </div>
  );
}

const MessageCloud = ({ message }) => {
  const date = new Date(message.creation_time);
  const contacts = useSelector(selectAllContacts);
  const self = useSelector(selectSelfInfo);
  const user = contacts && contacts.concat(self || {}).find(user => user.phone == message.creator_id);

  function downloadAttachment() {
    fetch(`/chat/attachment/${message.partial_id}`, {
      headers: { Authorization: `bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        const fileBlob = new Blob(data.attachment.data);
        const fileName = data.filename;

        var url = window.URL.createObjectURL(fileBlob);
        var a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();    
        a.remove();
      })
  }

  return (
    <span className="MessageCloud"
      title={message.creator_id}
      style={self && user && self.phone == user.phone ? {
        alignSelf: 'flex-end',
        cursor: 'pointer'
      } : {}}
    >
      <span
        style={self && user && self.phone == user.phone ? {color: '#0a9337'} : {}}
        onClick={downloadAttachment}
      >
        { (user ? user.name : message.creator_id) + (message.attachment ? ' 📎' : '') }
      </span>
      <span style={self && user && self.phone == user.phone ? {paddingRight: '4rem'} : {}}>
        { message.text }
      </span>
      <span>
        { date.toDateString() + ' | ' + date.toLocaleTimeString() }
      </span>
    </span>
  );
}

const ConversationContent = ({ conversation }) => {
  const conversationContentRef = useRef();
  const allMessages = useSelector(selectMessages);
  const currentMessages = allMessages && allMessages.filter(message => {
    if (conversation.isGroup) {
      return message.group_id === conversation.id;
    }
    return message.conversation_id === conversation.id;
  });

  useEffect(() => {
    conversationContentRef
    && conversationContentRef.current
    && conversationContentRef.current.scrollTo(0, 9999999999);
  })

  return (
    <div className="ConversationContent" ref={conversationContentRef}>
      { currentMessages && currentMessages.map(message => {
          return <MessageCloud message={message} key={JSON.stringify(message)}/>;
        })
      }
    </div>
  );
}

const ConversationView = () => {
  const activeConversationID = useSelector(selectActiveConversationID);
  const activeConversation = useSelector(selectConversationByPartnerID(activeConversationID));

  console.log(activeConversation, activeConversationID);
  
  if (!activeConversation) {
    return (
      <div className="ConversationView unready-state">
        Click on a conversation to view...
      </div>
    );
  }

  return (
    <div className="ConversationView">
      <ConversationHeader conversation={ activeConversation } />
      <ConversationContent conversation={ activeConversation } />
      <ChatInput conversation={ activeConversation } />
    </div>
  );
}

export default ConversationView;
