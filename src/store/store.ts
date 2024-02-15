import { create } from "zustand";

type CounterStore = {
  studentData: {
    name: string;
    profile_picture: string;
    email: string;
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

  if (!studentData) {
    const initializedData = initializeStudentData();
    useStudentData.setState({ studentData: initializedData });
  }

  return useStudentData();
};
