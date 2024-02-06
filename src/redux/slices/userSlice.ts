"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// var localStorage: Storage;
interface SaveUserState {
  user: {};
  courseID: string;
}
const initialState: SaveUserState = {
  user: localStorage.getItem("AUTH") || {},
  courseID: "",
};

const userData = () => {
  return localStorage.getItem("AUTH");
};

export const saveUser = createSlice({
  name: "saveUser",
  initialState,
  reducers: {
    saveStudent: (state, action: PayloadAction<{}>) => {
      state.user = action.payload;
      // console.log(state.user);
      console.log(userData);
    },
    saveCourseId: (state, action: PayloadAction<string>) => {
      state.courseID = action.payload;
    },
  },
}) as any;

export const { saveStudent, saveCourseId } = saveUser.actions;

export default saveUser.reducer;
