"use client";
import React from "react";
import { CircularProgress } from "@nextui-org/react";

export default function CircularLoader() {
  return (
    <CircularProgress
      size="md"
      value={90}
      color="warning"
      showValueLabel={true}
    />
  );
}
