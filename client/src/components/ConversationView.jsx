import { useSelector } from "react-redux";
import { selectActiveConversationID, selectAllContacts, selectConversationByPartnerID, selectMessages, selectReadReceipts, selectSelfInfo } from "../slices/conversationSlice";
import ChatInput from "./ChatInput";
import "../stylesheets/ConversationView.css";
import { useEffect, useRef } from "react";

const ConversationHeader = ({ conversation }) => {
  console.log(conversation);
  const contacts = useSelector(selectAllContacts);
  const self = useSelector(selectSelfInfo);

  return (
    <div className="ConversationHeader"
      onClick={() => alert(`${conversation.name}\nAbout: ${conversation.about || conversation.description}\n${conversation.phone ? conversation.phone : ''}`)}
    >
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
  const self = useSelector(selectSelfInfo);
  const contacts = useSelector(selectAllContacts);
  const user = contacts && contacts.concat(self || {}).find(user => user.phone == message.creator_id);

  const readReceipts = useSelector(selectReadReceipts)
    .filter(receipt => receipt.partial_id == message.partial_id)
    .filter(receipt => receipt.receiver_id != self.phone);

  function downloadAttachment() {
    if (!message.attachment) return;

    fetch(`/chat/attachment/${message.partial_id}`, {
      headers: { Authorization: `bearer ${sessionStorage.getItem('token')}` }
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

  function showReceiptInfo() {
    var receiptInfo = "";
    readReceipts.forEach(curr => {
      console.log(curr);
      const contact = contacts && contacts.concat(self || {}).find(contact => contact.phone == curr.receiver_id);
      receiptInfo += (
        ("\n" + (contact ? contact.name + ' | ' : '') + curr.receiver_id + "\n" + "Delivered Time: " + (curr.delivered_time ? curr.delivered_time + ' ' + ' ☑️☑️' : "Not delivered ☑️") + "\n" + "Seen Time: " + (curr.seen_time ? curr.seen_time + ' ' + ' ✅✅' : "Not seen") + "\n")
      );
    }, "");

    alert(receiptInfo);
  }

  const textStyle = {};

  if (self && user && self.phone == user.phone)
    textStyle.paddingRight = '4rem';
  
  if (message.attachment) {
    textStyle.color = '#0066dd';
    textStyle.textDecoration = 'underline';
  }

  console.log("A", self, user);

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
      >
        { (user ? user.name : message.creator_id) + (message.attachment ? ' 📎' : '') + (
          (self && message.creator_id == self.phone) ? (readReceipts.length == 0 || readReceipts.find(receipt => !receipt.delivered_time) ? '☑️' : (
            readReceipts.find(receipt => !receipt.seen_time) ? '☑️☑️' : '✅✅'
          )) : ''
        ) }
      </span>
      <span style={textStyle} onClick={() => {showReceiptInfo(); downloadAttachment();}}>
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

  useEffect(() => {
    fetch(`/chat/${conversation.isGroup ? 'group' : 'conversation'}/${conversation.id}`, {
      method: 'PATCH',
      headers: { Authorization: `bearer ${sessionStorage.getItem('token')}` }
    })
  }, [conversation]);

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
