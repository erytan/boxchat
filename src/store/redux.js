import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userSlice from './user/userSlice';
import chatReducer from './app/chatSlice';

const commonConfig = {
    key: 'men/user',
    storage
}

const userConfig = {
    ...commonConfig,
    whitelist: ['isLoggedIn', 'token','current']
}

export const store = configureStore({
    reducer: {
        chat: chatReducer,
        user: persistReducer(userConfig, userSlice)
    },
});

export const persistor = persistStore(store);