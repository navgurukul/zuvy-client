import { create } from "zustand";
import { useEffect } from "react";
import Students from "@/app/admin/courses/[courseId]/_components/students";
import api from "@/utils/axios.config";

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
  token: any;
};

interface CourseData {
  id: string;
  name: string;
  bootcampTopic: string;
  coverImage: string;
  duration: string;
  language: string;
  startTime: string;
  unassigned_students: number;
}

interface StoreCourseData {
  courseData: CourseData | null;
  setCourseData: (newValue: CourseData) => void;
  fetchCourseDetails: (courseId: string) => void;
}

export const getCourseData = create<StoreCourseData>((set) => ({
  courseData: {
    id: "",
    name: "",
    bootcampTopic: "",
    coverImage: "",
    duration: "",
    language: "string",
    startTime:"",
    unassigned_students:0
  },
  setCourseData: (newValue: CourseData) => {
    set({ courseData: newValue });
  },
  fetchCourseDetails: async (courseId: string) => {
    try {
      const response = await api.get(`/bootcamp/${courseId}`);
      const data = response.data;
      set({ courseData: data.bootcamp });
    } catch (error) {
      console.error("Error fetching course details:", error);
    }
  },
}));

// ------------------------------
type deleteStudentStore = {
  isDeleteModalOpen: boolean;
  setDeleteModalOpen: (newValue: boolean) => void;
};

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
};

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
  token: null,
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
    const token = localStorage.getItem("token");

    return {
      studentData: JSON.parse(storedData || "{}"),
      token: token || null,
    };
  }

  return { studentData: null, token: null };
};

export const useLazyLoadedStudentData = () => {
  const {
    studentData,
    studentsInfo,
    token,
    setStudentsInfo,
    anotherStudentState,
    setAnotherStudentState,
  } = useStudentData();

  useEffect(() => {
    const initializeData = async () => {
      const { studentData: initializedData, token } = initializeStudentData();
      useStudentData.setState({ studentData: initializedData });

      // Now you have access to the token and can use it as needed
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
