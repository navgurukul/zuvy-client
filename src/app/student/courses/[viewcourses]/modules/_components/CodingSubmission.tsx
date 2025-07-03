'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { decodeBase64 } from '@/utils/students'
import Editor from '@monaco-editor/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {TestCase, TestCasesSubmission,CodingSubmissionData} from "@/app/student/courses/[viewcourses]/modules/_components/type"

const CodingSubmission = ({ codingSubmissionsData }: { codingSubmissionsData: CodingSubmissionData }) => {
  const router = useRouter()

  if (!codingSubmissionsData) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    )
  } else if (codingSubmissionsData?.status === 'error') {
    return (
      <div className="p-4">
        <div
          onClick={() => router.back()}
          className="cursor-pointer flex items-center space-x-2 text-secondary hover:text-green-800 mb-4"
        >
          <ChevronLeft width={24} /> <span>Back</span>
        </div>
        <div className="text-red-500 bg-red-100 p-4 rounded-lg shadow-md">
          {codingSubmissionsData?.message}
        </div>
      </div>
    )
  }

  const { sourceCode, TestCasesSubmission } = codingSubmissionsData?.data || {}

  const formatValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return `[${value.join(', ')}]`
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  const renderParameterValue = (parameterType: string, parameterValue: unknown) => {
    // Check if value is an array
    if (Array.isArray(parameterValue)) {
      // Check if it's an array of objects
      if (parameterValue.every(item => typeof item === 'object' && item !== null)) {
        return (
          <>
            [ 
            {parameterValue.map((item, index) => (
              <span key={index}>
                {JSON.stringify(item)}
                {index < parameterValue.length - 1 && ', '}
              </span>
            ))}
            ]
          </>
        );
      }
      // It's an array of primitive values (arrOfNum, arrOfStr)
      return `[ ${parameterValue.join(', ')} ]`;
    }
  
    // If value is an object
    if (typeof parameterValue === 'object' && parameterValue !== null) {
      return JSON.stringify(parameterValue);
    }
  
    // If value is a primitive (number, string, etc.)
    return String(parameterValue);
  };

  const renderInputs = (inputs: TestCase['inputs'], index: number) => {
    if (Array.isArray(inputs)) {
      return (
        <ol className="list-none pl-6">
          {inputs.map((input, i) => {
            const { parameterName, parameterType, parameterValue } = input;
  
            return (
              <li key={i}>
                <strong>{parameterName}:</strong>{' '}
                {renderParameterValue(parameterType, parameterValue)}
              </li>
            );
          })}
        </ol>
      );
    }
  
    return (
      <ol className="list-none pl-6">
        {Object.entries(inputs).map(([key, value]) => (
          <li key={key}>
            {key}:{' '}
            {formatValue(value)}
          </li>
        ))}
      </ol>
    );
  };
  

  return (
    <>
      <div
        onClick={() => router.back()}
        className="cursor-pointer flex items-center space-x-2 text-secondary hover:text-green-800 mb-4"
      >
        <ChevronLeft width={24} /> <span>Back</span>
      </div>
      <div className="w-full mx-auto flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl">
          <div className="bg-white rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Submitted Code
            </h2>
            <div>
              <Editor
                height="80vh"
                width={'85vh'}
                theme="vs-dark"
                value={decodeBase64(sourceCode || '')}
                className={``}
                options={{
                  readOnly: true,
                  cursorStyle: 'line-thin',
                  fontSize: 15,
                }}
              />
            </div>
          </div>
          <div className="bg-white rounded-lg h-[86vh] flex flex-col">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Submission Details
            </h3>
            <ScrollArea className="overflow-auto text-left">
            {TestCasesSubmission?.map((submission: TestCasesSubmission, index: number) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-gray-50 border-l-2 border-r-2 border-secondary rounded-lg"
                >
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">
                    Test Case {index + 1}
                  </h4>
                  <p className="text-gray-600">
                    <strong>Status:</strong> {submission.status}
                  </p>
                  <p className="text-gray-600">
                    <strong>Inputs:</strong>
                    <ul>{renderInputs(submission.testCases.inputs, index)}</ul>
                  </p>
                  <p className="text-gray-600">
                    <strong>Expected Output:</strong>{' '}
                    {formatValue(submission.testCases.expectedOutput.parameterValue)}
                  </p>
                  <p className="text-gray-600">
                    <strong>Your Output:</strong> {submission.stdout || 'N/A'}
                  </p>
                  {submission.stderr && (
                    <div className="text-red-500 mt-2">
                      <strong>Error Output:</strong> {submission.stderr}
                    </div>
                  )}
                  <p className="text-gray-600">
                    <strong>Memory Used:</strong> {submission.memory || 'N/A'} KB
                  </p>
                  <p className="text-gray-600">
                    <strong>Execution Time:</strong> {submission.time || 'N/A'} seconds
                  </p>
                </div>
              ))}
            </ScrollArea>
          </div>

        </div>
      </div>
    </>
  )
}

export default CodingSubmission