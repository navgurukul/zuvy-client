import { deleteCookie } from "./deleteCookie"; // adjust the path as needed

export const Logout = () => {
  localStorage.clear();
  deleteCookie("secure_typeuser");
  window.location.pathname = "/";
};
