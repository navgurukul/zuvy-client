"use client";

import React, { useEffect, useState } from "react";
import api from "@/utils/axios.config";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useLazyLoadedStudentData } from "@/store/store";
import { ArrowBigLeft, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

// Define the type for module data
interface ModuleDataItem {
  id: number;
  label: string;
  name?: string;
  content?: string;
  questions?: Question[];
  completed?: boolean;
}

interface Question {
  id: number;
  question: string;
  options: Option[];
}

interface Option {
  text: string;
  correct: boolean;
  number: number;
}

// Create a component to render the HTML content with Tailwind CSS styles applied
const ContentComponent: React.FC<{ content: any; isQuiz?: boolean }> = ({
  content,
  isQuiz,
}) => {
  // Remove inline styles for quiz questions as it has text color white:-
  const sanitizedContent = isQuiz
    ? content.replace(/style=".*?"/g, "")
    : content;

  return (
    <div
      className={` text-start max-w-3xl mx-auto py-4 ${
        isQuiz ? "text-black" : ""
      }`}
    >
      {/* Render the HTML content */}
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
    </div>
  );
};

function Page({
  params,
}: {
  params: { viewcourses: string; moduleId: string };
}) {
  const { studentData } = useLazyLoadedStudentData();
  const userID = studentData?.id && studentData?.id;
  const router = useRouter();
  const moduleID = params.moduleId;
  const [moduleData, setModuleData] = useState<ModuleDataItem[]>([]);
  const [selectedModuleID, setSelectedModuleID] = useState<number | null>(null);
  const [assignmentId, setAssignmentId] = useState(0);
  const [articleId, setArticleId] = useState(0);
  const [quizId, setQuizId] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: number]: number;
  }>({});

  useEffect(() => {
    const getModuleData = async () => {
      try {
        const response = await api.get(`/Content/chapter/${moduleID}`);
        const data: ModuleDataItem[] = response.data;
        console.log(data);
        const assignmentItem = data.find(
          (item: ModuleDataItem) => item.label === "assignment"
        );
        if (assignmentItem) {
          setAssignmentId(assignmentItem.id);
        }
        const articleItem = data.find(
          (item: ModuleDataItem) => item.label === "article"
        );
        if (articleItem) {
          setArticleId(articleItem.id);
        }
        const quizItem = data.find(
          (item: ModuleDataItem) => item.label === "quiz"
        );
        if (quizItem) {
          setQuizId(quizItem.id);
        }

        setModuleData(data);
        console.log(data);

        // Set selectedModuleID to the ID of the first module
        if (data.length > 0) {
          setSelectedModuleID(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching module data:", error);
      }
    };
    if (userID) getModuleData();
  }, [moduleID, userID]);

  return (
    <div className="flex">
      {/* Sidebar with labels */}

      <div className="w-1/4 border-r-2 text-left p-4">
        <button onClick={() => router.back()}>
          <ArrowBigLeft className="text-[#518672]" />
        </button>

        <h4 className="text-lg font-bold mb-2 mt-5">Chapter List</h4>
        <ul>
          {moduleData.map((item, index) => (
            <li
              key={index}
              className={`flex cursor-pointer capitalize py-2 px-4 hover:bg-gray-300 ${
                selectedModuleID === item.id ? "font-bold" : ""
              }`}
              onClick={() => setSelectedModuleID(item.id)}
            >
              {`${item.label}: ${item.name ? item.name : ""}`}{" "}
              {item.completed && (
                <CheckCircle2 size={18} className="text-[#518672] ml-5 mt-1" />
              )}
              {/* Show number of questions for Quiz and MCQ */}
              {["quiz"].includes(item.label) && (
                <span className="text-sm ml-2 text-gray-500">
                  ({item.questions ? item.questions.length : 0} questions)
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Right side content */}
      <div className="w-3/4 p-4 flex items-end justify-start text">
        {selectedModuleID &&
          moduleData
            .filter((item) => item.id === selectedModuleID)
            .map((item, index) => (
              <div key={index}>
                {/* Render different types of content based on label */}
                {item.label === "article" && item.content && (
                  <>
                    <ContentComponent content={item.content} />
                  </>
                )}

                {item.label === "assignment" && (
                  <>
                    <ContentComponent content={item.content} />
                  </>
                )}
                {item.label === "quiz" && (
                  <div>
                    <h3 className="font-semibold">Quiz</h3>
                    <ul>
                      {item.questions &&
                        item.questions.map((question) => (
                          <li key={question.id}>
                            <ContentComponent
                              content={question.question}
                              isQuiz={true}
                            />

                            <div className="flex justify-start  ">
                              <RadioGroup
                                className="flex"
                                value={selectedOptions[question.id]?.toString()}
                              >
                                {question.options.map((option) => (
                                  <p key={option.number}>
                                    <RadioGroupItem
                                      value={option.number.toString()}
                                      className={`mr-2 ${
                                        option.correct
                                          ? "text-green-500"
                                          : "text-red-500"
                                      }`}
                                    />
                                    <label>{option.text}</label>
                                  </p>
                                ))}
                              </RadioGroup>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
      </div>
    </div>
  );
}

export default Page;
