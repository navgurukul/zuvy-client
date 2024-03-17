import Breadcrumb from "@/components/ui/breadcrumb";
import CourseBreadcrumb from "./_components/CourseLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <CourseBreadcrumb />

      {children}
    </div>
  );
}
