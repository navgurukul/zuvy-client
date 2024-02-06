"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import Image from "next/image";

import styles from "../../_components/cources.module.css";
import { Label } from "@/components/ui/label";
import { LANGUAGES } from "@/utils/constant";
import api from "@/utils/axios.config";

const FormSchema = z.object({
  name: z.string().optional(),
  bootcampTopic: z.string(),
  //   coverImage: z.string().min(2, {
  //     message: "Username must be at least 2 characters.",
  //   }),
  duration: z.coerce.number().optional(),
  language: z.string(),
  capEnrollment: z.coerce.number().int().positive().optional(),
  startTime: z.date().optional(),
});

interface GeneralDetailsProps {
  id: string;
  courseData: {
    id: string;
    name: string;
    bootcampTopic: string;
    coverImage: string;
    duration: number;
    language: string;
    capEnrollment: number;
    startTime: string;
  };
  setCourseData: React.Dispatch<
    React.SetStateAction<{
      id: string;
      name: string;
      bootcampTopic: string;
      coverImage: string;
      duration: number;
      language: string;
      capEnrollment: number;
      startTime: string;
    }>
  >;
}

export const GeneralDetails: React.FC<GeneralDetailsProps> = ({
  id,
  courseData,
  setCourseData,
}) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: courseData.name,
      bootcampTopic: courseData.bootcampTopic,
      //   coverImage: "",
      duration: courseData.duration,
      language: courseData.language,
      capEnrollment: courseData.capEnrollment,
    },
    values: {
      name: courseData.name,
      bootcampTopic: courseData.bootcampTopic,
      //   coverImage: "",
      duration: courseData.duration,
      language: courseData.language,
      capEnrollment: courseData.capEnrollment,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = await api
        .patch(
          `/bootcamp/${id}`,
          {
            ...data,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then(() => {
          toast({
            title: "Submission successful",
            // description: (
            //   <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            //     <code className="text-white">
            //       {JSON.stringify(data, null, 2)}
            //     </code>
            //   </pre>
            // ),
          });
        });
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  }

  return (
    <div className="max-w-[400px] m-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-muted flex justify-center rounded-sm my-3">
            <Image
              src={"/logo_white.png"}
              alt="Course"
              className={styles.courseImage}
              width={100}
              height={100}
            />
          </div>
          <Input id="picture" type="file" />
          {/* <Button variant={"outline"}>Upload course Image</Button> */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="text-start">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bootcampTopic"
            render={({ field }) => (
              <FormItem className="text-start">
                <FormLabel>Topic</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} value={field.value} />
                </FormControl>
                {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="flex flex-col text-start">
                <FormLabel>Date of birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {/* <FormDescription>
                  Your date of birth is used to calculate your age.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem className="text-start">
                <FormLabel>Duration</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="shadcn"
                    {...field}
                    value={field.value}
                  />
                </FormControl>
                {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capEnrollment"
            render={({ field }) => (
              <FormItem className="text-start">
                <FormLabel>Cap Enrollment</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="shadcn"
                    {...field}
                    value={field.value}
                  />
                </FormControl>
                {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem className="space-y-3 text-start">
                <FormLabel>Language</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex"
                  >
                    {LANGUAGES.map((lang) => (
                      //   <button
                      //     key={lang}
                      //     // onClick={() => handleLanguageChange(lang)}
                      //     // className={` px-2 py-1 mr-3 rounded-sm ${
                      //     //   courseData.language === lang
                      //     //     ? "bg-muted-foreground text-white"
                      //     //     : "bg-muted"
                      //     // }`}
                      //   >
                      //     {lang}
                      //   </button>
                      <FormItem
                        key={lang}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={lang} />
                        </FormControl>
                        <FormLabel className="font-normal">{lang}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};
