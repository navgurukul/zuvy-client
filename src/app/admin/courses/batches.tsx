import React, { useState } from "react";
import Select from "react-select";

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
} from "@/components/ui/dialog";

import styles from "./cources.module.css";
import Image from "next/image";
interface Course {
  groupName: string;
  learnersCount: number;
  date: string;
  image: string; // URL for the course image
}

const defaultCourses: Course[] = [
  // {
  //   groupName: "Group1",
  //   learnersCount: 67,
  //   date: "2022-01-12",
  //   image:
  //     "https://t4.ftcdn.net/jpg/03/78/40/11/360_F_378401105_9LAka9cRxk5Ey2wwanxrLTFCN1U51DL0.jpg",
  // },
  // {
  //   groupName: "Group2",
  //   learnersCount: 67,
  //   date: "2022-02-20",
  //   image:
  //     "https://t4.ftcdn.net/jpg/03/78/40/11/360_F_378401105_9LAka9cRxk5Ey2wwanxrLTFCN1U51DL0.jpg",
  // },
  // {
  //   groupName: "Group3",
  //   learnersCount: 67,
  //   date: "2022-01-12",
  //   image:
  //     "https://t4.ftcdn.net/jpg/03/78/40/11/360_F_378401105_9LAka9cRxk5Ey2wwanxrLTFCN1U51DL0.jpg",
  // },
];

const Batches: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "completed"
  >("all");
  const [cap, setCap] = useState<number | null>(null);
  const [dialogData, setDialogData] = useState({
    batchName: "",
    courseCommencement: "",
    capEnrollment: null,
  });
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);

  const handleFilterClick = (filter: "all" | "active" | "completed") => {
    setActiveFilter(filter);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDialogData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCreateBatch = async () => {
    try {
      const response = await fetch(
        "BACKEND_API_ENDPOINT_FOR_CREATING_NEW_BATCH",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...dialogData,
            instructor: selectedInstructor?.value,
            capEnrollment: cap,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create batch");
      }

      console.log("Batch created successfully");

      setDialogData({
        batchName: "",
        courseCommencement: "",
        capEnrollment: null,
      });
      setCap(null);
      setSelectedInstructor(null);
    } catch (error) {
      console.error("Error creating batch:", error);
    }
  };

  const instructorOptions = [
    { value: "instructor1", label: "Kohli" },
    { value: "instructor2", label: "Dravid" },
    { value: "instructor3", label: "Sharma" },
    { value: "instructor4", label: "Tendulkar" },
    { value: "instructor5", label: "Dhawan" },
  ];

  return (
    <div>
      <div className={styles.searchContainer}>
        <Input
          type="text"
          placeholder="Search"
          className={styles.searchInput}
        />

        <Dialog>
          <DialogTrigger>
            <Button className={styles.newCourseBtn}>+ New Batch</Button>
          </DialogTrigger>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle className={styles.newCourse}>New Batch</DialogTitle>
              <DialogDescription>
                <div style={{ marginBottom: "10px" }}>
                  <label
                    htmlFor="batchName"
                    className={styles.dialogCourseName}
                  >
                    Batch Name:
                  </label>
                  <input
                    type="text"
                    id="batchName"
                    placeholder="Enter batch name"
                    className={styles.inputBox}
                    onChange={handleInputChange}
                  />
                  <div className={styles.dialogCourseNameContainer}>
                    <label
                      htmlFor="instructor"
                      className={styles.dialogCourseName}
                    >
                      Instructor:
                    </label>
                    <Select
                      id="instructor"
                      placeholder="Select an Instructor"
                      options={instructorOptions}
                      value={selectedInstructor}
                      onChange={(selectedOption) =>
                        setSelectedInstructor(selectedOption)
                      }
                    />
                  </div>
                  <label
                    htmlFor="courseCommencement"
                    className={styles.dialogCourseName}
                  >
                    Course Commencement:
                  </label>
                  <input
                    type="date"
                    id="courseCommencement"
                    className={styles.inputBox}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="capEnrollment" className={styles.label}>
                    Cap Enrollment:
                  </label>
                  <Input
                    type="number"
                    id="capEnrollment"
                    placeholder="Enter cap enrollment"
                    name="capEnrollment"
                    value={cap || ""}
                    onChange={(e) => setCap(Number(e.target.value))}
                  />
                </div>
                <Button
                  onClick={handleCreateBatch}
                  className={styles.createCourseBtnDialog}
                >
                  Create Batch
                </Button>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.content}>
          <span
            className={activeFilter === "all" ? `${styles.active}` : ""}
            onClick={() => handleFilterClick("all")}
          >
            All
          </span>
          <span
            className={activeFilter === "active" ? `${styles.active}` : ""}
            onClick={() => handleFilterClick("active")}
          >
            Active
          </span>
          <span
            className={activeFilter === "completed" ? `${styles.active}` : ""}
            onClick={() => handleFilterClick("completed")}
          >
            Completed
          </span>
        </div>
      </div>
      <div className={styles.courceContainer}>
        {defaultCourses.map((course, index) => (
          <Card key={index} className={styles.cardContainer}>
            <div className={styles.courseImageContainer}>
              <Image
                src={course.image}
                alt={`Course: ${course.groupName}`}
                className={styles.courseImage}
              />
            </div>
            <div className={styles.courseDetails}>
              <span className={styles.groupNameText}>{course.groupName}</span>
            </div>
            <div className={styles.courseDetails}>
              <span className={styles.learnersCount}>
                {course.learnersCount} Learners
              </span>
              <span>{course.date}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Batches;
