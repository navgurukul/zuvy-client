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
  params: { viewcourses: string; moduleID: string };
}) {
  const { studentData } = useLazyLoadedStudentData();
  const userID = studentData?.id && studentData?.id;
  const router = useRouter();
  const moduleID = params.moduleID;
  const [moduleData, setModuleData] = useState<ModuleDataItem[]>([]);
  const [selectedModuleID, setSelectedModuleID] = useState<number | null>(null);
  const [assignmentLink, setAssignmentLink] = useState("");
  const [assignmentId, setAssignmentId] = useState(0);
  const [articleId, setArticleId] = useState(0);
  const [quizId, setQuizId] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: number]: number;
  }>({});

  useEffect(() => {
    const getModuleData = async () => {
      try {
        const response = await api.get(
          `/Content/chapter/${moduleID}?user_id=${userID}`
        );
        const data: ModuleDataItem[] = response.data;

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

  const handleAssignmentLinkChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAssignmentLink(event.target.value);
  };

  const handleAssignmentSubmit = async () => {
    try {
      const response = await api.post(
        `/tracking/assignment?bootcampId=${params.viewcourses}`,
        {
          userId: userID,
          assignmentId: assignmentId,
          moduleId: parseInt(moduleID),
          projectUrl: assignmentLink,
        }
      );
      const data = response.data;
      console.log(response);
      toast({
        title: "Successfully Submitted Assignment",
        description: response.data.projectUrl,
        className: "text-start capitalize bg-green-500 text-white",
      });

      // Add any additional logic here after successful form submission
    } catch (error: any) {
      console.error("Assignment Not Submitted:", error);
      toast({
        title: "Error Submitting",
        description: error.response.data.message,
        className: "text-start capitalize bg-red-500 text-white",
      });
    }

    return false; // Prevent default form submission
  };

  const handleArticleComplete = async () => {
    try {
      const response = await api.post(
        `/tracking/article?bootcampId=${params.viewcourses}`,
        {
          userId: userID,
          articleId: articleId,
          moduleId: moduleID,
        }
      );
      const data = response.data;
      console.log(response);
      toast({
        title: "Completed Article Successfully",
        description: "You have completed the article successfully",
        className: "text-start capitalize bg-green-500 text-white",
      });
    } catch (error: any) {
      console.error("Error Completing Article:", error);
      toast({
        title: "Error",
        description: error.response.data.message,
        className: "text-start capitalize bg-red-500 text-white",
      });
    }
  };

  const handleQuizSubmit = async () => {
    try {
      const selectedOptionsArray = Object.entries(selectedOptions).map(
        ([questionId, selectedOptionNumber]) => {
          const moduleItem = moduleData.find(
            (item) => item.id === selectedModuleID
          );
          const question = (moduleItem?.questions ?? []).find(
            (q) => q.id === parseInt(questionId)
          );

          const option = question?.options.find(
            (opt) => opt.number === selectedOptionNumber
          );

          return {
            mcqId: parseInt(questionId),
            chossenOption: selectedOptionNumber,
            status: option?.correct ? "pass" : "fail",
            attemptCount: 1,
          };
        }
      );

      console.log(selectedOptionsArray);

      const response = await api.post("/tracking/quiz", {
        userId: userID,
        bootcampId: 9,
        moduleId: moduleID,
        quizId: quizId,
        quiz: selectedOptionsArray ?? [], // Ensure selectedOptionsArray is not undefined
      });

      const data = response.data;

      toast({
        title: "Quiz Submitted Successfully",
        description: "Successfully submitted the quiz",
        className: "text-start capitalize bg-green-500 text-white",
      });
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: "Cannot submit the quiz again",
        className: "text-start capitalize bg-red-500 text-white",
      });
    }
  };

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
                    <Button
                      disabled={item?.completed}
                      onClick={handleArticleComplete}
                    >
                      Complete
                    </Button>
                  </>
                )}

                {item.label === "assignment" && (
                  <div>
                    <ContentComponent content={item.content} />
                    {/* Only render form if label is "assignment" */}
                    <form>
                      {/* Form input fields */}
                      <input
                        type="text"
                        placeholder="Assignment Link"
                        value={assignmentLink}
                        onChange={handleAssignmentLinkChange}
                        className="border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md px-4 py-2 outline-none"
                      />
                      {/* Submit button */}
                      <Button
                        disabled={item?.completed}
                        onClick={handleAssignmentSubmit}
                        type="button"
                      >
                        Submit
                      </Button>
                    </form>
                  </div>
                )}
                {item.label === "quiz" && (
                  <div>
                    {/* <h3 className="font-semibold">Quiz</h3> */}
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
                                onValueChange={(value) =>
                                  setSelectedOptions((prev) => ({
                                    ...prev,
                                    [question.id]:
                                      typeof value === "string"
                                        ? parseInt(value, 10)
                                        : value,
                                  }))
                                }
                                className="flex"
                                value={selectedOptions[question.id]?.toString()}
                              >
                                {question.options.map((option) => (
                                  <p key={option.number}>
                                    <RadioGroupItem
                                      value={option.number.toString()}
                                      className="mr-2"
                                    />
                                    <label>{option.text}</label>
                                  </p>
                                ))}
                              </RadioGroup>
                            </div>
                          </li>
                        ))}
                    </ul>
                    {/* Submit button for quiz */}
                    <Button
                      disabled={item?.completed}
                      className="mt-5"
                      onClick={handleQuizSubmit}
                    >
                      Submit Quiz
                    </Button>
                  </div>
                )}
              </div>
            ))}
      </div>
    </div>
  );
}

export default Page;
