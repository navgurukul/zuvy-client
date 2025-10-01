import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div className={cn(" w-full pl-2.5 mb-5", className)}>
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
