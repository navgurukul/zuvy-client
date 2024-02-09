"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface SaveUserState {
  user: {};
  courseID: string;
}
const getUserDataFromLocalStorage = () => {
  const storedData =
    typeof window !== "undefined" ? localStorage.getItem("AUTH") : null;

  if (storedData && typeof storedData === "string") {
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error("Error parsing stored data:", error);
    }
  }

  return storedData;
};
const initialState: SaveUserState = {
  user: getUserDataFromLocalStorage() || {},
  courseID: "",
};

export const saveUser = createSlice({
  name: "saveUser",
  initialState,
  reducers: {
    saveStudent: (state, action: PayloadAction<{}>) => {},
    saveCourseId: (state, action: PayloadAction<string>) => {},
  },
}) as any;

export const { saveStudent, saveCourseId } = saveUser.actions;

export default saveUser.reducer;
