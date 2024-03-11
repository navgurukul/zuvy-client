import StudentNavbar from "@/app/_components/navbar";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

import "../globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
    // className={cn(
    //   "min-h-screen text-center font-sans antialiased",
    //   karla.className
    // )}
    >
      <StudentNavbar />
      <MaxWidthWrapper>{children}</MaxWidthWrapper>
    </div>
  );
}
