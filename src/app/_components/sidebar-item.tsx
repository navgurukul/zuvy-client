"use client";

import { LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Logout } from "@/utils/logout";
import { cn } from "@/lib/utils";
import { SheetClose } from "@/components/ui/sheet";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  onClick?: () => void;
}

export const SidebarItem = ({ icon: Icon, label, href }: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (pathname === "/" && href === "/") || pathname === href;
  // || pathname?.startsWith(`${href}/`);

  const onClick = () => {
    if (label === "Logout") {
      console.log("Logout");
      Logout();
    } else {
      router.push(href);
    }
  };

  return (
    <SheetClose asChild>
      <button
        onClick={onClick}
        type="button"
        className={cn(
          "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20 w-full rounded-r-lg",
          isActive &&
            "text-secondary bg-secondary/20 hover:bg-secondary/20 hover:text-secondary "
        )}
      >
        <div className="flex items-center gap-x-2 py-4">
          <Icon
            size={22}
            className={cn("text-slate-500", isActive && "text-secondary")}
          />
          {label}
        </div>
        <div
          className={cn(
            "ml-auto opacity-0 border-2 border-secondary h-full transition-all",
            isActive && "opacity-100"
          )}
        />
      </button>
    </SheetClose>
  );
};
