import { Karla } from "next/font/google";
import { Navbar } from "../_components/navbar-outside";
import { cn } from "@/lib/utils";

import "../globals.css";

const karla = Karla({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-h-screen  antialiased grainy ", karla.className)}>
      <Navbar />
      {children}
    </div>
  );
}
