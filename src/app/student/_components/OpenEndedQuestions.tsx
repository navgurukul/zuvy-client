
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface OpenEndedQuestionsProps {
  onBack: () => void;
  onComplete: () => void;
  timeLeft: string;
}

const OpenEndedQuestions = ({ onBack, onComplete, timeLeft }: OpenEndedQuestionsProps) => {
  const [answers, setAnswers] = useState(['', '']);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questions = [
    {
      question: "Explain the concept of event bubbling in JavaScript and provide an example of how you would prevent it.",
      placeholder: "Describe event bubbling and how to prevent it..."
    },
    {
      question: "What are the differences between var, let, and const in JavaScript? When would you use each one?",
      placeholder: "Explain the differences and use cases..."
    }
  ];

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const allAnswered = answers.every(answer => answer.trim().length > 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-heading font-semibold">Open Ended Questions</h1>
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
                Question {index + 1}
              </h3>
              <p className="text-muted-foreground">{q.question}</p>
              <Textarea
                value={answers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder={q.placeholder}
                className="min-h-32"
                disabled={isSubmitted}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Button 
            size="lg"
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitted}
          >
            {isSubmitted ? 'Submitted ✓' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OpenEndedQuestions;