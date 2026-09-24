import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/state/authSlice';
import projectReducer from '../features/project/state/projectSlice';
import databaseReducer from '../features/database/state/databaseSlice';
import collectionReducer from '../features/collection/state/collectionSlice';
import attributereducer from '../features/attribute/state/attributeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    database: databaseReducer,
    collection: collectionReducer,
    attribute: attributereducer,
  },
});

export default store;