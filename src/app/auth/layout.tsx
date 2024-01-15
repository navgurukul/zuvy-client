import { Inter } from "next/font/google";
import Navbar from "../_components/outside-navbar";
import { cn } from "@/lib/utils";

import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "min-h-screen font-sans antialiased grainy ",
        inter.className
      )}
    >
      <Navbar />
      {children}
    </div>
  );
}
