import { Inter } from "next/font/google";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import StudentNavbar from "../_components/navbar";

import "../globals.css";

// const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <StudentNavbar />
      <MaxWidthWrapper>{children}</MaxWidthWrapper>
    </div>
  );
}
