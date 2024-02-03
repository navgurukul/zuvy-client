"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  user: {} as any,
};

export const saveUser = createSlice({
  name: "saveUser",
  initialState,
  reducers: {
    saveStudent: (state, action: PayloadAction) => {
      console.log(action.payload);
      state.user = action.payload;
    },
  },
});

export const { saveStudent } = saveUser.actions;

export default saveUser.reducer;
