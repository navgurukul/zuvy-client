'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {MCQQuizProps} from '@/app/student/_components/componentStudentTypes';


const MCQQuiz = ({ quiz, onBack, onComplete, timeLeft }: MCQQuizProps) => {
  const [answers, setAnswers] = useState<string[]>(new Array(5).fill(''));
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questions = [
    {
      question: "What is the correct way to declare a variable in JavaScript?",
      options: ["var x = 5;", "variable x = 5;", "v x = 5;", "declare x = 5;"],
      correct: 0
    },
    {
      question: "Which method is used to add an element to the end of an array?",
      options: ["append()", "push()", "add()", "insert()"],
      correct: 1
    },
    {
      question: "What does DOM stand for?",
      options: ["Document Object Model", "Data Object Management", "Dynamic Object Method", "Document Oriented Markup"],
      correct: 0
    },
    {
      question: "Which of the following is NOT a JavaScript data type?",
      options: ["String", "Boolean", "Integer", "Undefined"],
      correct: 2
    },
    {
      question: "How do you select an element by ID in JavaScript?",
      options: ["document.getElement('id')", "document.getElementById('id')", "document.selectId('id')", "document.findById('id')"],
      correct: 1
    }
  ];

  const handleAnswerChange = (questionIndex: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const allAnswered = answers.every(answer => answer !== '');

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-heading font-semibold">{quiz.title}</h1>
        </div>
        <div className="font-mono text-lg font-semibold">
          {timeLeft}
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-8">
        <div className="space-y-8">
          {questions.map((q, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-lg font-semibold">
                {index + 1}. {q.question}
              </h3>
              <RadioGroup
                value={answers[index]}
                onValueChange={(value) => handleAnswerChange(index, value)}
                disabled={isSubmitted}
              >
                {q.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={optionIndex.toString()} 
                      id={`q${index}_option${optionIndex}`}
                      className={isSubmitted && parseInt(answers[index]) === optionIndex ? "border-primary" : ""}
                    />
                    <Label htmlFor={`q${index}_option${optionIndex}`} className={`cursor-pointer ${
                      isSubmitted && parseInt(answers[index]) === optionIndex ? "text-primary font-medium" : ""
                    }`}>
                      {option}
                    </Label>
                  </div>
                ))}
                {isSubmitted && parseInt(answers[index]) !== q.correct && (
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
            size="lg"
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitted}
          >
            {isSubmitted ? 'Submitted ✓' : 'Submit Quiz'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MCQQuiz;