import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

import "../globals.css";
import StudentSidebar from "@/app/_components/student-sidebar";
import StudentNavbar from "@/app/_components/student-navbar";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "min-h-screen text-center font-sans antialiased",
        inter.className
      )}
    >
      <StudentNavbar />
      <MaxWidthWrapper>{children}</MaxWidthWrapper>
    </div>
  );
}
