'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface CodingChallengeProps {
  challenge: {
    title: string;
    difficulty: string;
    marks: number;
  };
  onBack: () => void;
  onComplete: () => void;
  timeLeft: string;
}

const CodingChallenge = ({ challenge, onBack, onComplete, timeLeft }: CodingChallengeProps) => {
  const [code, setCode] = useState('// Write your solution here\n\n');
  const [output, setOutput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRunCode = () => {
    // Simulate code execution
    setOutput('Test Case 1: ✓ Passed\nTest Case 2: ✓ Passed\nTest Case 3: ✓ Passed\n\nAll tests passed!');
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const problemDescription = `
Given an array of integers, find the maximum sum of any contiguous subarray.

Example:
Input: [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Output: 6
Explanation: The subarray [4, -1, 2, 1] has the largest sum = 6.

Constraints:
- 1 ≤ array length ≤ 10^5
- -10^4 ≤ array[i] ≤ 10^4

Function signature:
function maxSubarraySum(nums) {
    // Your code here
}
  `;

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <X className="w-5 h-5" />
        </Button>
        <div className="font-mono text-lg font-semibold">
          {timeLeft}
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        <div className="w-1/2 p-6 border-r overflow-y-auto">
          <div className="mb-4">
            <h1 className="text-2xl font-heading font-bold mb-2">{challenge.title}</h1>
            <div className="flex gap-2 mb-4">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                challenge.difficulty === 'Easy' ? 'bg-success-light text-success' :
                challenge.difficulty === 'Medium' ? 'bg-warning-light text-black' :
                'bg-destructive-light text-destructive'
              }`}>
                {challenge.difficulty}
              </span>
              <span className="px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
                {challenge.marks} marks
              </span>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <pre className="whitespace-pre-wrap text-sm">{problemDescription}</pre>
            </CardContent>
          </Card>
        </div>

        <div className="w-1/2 flex flex-col">
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Code Editor</h2>
            </div>
            
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-64 font-mono text-sm"
              placeholder="Write your code here..."
            />
            
            <div className="flex justify-between mt-4">
              <Button onClick={handleRunCode} disabled={isSubmitted}>
                Run Code
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitted}
              >
                {isSubmitted ? 'Submitted ✓' : 'Submit'}
              </Button>
            </div>
          </div>

          <div className="h-32 p-6 border-t bg-muted/20">
            <h3 className="text-sm font-semibold mb-2">Output</h3>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
              {output || 'Click "Run Code" to see output...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingChallenge;