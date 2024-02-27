"use client";
import { ColumnDef } from "@tanstack/react-table";
import { StudentData } from "./students";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import api from "@/utils/axios.config";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const GetdataHandler = (id: number) => {
  const [bootcampData, setBootcampData] = useState<any[]>([]);

  useEffect(() => {
    api
      .get(`/bootcamp/batches/${id}`)
      .then((response) => {
        const transformedData = response.data.map(
          (item: { id: any; name: any }) => ({
            value: item.id.toString(),
            label: item.name,
          })
        );

        setBootcampData(transformedData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [id]);

  return {
    bootcampData,
  };
};

type Status = {
  value: string;
  label: string;
};

function ComboboxPopover({
  id,
  title,
  onChange,
  rowData, // Add a new prop for row data
}: {
  id: number;
  title: string;
  onChange: (selectedValue: string, rowData: any) => void; // Pass rowData to the onChange function
  rowData: any; // Define the type for rowData
}) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const { bootcampData } = GetdataHandler(id);

  return (
    <div className='flex items-center space-x-4'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' className='w-[150px] justify-start'>
            {selectedStatus ? <>{selectedStatus.label}</> : <>{title}</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='p-0' side='right' align='start'>
          <Command>
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {bootcampData.map((status) => (
                  <CommandItem
                    key={status.value}
                    value={status.value}
                    onSelect={(value) => {
                      setSelectedStatus(
                        bootcampData.find(
                          (priority) => priority.value === value
                        ) || null
                      );
                      setOpen(false);
                      onChange(value, rowData); // Pass rowData to the onChange function
                    }}
                  >
                    {status.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const columns: ColumnDef<StudentData>[] = [
  {
    header: "Students Name",
    accessorKey: "name",
  },
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    header: "Batch Asigned To",
    id: "batch",
    cell: ({ row }) => {
      const student = row.original;
      const title = student.batchName;

      return (
        <ComboboxPopover
          id={student.bootcampId}
          title={title}
          onChange={async function (selectedvalue, rowData) {
            await api
              .post(
                `/bootcamp/students/${student.bootcampId}?batch_id=${selectedvalue}`,
                {
                  students: [
                    {
                      email: student.email,
                      name: student.name,
                    },
                  ],
                }
              )
              .then((res) => {
                toast({
                  title: res.data.status,
                  description: res.data.message,
                  className: "text-start capitalize",
                });
              });

            // Now you have access to rowData
            // console.log("Row Data:", rowData);
          }}
          rowData={student} // Pass the row data
        />
      );
    },
  },

  {
    header: "Progress",
    accessorKey: "progress",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original;
      const { userId, bootcampId } = student;
      const deleteStudentHandler = async () => {
        try {
          await api.delete(`/student/${userId}/${bootcampId}`).then((res) => {
            toast({
              title: res.data.status,
              description: res.data.message,
              className: "text-start capitalize",
            });
          });
        } catch (error) {
          toast({
            title: "Failed",
            variant: "destructive",
          });
        }
      };
      return (
        <button>
          <Trash2
            className='text-red-500'
            size={20}
            onClick={deleteStudentHandler}
          />
        </button>
      );
    },
  },
];
