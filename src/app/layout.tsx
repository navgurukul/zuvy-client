import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/libs/utils";
// import Navbar from "@/app/_components/Navbar";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zuvy LMS",
  description: "We invest in the India's potential",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body
        className={cn(
          "min-h-screen text-center font-sans antialiased",
          inter.className
        )}
      >
        {/* <Navbar /> */}
        {children}
      </body>
    </html>
  );
}
