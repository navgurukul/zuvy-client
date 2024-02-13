// store.ts
"use client";
import create from "zustand";

interface AppState {
  studentData: {};
}
const data = JSON.parse(localStorage.getItem("AUTH"));
export const useStore = create<AppState>((set) => ({
  studentData: JSON.parse(localStorage.getItem("AUTH")),
}));
