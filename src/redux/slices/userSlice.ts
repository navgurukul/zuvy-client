import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SaveUserState {
  user: {};
  courseID: string;
}
const initialState: SaveUserState = {
  user: {} as any,
  courseID: "",
};

export const saveUser = createSlice({
  name: "saveUser",
  initialState,
  reducers: {
    saveStudent: (state, action: PayloadAction<{}>) => {
      state.user = action.payload;
      console.log(state.user);
    },
    saveCourseId: (state, action: PayloadAction<string>) => {
      state.courseID = action.payload;
    },
  },
}) as any;

export const { saveStudent, saveCourseId } = saveUser.actions;

export default saveUser.reducer;
