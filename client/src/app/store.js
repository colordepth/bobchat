import { configureStore } from "@reduxjs/toolkit";
import conversationReducer from "../slices/conversationSlice";


export default configureStore({
  reducer: {
    conversation: conversationReducer
  }
});
