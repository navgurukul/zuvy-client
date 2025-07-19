import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

function TabItem({ href, title }: { href: string; title: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = pathname.split("/").pop() === href.split("/").pop();
  //   const handleRoute = () => {
  //     router.push(href);
  //   };
  return (
    <Link
      href={href}
      className={cn(
        "mx-1 px-3 py-1.5 text-sm font-medium rounded-sm",
        isActive && "bg-white text-gray-700"
      )}
    >
      {title}
    </Link>
  );
}

export default TabItem;
