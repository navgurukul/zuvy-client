import { create } from "zustand";
import { useEffect } from "react";

type CounterStore = {
  studentData: {
    name: string;
    profile_picture: string;
    email: string;
    id: number;
  } | null;
};

export const useStudentData = create<CounterStore>((set) => ({
  studentData: null,
}));

export const initializeStudentData = () => {
  if (typeof window !== "undefined") {
    const storedData = localStorage.getItem("AUTH");
    return JSON.parse(storedData || "{}");
  }

  return null;
};

export const useLazyLoadedStudentData = () => {
  const studentData = useStudentData((state) => state.studentData);

  useEffect(() => {
    const initializeData = async () => {
      const initializedData = initializeStudentData();
      useStudentData.setState({ studentData: initializedData });
    };

    initializeData();
  }, []); // Empty dependency array ensures useEffect runs only once when the component mounts

  return useStudentData();
};
