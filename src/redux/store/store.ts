import { configureStore } from "@reduxjs/toolkit";
import saveUserReducer from "../slices/userSlice";
export const store = configureStore({
  reducer: {
    saveUserReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
