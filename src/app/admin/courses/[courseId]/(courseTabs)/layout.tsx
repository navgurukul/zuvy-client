import CourseBreadcrumb from "../_components/CourseLayout";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <CourseBreadcrumb />

      <MaxWidthWrapper>{children}</MaxWidthWrapper>
    </div>
  );
}
