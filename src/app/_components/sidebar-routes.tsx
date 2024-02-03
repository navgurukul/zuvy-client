"use client";

import { usePathname } from "next/navigation";

import { SidebarItem } from "./sidebar-item";
import { commonRoutes, guestRoutes, adminRoutes } from "@/lib/sidebar-routes";

export const SidebarRoutes = () => {
  const pathname = usePathname();

  const isAdmin = pathname?.includes("/admin");

  const routes = isAdmin ? adminRoutes : guestRoutes;

  return (
    <div className="flex justify-between flex-col h-full">
      <div>
        {routes.map((route) => (
          <SidebarItem
            key={route.href}
            icon={route.icon}
            label={route.label}
            href={route.href}
          />
        ))}
      </div>
      <div>
        {commonRoutes.map((route) => (
          <SidebarItem
            key={route.href}
            icon={route.icon}
            label={route.label}
            href={route.href}
          />
        ))}
      </div>
    </div>
  );
};
