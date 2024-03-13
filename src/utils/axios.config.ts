import { useLazyLoadedStudentData } from "@/store/store";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_MAIN_URL;

const AuthTokenData = () => {
  const { studentData } = useLazyLoadedStudentData();
};

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    // Authorization: authToken,
  },
});

export default api;
