"use client";
import React, { useEffect, useState } from "react";
import StudentsBatchTable from "./studentsBatchDataTable";
import { columns } from "./column";
import api from "@/utils/axios.config";
import { usePathname, useSearchParams } from "next/navigation";
import { useStudentData } from "@/store/store";
import { Input } from "@/components/ui/input";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Trash2 } from "lucide-react";
import { Pencil } from "lucide-react";
import { CalendarDays } from "lucide-react";
import { Hand } from "lucide-react";
import Breadcrumb from "@/components/ui/breadcrumb";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {};
export type StudentData = {
  email: string;
  name: string;
  userId: string;
  bootcampId: number;
  batchName: string;
  batchId: number;
  progress: number;
  profilePicture: string;
  id: string;
};
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const BatchesInfo = (props: Props) => {
  const router = useRouter();
  const { studentsInfo, setStudentsInfo } = useStudentData();
  const pathname = usePathname();
  const matches = pathname.match(/\/(\d+)\/(\d+)\/(\d+)/);
  const [studentsData, setStudentData] = useState<StudentData[]>([]);
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(today.getDate()).padStart(2, "0");

  const crumbs = [
    {
      crumb: "My Courses",
      href: `/admin/courses/${
        studentsData.length > 0 ? studentsData[0].bootcampId : ""
      }`,
    },
    {
      crumb: `Batches`,
      href: `/admin/courses/${
        studentsData.length > 0 ? studentsData[0].bootcampId : ""
      }/${studentsData.length > 0 ? studentsData[0].batchId : ""}/${
        studentsData.length > 0 ? studentsData[0].batchId : ""
      }`,
    },
    {
      crumb: `${studentsData.length > 0 ? studentsData[0].batchName : ""}`,
      href: `/admin/courses/${
        studentsData.length > 0 ? studentsData[0].bootcampId : ""
      }/${studentsData.length > 0 ? studentsData[0].batchId : ""}/${
        studentsData.length > 0 ? studentsData[0].batchId : ""
      }`,
    },
  ];
  const formattedDate = `${year}-${month}-${day}`;
  useEffect(() => {
    const fetchBatchesInfo = async () => {
      try {
        if (matches) {
          const [firstValue, bootcampId, batchId] = matches;
          const response = await api.get(
            `/bootcamp/students/${bootcampId}?batch_id=${batchId}`
          );
          setStudentData(response.data.studentsEmails);
          setStudentsInfo(response.data.studentsEmails);
        }
      } catch (error) {}
    };
    fetchBatchesInfo();
  }, []);

  const batchDeleteHandler = async () => {
    if (matches) {
      const [firstValue, bootcampId, batchId] = matches;
      try {
        await api.delete(`/batch/${batchId}`).then(() => {
          toast({
            title: "Batch Deleted Succesfully",
            className: "text-start capitalize",
          });
        });
        router.push(`/admin/courses/${bootcampId}`);
      } catch (error) {
        toast({
          title: "Batch not Deleted ",
          className: "text-start capitalize",
        });
      }
    }
  };

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Batch name must be at least 2 characters.",
    }),
    instructorId: z
      .string()
      .refine((instructorId) => !isNaN(parseInt(instructorId))),
    // bootcampId: z.string().refine((bootcampId) => !isNaN(parseInt(bootcampId))),
    capEnrollment: z
      .string()
      .refine((capEnrollment) => !isNaN(parseInt(capEnrollment)), {
        message: "A cap enrollment is required",
      }),
  });

  const { handleSubmit, register } = useForm({
    resolver: zodResolver(formSchema),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      instructorId: "",
      capEnrollment: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const convertedData = {
      ...values,
      instructorId: +values.instructorId,
      capEnrollment: +values.capEnrollment,
    };
    try {
      if (matches) {
        const [firstValue, bootcampId, batchId] = matches;

        const response = await api
          .patch(`/batch/${batchId}`, convertedData)
          .then((res) => {
            toast({
              title: "Batches Updated Succesfully",
            });
            const fetchBatchesInfo = async () => {
              try {
                if (matches) {
                  const [firstValue, bootcampId, batchId] = matches;
                  const response = await api.get(
                    `/bootcamp/students/${bootcampId}?batch_id=${batchId}`
                  );
                  setStudentData(response.data.studentsEmails);
                  setStudentsInfo(response.data.studentsEmails);
                }
              } catch (error) {}
            };
            fetchBatchesInfo();
          });
      }
    } catch (error) {
      toast({
        title: "Batches Did'nt Succesfully",
      });
    }
  };
  return (
    <>
      <Breadcrumb crumbs={crumbs} />
      <MaxWidthWrapper className="p-4">
        <div className="flex justify-between">
          <div className="w-1/2 flex flex-col items-start ">
            <div className="">
              <h1 className="capitalize text-start text-[30px] font-semibold">
                {studentsData.length > 0 ? studentsData[0].batchName : ""}
              </h1>
            </div>
            <Input
              type="search"
              placeholder="Student Name, Email"
              className="w-1/2 my-12"
              disabled
            />
          </div>
          <div className="flex m-4">
            <div className="flex items-center mx-4 text-sm">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex ">
                    <Pencil size={18} className="mx-4" />
                    Edit Batch
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Batch</DialogTitle>

                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                      >
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Batch Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Batch Name" {...field} />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="instructorId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instructor Id</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="20230"
                                  type="name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="capEnrollment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cap Enrollment</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Cap Enrollment"
                                  type="number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormDescription>
                          This form will Update the batch info
                        </FormDescription>
                        <div className="w-full flex flex-col items-end gap-y-5 ">
                          <DialogClose asChild>
                            <Button className="w-1/2" type="submit">
                              Update batch
                            </Button>
                          </DialogClose>
                        </div>
                      </form>
                    </Form>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex items-center text-sm">
              <AlertDialog>
                <AlertDialogTrigger className="flex">
                  <Trash2 size={20} className="text-red-500 mx-4" />
                  <p className="text-red-500">Delete</p>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      this batch
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={batchDeleteHandler}
                      className="bg-red-500"
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
        <StudentsBatchTable columns={columns} data={studentsInfo} />
      </MaxWidthWrapper>
    </>
  );
};

export default BatchesInfo;
