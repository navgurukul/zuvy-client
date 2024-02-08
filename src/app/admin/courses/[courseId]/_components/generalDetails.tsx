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
import { useRef } from "react";
import axios from "axios";
import OptimizedImageWithFallback from "@/components/ImageWithFallback";

const FormSchema = z.object({
  name: z.string(),
  bootcampTopic: z.string(),
  duration: z.string().optional(),
  language: z.string(),
  capEnrollment: z.coerce.number().int().positive().optional(),
  startTime: z.date().optional(),
  coverImage: z.string(),
});

interface GeneralDetailsProps {
  id: string;
  courseData: {
    id: string;
    name: string;
    bootcampTopic: string;
    coverImage: string;
    duration: string;
    language: string;
    capEnrollment: number;
    startTime: Date;
  };
  setCourseData: React.Dispatch<
    React.SetStateAction<{
      id: string;
      name: string;
      bootcampTopic: string;
      coverImage: string;
      duration: string;
      language: string;
      capEnrollment: number;
      startTime: Date;
    }>
  >;
}

export const GeneralDetails: React.FC<GeneralDetailsProps> = ({
  id,
  courseData,
  setCourseData,
}) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: courseData.name,
      bootcampTopic: courseData.bootcampTopic,
      coverImage: courseData.coverImage,
      duration: courseData.duration,
      language: courseData.language,
      capEnrollment: courseData.capEnrollment,
      startTime: new Date(courseData.startTime),
    },
    values: {
      name: courseData.name,
      bootcampTopic: courseData.bootcampTopic,
      coverImage: courseData.coverImage,
      duration: courseData.duration,
      language: courseData.language,
      capEnrollment: courseData.capEnrollment,
      startTime: new Date(courseData.startTime),
    },
  });

  // const handleImageChange=(e)=>{

  // }

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
        .then((res) => {
          const {
            id,
            name,
            bootcampTopic,
            coverImage,
            startTime,
            duration,
            language,
            capEnrollment,
          } = res.data.updatedBootcamp[0];
          setCourseData({
            id,
            name,
            bootcampTopic,
            coverImage,
            startTime,
            duration,
            language,
            capEnrollment,
          });
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
        // description: error.message,
      });
      console.error("Error saving changes:", error);
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await axios
          .post(`${BASE_URL}/courseEditor/ImageUploadS3`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => {
            const imageUrl = res.data.file.url;
            setCourseData({ ...courseData, coverImage: imageUrl });
          });
      } catch (error) {
        console.error("Network error:", error);
      }
    }
  };

  return (
    <div className="max-w-[400px] m-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-muted flex justify-center rounded-sm my-3 overflow-hidden">
            <OptimizedImageWithFallback
              src={courseData.coverImage}
              alt={courseData.name}
              fallBackSrc={"/logo_white.png"}
              // className=""
            />
          </div>
          <div>
            <Input
              id="picture"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            <Button
              variant={"outline"}
              type="button"
              onClick={handleButtonClick}
            >
              Upload course Image
            </Button>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="text-start">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="shadcn"
                    {...field}
                    value={field.value}
                    className="capitalize"
                  />
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
                  <Input
                    placeholder="Enter Bootcamp Name"
                    {...field}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="flex flex-col text-start">
                <FormLabel>Date of Commencement</FormLabel>
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
                      disabled={(date) => date < new Date()}
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
                    type="text"
                    placeholder="Enter Bootcamp Duration"
                    {...field}
                    value={field.value}
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
              <FormItem className="text-start">
                <FormLabel>Cap Enrollment at</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter Bootcamp Enrollment Cap"
                    {...field}
                    value={field.value}
                  />
                </FormControl>
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
                    className="flex"
                    value={field.value}
                  >
                    {LANGUAGES.map((lang) => (
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
