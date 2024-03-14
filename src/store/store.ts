import { create } from "zustand";
import { useEffect } from "react";
import Students from "@/app/admin/courses/[courseId]/_components/students";

type CounterStore = {
  studentData: {
    name: string;
    profile_picture: string;
    email: string;
    id: number;
  } | null;
  studentsInfo: any[];
  setStudentsInfo: (newStudentsInfo: any[]) => void;
  anotherStudentState: any[]; // Add another state
  setAnotherStudentState: (newValue: any[]) => void;
};

// ------------------------------
type deleteStudentStore = {
  isDeleteModalOpen: boolean;
  setDeleteModalOpen: (newValue: boolean) => void;
}

export const getDeleteStudentStore = create<deleteStudentStore>((set) => ({
  isDeleteModalOpen: false, 
  setDeleteModalOpen: (newValue: boolean) => {
    set({ isDeleteModalOpen: newValue });
  },
}));
// ------------------------------

type storeStudentData = {
  studentsData: any[];
  setStoreStudentData: (newValue: any[]) => void;
}

export const getStoreStudentData = create<storeStudentData>((set) => ({
  studentsData: [], 
  setStoreStudentData: (newValue: any[]) => {
    set({ studentsData: newValue });
  },
}));

// ------------------------------

export const useStudentData = create<CounterStore>((set) => ({
  studentData: null,
  studentsInfo: [],
  setStudentsInfo: (newStudentsInfo: any[]) => {
    set({ studentsInfo: newStudentsInfo });
  },
  anotherStudentState: [],
  setAnotherStudentState: (newValue: any[]) => {
    set({ anotherStudentState: newValue });
  },
}));

export const initializeStudentData = () => {
  if (typeof window !== "undefined") {
    const storedData = localStorage.getItem("AUTH");
    return JSON.parse(storedData || "{}");
  }

  return null;
};

export const useLazyLoadedStudentData = () => {
  const {
    studentData,
    studentsInfo,
    setStudentsInfo,
    anotherStudentState,
    setAnotherStudentState,
  } = useStudentData();

  useEffect(() => {
    const initializeData = async () => {
      const initializedData = initializeStudentData();
      useStudentData.setState({ studentData: initializedData });
    };

    initializeData();
  }, []); // Empty dependency array ensures useEffect runs only once when the component mounts

  return {
    studentData,
    studentsInfo,
    setStudentsInfo,
    anotherStudentState,
    setAnotherStudentState,
  };
};
