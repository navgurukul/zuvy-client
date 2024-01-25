"use client";
import { Progress } from "@/components/ui/progress";
import React, { useState } from "react";

type Props = {};

function Loader({}: Props) {
  const [progress, setProgress] = useState(13);
  return <Progress value={progress} className="w-[100%] h-1 bg-gray-500 " />;
}

export default Loader;
