'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import{CodingProblemPageProps} from '@/app/student/_components/componentStudentType'


const CodingProblemPage = ({ problem, onClose }: CodingProblemPageProps) => {
  const [code, setCode] = useState('// Write your solution here\n\n');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isSubmitted, setIsSubmitted] = useState(problem.status === 'completed');

  const handleRunCode = () => {
    setOutput('Sample Output:\nArray processed successfully!\n[1, 2, 3, 4, 5]');
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const problemDescription = `
Given an array of integers, implement a function that finds all pairs of numbers that sum to a target value.

Example:
Input: [1, 2, 3, 4, 5], target = 6
Output: [[1, 5], [2, 4]]

Constraints:
- 1 ≤ array length ≤ 1000
- -1000 ≤ array[i] ≤ 1000
- Return all unique pairs

Function signature:
function findPairs(nums, target) {
    // Your code here
}
  `;

  const isReadOnly = problem.status === 'completed';

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        <div className="w-1/2 p-6 border-r overflow-y-auto">
          <div className="mb-4">
            <h1 className="text-2xl font-heading font-bold mb-2">{problem.title}</h1>
            <div className="flex gap-2 mb-4">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                problem.difficulty === 'Easy' ? 'bg-success-light text-success' :
                problem.difficulty === 'Medium' ? 'bg-warning-light text-black' :
                'bg-destructive-light text-destructive'
              }`}>
                {problem.difficulty}
              </span>
              <span className="px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
                {problem.topic}
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
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Code Editor</h2>
                <Select value={language} onValueChange={setLanguage} disabled={isReadOnly}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-64 font-mono text-sm"
              placeholder="Write your code here..."
              readOnly={isReadOnly}
            />
            
            <div className="flex justify-between mt-4">
              <Button onClick={handleRunCode} disabled={isReadOnly}>
                Run Code
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitted || isReadOnly}
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

export default CodingProblemPage;