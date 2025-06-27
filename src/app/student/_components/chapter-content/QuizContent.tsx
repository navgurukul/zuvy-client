import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface QuizContentProps {
  chapterDetails: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    quizQuestions: any | null;
  };
}

const QuizContent: React.FC<QuizContentProps> = ({ chapterDetails }) => {
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<string[]>(new Array(5).fill(''));
  const isCompleted = chapterDetails.status === 'Completed';

  // Sample questions - in real implementation, these would come from chapterDetails.quizQuestions
  const questions = [
    {
      question: "What does DOM stand for?",
      options: ["Document Object Model", "Data Object Management", "Dynamic Object Method", "Document Oriented Markup"],
      correct: 0
    },
    {
      question: "Which method is used to select an element by ID?",
      options: ["document.getElement()", "document.getElementById()", "document.selectId()", "document.findById()"],
      correct: 1
    },
    {
      question: "How do you add an event listener to an element?",
      options: ["element.addListener()", "element.addEventListener()", "element.on()", "element.bind()"],
      correct: 1
    },
    {
      question: "Which property is used to change the text content of an element?",
      options: ["innerHTML", "textContent", "innerText", "Both B and C"],
      correct: 3
    },
    {
      question: "What is the correct way to create a new HTML element?",
      options: ["document.new()", "document.createElement()", "document.create()", "document.newElement()"],
      correct: 1
    }
  ];

  const handleQuizSubmit = () => {
    if (quizAnswers.every(answer => answer !== '')) {
      setQuizSubmitted(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-heading font-bold">{chapterDetails.title}</h1>
        <Badge variant="outline" className={isCompleted ? "text-success border-success" : "text-muted-foreground"}>
          {isCompleted ? 'Completed' : 'Not Completed'}
        </Badge>
      </div>
      
      {chapterDetails.description && (
        <p className="text-muted-foreground mb-6">{chapterDetails.description}</p>
      )}
      
      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={index} className="space-y-3">
            <h3 className="text-lg font-semibold">
              {index + 1}. {q.question}
            </h3>
            <RadioGroup
              value={quizAnswers[index]}
              onValueChange={(value) => {
                const newAnswers = [...quizAnswers];
                newAnswers[index] = value;
                setQuizAnswers(newAnswers);
              }}
              disabled={quizSubmitted || isCompleted}
            >
              {q.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={optionIndex.toString()} 
                    id={`q${index}_option${optionIndex}`}
                    className={quizSubmitted && parseInt(quizAnswers[index]) === optionIndex ? "border-primary" : ""}
                  />
                  <Label htmlFor={`q${index}_option${optionIndex}`} className={`cursor-pointer ${
                    quizSubmitted && parseInt(quizAnswers[index]) === optionIndex ? "text-primary font-medium" : ""
                  }`}>
                    {option}
                  </Label>
                </div>
              ))}
              {quizSubmitted && parseInt(quizAnswers[index]) !== q.correct && (
                <p className="text-sm text-muted-foreground mt-2">
                  Correct Answer: {q.options[q.correct]}
                </p>
              )}
            </RadioGroup>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button 
          onClick={handleQuizSubmit}
          disabled={!quizAnswers.every(answer => answer !== '') || quizSubmitted || isCompleted}
        >
          {quizSubmitted || isCompleted ? 'Submitted ✓' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

export default QuizContent; 