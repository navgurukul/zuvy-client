


import React, { useState } from "react";
import styles from "./cources.module.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Course {
  groupName: string;
  learnersCount: number;
  date: string;
  image: string; // URL for the course image
}

  const defaultCourses: Course[] = [
    {
      groupName: 'Group1',
      learnersCount: 67,
      date: '2022-01-12',
      image: 'https://t4.ftcdn.net/jpg/03/78/40/11/360_F_378401105_9LAka9cRxk5Ey2wwanxrLTFCN1U51DL0.jpg',
    },
    {
      groupName: 'Group2',
      learnersCount: 67,
      date: '2022-02-20',
      image: 'https://t4.ftcdn.net/jpg/03/78/40/11/360_F_378401105_9LAka9cRxk5Ey2wwanxrLTFCN1U51DL0.jpg',
    },
    {
      groupName: 'Group3',
      learnersCount: 67,
      date: '2022-01-12',
      image: 'https://t4.ftcdn.net/jpg/03/78/40/11/360_F_378401105_9LAka9cRxk5Ey2wwanxrLTFCN1U51DL0.jpg',
    },
  
  ]

const Batches: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed">("all");

  const handleFilterClick = (filter: "all" | "active" | "completed") => {
    setActiveFilter(filter);
  };

  return (
    <div>
     
      <div>
        <div className={styles.searchContainer}>
          <Input type="text" placeholder="Search" className={styles.searchInput} />

          <Dialog>
            <DialogTrigger>
            <Button variant="outline" className={styles.newCourseBtn}>
            {" "}
            + New Batch
          </Button>
            </DialogTrigger>
            <DialogOverlay/>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Batch</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
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
          <div>
        
          </div>
        </div>
        <div className={styles.courceContainer}>
          {defaultCourses.map((course, index) => (
            <Card key={index} className={styles.cardContainer}>
              <div className={styles.courseImageContainer}>
                <img
                  src={course.image}
                  alt={`Course: ${course.groupName}`}
                  className={styles.courseImage}
                />
              </div>
              <div className={styles.courseDetails}>
                <span className={styles.groupNameText}>{course.groupName}</span>
              </div>
              <div className={styles.courseDetails}>
                <span className={styles.learnersCount}>{course.learnersCount}{" "}Learners</span>
                <span>{course.date}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Batches;
