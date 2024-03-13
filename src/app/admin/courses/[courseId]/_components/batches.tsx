"use client";
import React, { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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

import api from "@/utils/axios.config";
import AddStudentsModal from "./addStudentsmodal";
import { toast } from "@/components/ui/use-toast";
import { Card as card, CardDescription, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useStudentData } from "@/store/store";
import { fetchStudentData } from "./students";
const Batches = ({
  courseID,
  unassigned_students,
}: {
  courseID: string;
  unassigned_students: number;
}) => {
  const [unassignedStudents, setUnassignedStudents] =
    useState(unassigned_students);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const getBootcamp = () => {
    try {
      api.get("/bootcamp").then((response) => setCourses(response.data));
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };
  useEffect(() => {
    getBootcamp();
  }, []);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await api.get(`/bootcamp/batches/${courseID}`);
        setBatches(response.data.data);
      } catch (error: any) {
        console.log(error.message);
      }
    };

    fetchBatches();
  }, [courseID]);
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await api.get(`/bootcamp/${courseID}`);
        const data = response.data;
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    };

    fetchCourseDetails();
  }, [courseID, unassignedStudents]);

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Batch name must be at least 2 characters.",
    }),
    instructorId: z
      .string()
      .refine((instructorId) => !isNaN(parseInt(instructorId))),
    bootcampId: z.string().refine((bootcampId) => !isNaN(parseInt(bootcampId))),
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
      bootcampId: courseID,
      capEnrollment: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const convertedData = {
      ...values,
      instructorId: +values.instructorId,
      bootcampId: +values.bootcampId,
      capEnrollment: +values.capEnrollment,
    };
    try {
      const response = await api
        .post(`/batch`, convertedData, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          const fetchBatches = async () => {
            try {
              const response = await api.get(`/bootcamp/batches/${courseID}`);
              setBatches(response.data);
            } catch (error: any) {
              console.log(error.message);
            }
          };
          fetchBatches();
          const fetchCourseDetails = async () => {
            try {
              const response = await api.get(`/bootcamp/${courseID}`);
              const data = response.data;
              setUnassignedStudents(data.bootcamp.unassigned_students);
            } catch (error) {
              console.error("Error fetching course details:", error);
            }
          };

          fetchCourseDetails();

          toast({
            title: response.data.status,
            description: response.data.message,
            className: "text-start capitalize",
          });
        });
      console.log("Batch created successfully");
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.data.message,
        className: "text-start capitalize",
        variant: "destructive",
      });
      console.error("Error creating batch:", error);
    }
  };

  const renderModal = () => {
    if (unassignedStudents === 0) {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button>New Batch</Button>
          </DialogTrigger>
          <DialogOverlay />
          <AddStudentsModal message={true} id={courseID} />
        </Dialog>
      );
    } else {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button>New Batch</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Batch</DialogTitle>
              Unassigned Students in Records: {unassigned_students}
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
                          <Input placeholder="20230" type="name" {...field} />
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
                    {unassignedStudents} students will be added to this batch
                    (Maximum current availability)
                  </FormDescription>
                  <div className="w-full flex flex-col items-end gap-y-5 ">
                    <DialogClose asChild>
                      <Button className="w-1/2" type="submit">
                        Create batch
                      </Button>
                    </DialogClose>
                  </div>
                </form>
              </Form>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        {batches.length > 0 ? (
          <Input type="search" placeholder="Search" className="w-[400px]" />
        ) : null}
        {renderModal()}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mt-2">
        {batches.length > 0
          ? batches.map((batch: any, index: number) => (
              <Link
                key={batch.name}
                href={`/admin/courses/${courseID}/batch/${batch.id}`}
              >
                <Card key={batch.id} className="text-gray-900 text-base">
                  <div className="bg-white rounded-lg border p-4">
                    <div className="px-1 py-4 flex flex-col items-start">
                      <CardTitle className="font-semibold capitalize">
                        {batch.name}
                      </CardTitle>
                      <CardDescription className=" capitalize">
                        {batch.students_enrolled} <span>Learners</span>
                      </CardDescription>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          : null}
      </div>
    </div>
  );
};

export default Batches;
