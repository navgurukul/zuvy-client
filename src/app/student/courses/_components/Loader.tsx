"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";

type Props = {
  progress?: number; // Define progress as an optional prop
};

// Default value 0 if progress prop is not provided
function Loader({ progress = 0 }: Props) {
  return <Progress value={progress} className=" h-2 w-5/6 bg-muted" />;
}

export default Loader;
