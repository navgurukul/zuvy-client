import { Url } from "next/dist/shared/lib/router/router";
import { useRouter } from "next/router";

export const navigateTo = (path: Url) => {
  const router = useRouter();
  router.push(path);
};
