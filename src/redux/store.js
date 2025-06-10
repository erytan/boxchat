import { configureStore } from '@reduxjs/toolkit';
import chatReducer from '../store/app/chatSlice';
import userReducer from '../store/user/userSlice'; // Nếu bạn có quản lý user

const store = configureStore({
  reducer: {
    chat: chatReducer,
    user: userReducer, // Nếu có quản lý user
  },
});

export default store;
