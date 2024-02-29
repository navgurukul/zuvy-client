import { deleteCookie } from "./deleteCookie"; // adjust the path as needed
import { toast } from "@/components/ui/use-toast";

export const Logout = () => {
  localStorage.clear();
  deleteCookie("secure_typeuser");
  toast({
    title: "Logout Successful",
    description: "Goodbye, See you soon!",
    className: "text-start capitalize",
  });
  window.location.pathname = "/";
};
