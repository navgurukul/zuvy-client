import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
<<<<<<< HEAD
import "../globals.css";

import StudentNavbar from "@/app/_components/student-navbar";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

const inter = Inter({ subsets: ["latin"] });
=======

import StudentSidebar from "@/app/_components/student-sidebar";
import StudentNavbar from "@/app/_components/student-navbar";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

import "../../globals.css";

// const inter = Inter({ subsets: ["latin"] });
>>>>>>> cc57bebdcd2bb4e3ca09491824b30890acde8c11

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
<<<<<<< HEAD
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
=======
  return <div>{children}</div>;
>>>>>>> cc57bebdcd2bb4e3ca09491824b30890acde8c11
}
