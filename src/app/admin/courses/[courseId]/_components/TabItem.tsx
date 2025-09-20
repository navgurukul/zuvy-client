//// course layout 

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { LucideIcon } from "lucide-react";

interface TabItemProps {
  href: string;
  title: string;
  icon?: LucideIcon;
}

function TabItem({ href, title, icon: Icon }: TabItemProps) {
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
        "mx-1 px-14 py-2 text-sm font-medium rounded-sm flex items-center justify-center gap-2 transition-colors text-center",
        isActive 
          ? "bg-primary text-white" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span className="text-xs leading-tight">{title}</span>
    </Link>
  );
}

export default TabItem;