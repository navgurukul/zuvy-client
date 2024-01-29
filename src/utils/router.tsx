import { useRouter } from "next/router";

// Create a custom hook for navigation
export const useNavigate = () => {
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };
  return navigate;
};
