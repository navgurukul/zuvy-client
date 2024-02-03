import { Inter } from "next/font/google";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import AdminSidebar from "./_components/sidebar-admin";

import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <AdminSidebar />
      <MaxWidthWrapper>
        <div className="ml-[70px]">{children}</div>
      </MaxWidthWrapper>
    </div>
  );
}
