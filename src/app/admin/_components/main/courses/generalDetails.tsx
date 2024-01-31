import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import api from "@/utils/axios.config";
import Image from "next/image";
import styles from "./cources.module.css";

const GeneralDetails: React.FC = () => {
  const MAIN_URL = process.env.MAIN_URL;
  const [duration, setDuration] = useState<number | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [bootcampTopic, setBootcampTopic] = useState<string | null>(null);
  const [courseData, setCourseData] = useState({
    id: 2,
    name: "",
    bootcampTopic: "",
    courseDescription: "",
  });

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await api.get(`/bootcamp/courseID`); // Use relative path now
        const data = response.data;
        setCourseData(data);
        setDuration(data.duration);
        setLanguage(data.language);
      } catch (error) {
        console.error("Error fetching course details:", error);
        // Handle error gracefully, e.g., display an error message to the user
      }
    };

    fetchCourseDetails();
  }, []);

  const handleDurationChange = (months: number) => {
    setDuration(months);
  };

  const handleLanguageChange = (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setCourseData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`${MAIN_URL}/bootcamp/courseID`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...courseData,
          duration,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }
      console.log("Changes saved successfully");
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  return (
    <div className={styles.centeredContainer}>
      <Image
        src='https://t4.ftcdn.net/jpg/03/78/40/11/360_F_378401105_9LAka9cRxk5Ey2wwanxrLTFCN1U51DL0.jpg'
        alt='Course Image'
        className={styles.courseImage}
      />

      <button type='submit' className={styles.uploadImageButton}>
        Upload course Image
      </button>

      <div className={styles.labelInputContainer}>
        <label htmlFor='courseName' className={styles.label}>
          Name:
        </label>
        <Input
          type='text'
          id='courseName'
          placeholder='Enter course name'
          name='name'
          value={courseData.name}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.labelInputContainer}>
        <label htmlFor='topic' className={styles.label}>
          Topic:
        </label>
        <Input
          type='text'
          id='topic'
          placeholder='Enter topic'
          name='bootcampTopic'
          value={courseData.bootcampTopic}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.labelInputContainer}>
        <label htmlFor='courseDescription' className={styles.label}>
          Course Description:
        </label>
        <textarea
          id='courseDescription'
          placeholder='Enter course description'
          className={styles.textBox}
          name='courseDescription'
          value={courseData.courseDescription}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.labelInputContainer}>
        <label htmlFor='duration' className={styles.label}>
          Duration (in months):
        </label>

        <Input
          type='number'
          id='duration'
          placeholder='Enter duration in months'
          name='duration'
          value={duration || ""}
          onChange={(e) => handleDurationChange(Number(e.target.value))}
        />
      </div>

      <div className={styles.labelInputContainer}>
        <label className={styles.label}>Language:</label>
        <div>
          <div className={styles.languageButtons}>
            <button
              onClick={() => handleLanguageChange("Hindi")}
              className={`${styles.languageButton} ${
                language === "Hindi" ? styles.active : ""
              }`}
            >
              Hindi
            </button>
            <button
              onClick={() => handleLanguageChange("English")}
              className={`${styles.languageButton} ${
                language === "English" ? styles.active : ""
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange("Kannada")}
              className={`${styles.languageButton} ${
                language === "Kannada" ? styles.active : ""
              }`}
            >
              Kannada
            </button>
          </div>
        </div>
      </div>

      <button onClick={handleSaveChanges} className={styles.saveChangesButton}>
        Save Changes
      </button>
    </div>
  );
};

export default GeneralDetails;
