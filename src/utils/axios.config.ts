import { useLazyLoadedStudentData } from "@/store/store";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_MAIN_URL;

const token = localStorage.getItem("token");

// const AuthTokenData = () => {
//   const { token }: any = useLazyLoadedStudentData();
//   return token;
// };
// console.log(AuthTokenData());
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});

export default api;
