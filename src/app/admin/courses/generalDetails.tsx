"use client";

import React from "react";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import api from "@/utils/axios.config";
import { LANGUAGES } from "@/utils/constant";

import styles from "./cources.module.css";
import { Label } from "@/components/ui/label";
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
    // startDate: string;
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
      // startDate: string;
    }>
  >;
}

const GeneralDetails: React.FC<GeneralDetailsProps> = ({
  id,
  courseData,
  setCourseData,
}) => {
  // misc

  // state and variables
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // func

  const handleLanguageChange = (selectedLanguage: string) => {
    setCourseData({ ...courseData, language: selectedLanguage });
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setCourseData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await api.patch(
        `/bootcamp/${id}`,
        {
          name: courseData.name,
          bootcampTopic: courseData.bootcampTopic,
          coverImage: courseData.coverImage,
          duration: courseData.duration,
          language: courseData.language,
          capEnrollment: courseData.capEnrollment,
          // startDate: date,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Changes saved successfully");
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  return (
    <div className="max-w-[400px] m-auto">
      <div className="bg-muted flex justify-center rounded-sm my-3">
        {courseData.coverImage ? (
          <Image
            src={courseData.coverImage}
            alt={`Course: ${courseData.name}`}
            className={styles.courseImage}
            fill
          />
        ) : (
          <Image
            src={"/logo_white.png"}
            alt="Course"
            className={styles.courseImage}
            width={100}
            height={100}
          />
        )}
      </div>

      <Button variant={"outline"}>Upload course Image</Button>

      <div className={styles.labelInputContainer}>
        <Label htmlFor="courseName" className={styles.label}>
          Name:
        </Label>
        <Input
          type="text"
          id="courseName"
          placeholder="Enter course name"
          name="name"
          value={courseData.name}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.labelInputContainer}>
        <Label htmlFor="topic" className={styles.label}>
          Topic:
        </Label>
        <Input
          type="text"
          id="topic"
          placeholder="Enter topic"
          name="bootcampTopic"
          value={courseData.bootcampTopic}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.labelInputContainer}>
        <Label htmlFor="startDate" className={styles.label}>
          Start Date:
        </Label>
        <Calendar
          id="startDate"
          mode="single"
          selected={date}
          onSelect={setDate}
          className="p-0 flex justify-center"
          classNames={{ month: "rounded-md border p-3" }}
        />
      </div>
      <div className={styles.labelInputContainer}>
        <Label htmlFor="duration" className={styles.label}>
          Duration (in months):
        </Label>

        <Input
          type="number"
          id="duration"
          placeholder="Enter duration in months"
          name="duration"
          value={courseData.duration || ""}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.labelInputContainer}>
        <Label htmlFor="duration" className={styles.label}>
          Cap Enrollment:
        </Label>

        <Input
          type="number"
          id="capEnrollment"
          placeholder="Enter the enrollment cap"
          name="capEnrollment"
          value={courseData.capEnrollment || ""}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.labelInputContainer}>
        <Label className={styles.label}>Language:</Label>
        <div>
          <div className="text-start mb-8">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={` px-2 py-1 mr-3 rounded-sm ${
                  courseData.language === lang
                    ? "bg-muted-foreground text-white"
                    : "bg-muted"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={handleSaveChanges}>Save Changes</Button>
    </div>
  );
};

export default GeneralDetails;
