import { createSlice } from "@reduxjs/toolkit";

// Conversation ID is equal to partner/group ID of the conversation

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    conversations: null,
    activeConversationID: null,
    contacts: null,
    messages: null,
    selfInfo: null,
    onlineUsers: [],
    readReceipts: []
  },
  reducers: {
    clearChat: (state, action) => {
      state.conversations = [];
      state.contacts = [];
      state.messages = [];
      state.activeConversationID = null;
    },
    storeMessage: (state, action) => {
      const message = action.payload;

      if (!state.messages) state.messages = [];

      state.messages.push(message);
    },
    setActiveConversationID: (state, action) => {
      const partnerID = action.payload;
      state.activeConversationID = partnerID;
    },
    setConversations: (state, action) => {
      const conversations = action.payload;
      state.conversations = conversations;
    },
    addContact: (state, action) => {
      if (!state.contacts) {
        state.contacts = [];
      }

      if (state.contacts.find(contact => contact.phone === action.payload.phone)) return;

      state.contacts.push(action.payload);
    },
    setSelfInfo: (state, action) => {
      state.selfInfo = action.payload;
    },
    setOnline: (state, action) => {
      state.onlineUsers.push(action.payload);
    },
    setOffline: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(phone => phone != action.payload);
    },
    setReadReceipts: (state, action) => {
      console.log("Receipt", action.payload);
      state.readReceipts = action.payload;
    }
  }
})

export const {
  storeMessage, setActiveConversationID, setConversations, addContact,
  clearChat, setSelfInfo, setOnline, setOffline, setReadReceipts
} = conversationSlice.actions;

export const selectAllConversations = state => state.conversation.conversations;
export const selectActiveConversationID = state => state.conversation.activeConversationID;
export const selectConversationByPartnerID = id =>
  state => state.conversation.conversations && state.conversation.conversations.find(conversation =>
    conversation.partnerID === id
  );
export const selectAllContacts = state => state.conversation.contacts;
export const selectMessages = state => state.conversation.messages;
export const selectSelfInfo = state => state.conversation.selfInfo;
export const selectOnlineUsers = state => state.conversation.onlineUsers;
export const selectReadReceipts = state => state.conversation.readReceipts;

export default conversationSlice.reducer;
