// store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers } from 'redux';
import { thunk } from 'redux-thunk';
import authReducer, { setAuthFromStorage } from './slices/authSlice';
import userReducer from './slices/userSlice';
import diseaseReducer from './slices/diseaseSlice';
 // Assuming you have a patientSlice

const createNoopStorage = () => ({
  getItem() {
    return Promise.resolve(null);
  },
  setItem() {
    return Promise.resolve();
  },
  removeItem() {
    return Promise.resolve();
  },
});

const storage =
  typeof window !== 'undefined'
    ? require('redux-persist/lib/storage').default
    : createNoopStorage();

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
};

const rootReducer = combineReducers({
  auth: authReducer,
  users: userReducer,
  disease: diseaseReducer,
  // Assuming you have a patientReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ 
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
      thunk 
    }),
});

export const persistor = persistStore(store);

// Token Consistency Check
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (token && user) {
    store.dispatch(setAuthFromStorage({ token, user }));
  }
}

export default store;