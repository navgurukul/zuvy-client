import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn, difficultyBgColor, difficultyColor } from '@/lib/utils';

// Define the types for different question types
interface MCQQuestion {
    id: number;
    title: string;
    description: string;
    options: string[];
    difficulty: string;
}

interface CodingQuestion {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    constraints: string;
    testCases: {
        id: number;
        inputs: {
            parameterName: string;
            parameterType: string;
            parameterValue: any;
        }[];
        expectedOutput: {
            parameterType: string;
            parameterValue: any;
        };
    }[];
}

interface OpenEndedQuestion {
    id: number;
    title: string;
    description: string;
    difficulty: string;
}

// Use a union type for the question prop
type Question = CodingQuestion | MCQQuestion | OpenEndedQuestion;

interface QuestionDescriptionModalProps {
    question: Question;
    type: 'coding' | 'mcq' | 'open-ended';
    tagName?: string;
}

const QuestionDescriptionModal = ({ question, type, tagName }: QuestionDescriptionModalProps) => {
    return (
        <DialogContent className="max-w-2xl p-6">
            <DialogHeader>
                <DialogTitle className="text-xl font-bold">Coding Problem Preview

                    {tagName && (
                        <span className="text-[12px] text-[#518672] bg-[#DCE7E3] rounded-[100px] ml-2 py-1 px-[8px]">
                            {tagName}
                        </span>
                    )}

                    <span
                      className={cn(
                        `text-[12px] text-[#518672] bg-[#DCE7E3] rounded-[100px] ml-2 py-1 px-[8px]`,
                        difficultyColor(question.difficulty), // Text color
                        difficultyBgColor(question.difficulty) // Background color
                    )}
                    >
                        {question.difficulty}
                    </span>
                </DialogTitle>
            </DialogHeader>

            <div className="p-4 space-y-6 text-left">
                {/* Render question description */}
                    <ScrollArea className="h-96">
                        <ScrollBar orientation="vertical" />
                <div>
                    <h4 className="font-semibold text-lg">Title and Description:</h4>

                    <p className="text-gray-700">
                        <span className="font-semibold text-lg">{question.title}: </span>{question.description}</p>
                </div>

                {/* Conditional rendering based on question type */}
                {type === 'coding' && 'testCases' in question && (
                        <div>
                            {/* Problem Statement */}
                            <div>
                                <h4 className="font-semibold text-lg mb-1">Problem Statement:</h4>
                                <p className="text-gray-700 mb-3">
                                    {question.description}
                                </p>
                            </div>

                            {/* Constraints */}
                            <div>
                                <h4 className="font-semibold text-lg mb-1">Constraints:</h4>
                                <p className="text-gray-700 mb-3">{question.constraints}</p>
                            </div>

                            {/* Function Name */}
                            <div>
                                <h4 className="font-semibold text-lg mb-3">Function Name to Start With: <span className="font-light text-base">minJumps</span></h4>

                            </div>


                            {/* Input */}
                            <div>
                                <h4 className="font-semibold text-lg mb-3">Input: <span className="font-light text-base">
                                    Array of integers arr and integer n (size of array)
                                </span></h4>

                            </div>

                            {/* Output */}
                            <div>
                                <h4 className="font-semibold text-lg mb-3">Output: <span className="font-light text-base">
                                    Minimum number of jumps to reach destination (-1 if impossible)
                                </span></h4>
                             
                            </div>

                            {/* Test Cases */}
                            <div>
                                <h4 className="font-semibold text-lg">Test Cases:</h4>
                                {question.testCases.map((testCase, index) => (
                                    <div key={testCase.id} className="px-4">
                                        <h5 className="font-semibold text-md">Example {index + 1}:</h5>
                                        <div className="mb-2">
                                            <strong>Input:</strong>
                                            <ul className="ml-4 list-disc">
                                                {testCase.inputs.map((input, idx) => (
                                                    <li key={idx}>
                                                        {input.parameterName} ({input.parameterType}):{' '}
                                                        {input.parameterValue}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <strong>Output:</strong>
                                            <p className="ml-4 mb-4">
                                                {testCase.expectedOutput.parameterType}: {testCase.expectedOutput.parameterValue}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                )}
                    </ScrollArea>

                {type === 'mcq' && 'options' in question && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Options:</h4>
                        <ul className="list-disc pl-6">
                            {question.options.map((option, idx) => (
                                <li key={idx}>{option}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {type === 'open-ended' && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Details:</h4>
                        <p>{question.description}</p>
                    </div>
                )}
            </div>
        </DialogContent>
    );
};

export default QuestionDescriptionModal;
