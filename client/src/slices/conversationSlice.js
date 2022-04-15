import { createSlice } from "@reduxjs/toolkit";

// Conversation ID is equal to partner/group ID of the conversation

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    conversations: null,
    activeConversationID: null
  },
  reducers: {
    addMessageToConversations: (state, action) => {
      const message = action.payload;

      const targetConversation = state.conversations.find(conversation =>
        conversation.partner.id === message.from ||
        conversation.partner.id === message.to
      );

      targetConversation.messages.push(message);
    },
    setActiveConversationID: (state, action) => {
      const partnerID = action.payload;
      state.activeConversationID = partnerID;
    }
  }
})

export const { addMessageToConversations } = conversationSlice.actions;

export const selectAllConversations = state => state.conversation.conversations;
export const selectActiveConversationID = state => state.conversation.activeConversationID;
export const selectConversationByPartnerID = id =>
  state => state.conversation.conversations.find(conversation =>
    conversation.partner.id === id
  );

export default conversationSlice.reducer;
