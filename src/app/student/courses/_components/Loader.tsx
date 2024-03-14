"use client";

import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";

type Props = {
  progress?: number; // Define progress as an optional prop
};

// Default value 0 if progress prop is not provided
function Loader({ progress = 0 }: Props) {
  return <Progress value={progress} className="w-[70%] h-2 bg-slate-300" />;
}

export default Loader;
