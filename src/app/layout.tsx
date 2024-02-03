import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
// import Navbar from "@/app/_components/Navbar";
import "./globals.css";
import Head from "next/head";
import { ReduxToolkitProvider } from "@/redux/Provider/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zuvy LMS",
  description: "We invest in the India's potential",
  icons: {
    icon: ["/favicon.ico?v=4"],
    apple: ["/apple-touch-icon.png?v=4"],
    shortcut: ["/apple-touch-icon.png"],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className='light'>
      <body
        className={cn(
          "min-h-screen text-center font-sans antialiased",
          inter.className
        )}
      >
        {/* <Navbar /> */}
        <ReduxToolkitProvider>{children}</ReduxToolkitProvider>
      </body>
    </html>
  );
}
