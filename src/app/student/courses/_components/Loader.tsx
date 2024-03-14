"use client";

import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";

type Props = {
  progress?: number; // Define progress as an optional prop
};

// Default value 0 if progress prop is not provided
function Loader({ progress = 0 }: Props) {
  return <Progress value={progress} className="w-[100%] h-1 bg-slate-500" />;
}

export default Loader;
