import { createSlice } from "@reduxjs/toolkit";

// Conversation ID is equal to partner/group ID of the conversation

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    conversations: null,
    activeConversationID: null,
    contacts: null
  },
  reducers: {
    addMessageToConversations: (state, action) => {
      const { message, chatID } = action.payload;
      console.log(32, action.payload);

      const targetConversation = state.conversations.find(conversation =>
        conversation.partnerID === chatID ||
        conversation.partnerID === chatID
      );

      if (!targetConversation.messages) targetConversation.messages = [];

      targetConversation.messages.push(message);
    },
    setActiveConversationID: (state, action) => {
      const partnerID = action.payload;
      state.activeConversationID = partnerID;
    },
    setConversations: (state, action) => {
      const conversations = action.payload;
      state.conversations = conversations;
    },
    addContacts: (state, action) => {
      if (state.contacts === null) {
        state.contacts = [];
      }

      state.contacts.push(...action.payload);
    }
  }
})

export const { addMessageToConversations, setActiveConversationID, setConversations, addContacts } = conversationSlice.actions;

export const selectAllConversations = state => state.conversation.conversations;
export const selectActiveConversationID = state => state.conversation.activeConversationID;
export const selectConversationByPartnerID = id =>
  state => state.conversation.conversations && state.conversation.conversations.find(conversation =>
    conversation.partnerID === id
  );
export const selectAllContacts = state => state.conversation.contacts;

export default conversationSlice.reducer;
