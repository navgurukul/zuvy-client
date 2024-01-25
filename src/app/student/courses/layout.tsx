import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

import StudentSidebar from "@/app/_components/student-sidebar";
import StudentNavbar from "@/app/_components/student-navbar";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

import "../../globals.css";

// const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
