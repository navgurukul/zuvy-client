"use client";
import { ColumnDef } from "@tanstack/react-table";

export type User = {
  name: string;
  email: string;
  dropDown: string;
  progress: string;
  attendence: string;
  id: Number;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },

  {
    accessorKey: "attendence",
    header: "Attendence",
  },
  {
    accessorKey: "id",
    header: "id",
  },
];
