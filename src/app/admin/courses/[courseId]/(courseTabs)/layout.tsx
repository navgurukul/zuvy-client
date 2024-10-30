import CourseLayout from "../_components/CourseLayout";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <CourseLayout />

      <MaxWidthWrapper>{children}</MaxWidthWrapper>
    </div>
  );
}
