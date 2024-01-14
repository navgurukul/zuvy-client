import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

<<<<<<<< HEAD:src/pages/student/layout.tsx
import "../globals.css";
import StudentSidebar from "@/app/_components/student-sidebar";
import StudentNavbar from "@/app/_components/student-navbar";
========
import "../../globals.css";
import StudentSidebar from "@/pages/_components/student-sidebar";
import StudentNavbar from "@/pages/_components/student-navbar";
>>>>>>>> 5de397e (refactor: change app directory to page):src/pages/(dashboard)/student-dashboard/layout.tsx
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
