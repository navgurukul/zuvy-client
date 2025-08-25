import { b64DecodeUnicode } from '@/utils/base64'
import {TestCase,InputPage} from "@/app/admin/courses/[courseId]/submissionAssesments/[assessment_Id]/IndividualReport/[IndividualReport]/Report/[report]/ViewSolutionCodingQuestion/SubmissionViewPageType"
const TestCaseResults = ({ testCases }: any) => {
    return (
        <div className="w-full space-y-4">
            {testCases.map((testCase: TestCase, index: number) => {
                return (
                    <div
                        key={index}
                        className="p-6 mt-5 mb-4 border border-gray-300 rounded-lg shadow-md bg-white"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-xl text-gray-700">
                                Test Case {index + 1}
                            </h2>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${testCase.status === 'Accepted'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}
                            >
                                {testCase.status}
                            </span>
                        </div>

                        {/* Inputs Section */}
                        <div className="mt-4 flex justify-center">
                            <h3 className="font-semibold text-[15px] text-gray-600">
                                Inputs:
                            </h3>
                            <p className="list-disc list-inside pl-2 text-gray-800">
                                {testCase.testCases.inputs.map(
                                    (input: InputPage, i: number) => (
                                        <p key={i} className="my-1 text-[15px]">

                                            <span className="bg-gray-100 p-1 rounded-md">
                                                {JSON.stringify(
                                                    input.parameterValue
                                                )}
                                            </span>
                                        </p>
                                    )
                                )}
                            </p>
                        </div>

                        {/* Your Output Section */}
                        <div className="mt-4 flex justify-center font-semibold text-lg text-gray-600">
                            <h3 className="text-[15px]">
                            {testCase.stderr === null && 'Your Output:'}
                            </h3>
                            <p className='ml-2 text-[15px]'>
                                {testCase.stderr === null && (
                                    Array.isArray(testCase.stdout) || testCase.stdout === 'jsonType' ? (
                                        <span className="bg-gray-100 p-1 rounded-md">
                                            {JSON.stringify(testCase.stdout)}
                                        </span>
                                    ) : (
                                        <span className="bg-gray-100 p-1 rounded-md">
                                            {testCase.stdout === null ? 'null' : testCase.stdout}
                                        </span>
                                    )
                                )}
                            </p>
                        </div>

                        {/* Error Output Section */}
                        {testCase.status !== 'Accepted' && (
                            <div className="mt-4 flex justify-center font-semibold text-lg text-gray-600">
                                <h3 className="text-[15px]">
                                    Error Output:
                                </h3>
                                <p className='ml-2 text-[15px]'>
                                    {Array.isArray(testCase.stderr) || testCase.stderr === 'jsonType' ? (
                                        <span className="bg-gray-100 p-1 rounded-md">
                                            {JSON.stringify(testCase.stderr)}
                                        </span>
                                    ) : (
                                        <span className="bg-gray-100 p-1 rounded-md">
                                            {testCase.stderr === null
                                                ? 'null' : testCase.stderr}
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Time Complexity Section show testCase.time and testCase.memory*/}
                        <div className="mt-4 flex justify-center font-semibold text-lg text-gray-600">
                           {
                                testCase.status === 'Accepted' && (
                                    <>
                                        <h3 className="text-[15px]">
                                            Time:
                                        </h3>
                                        <p className='ml-2'>
                                            {testCase.time}
                                        </p>
                                    </>
                                )
                           }
                        </div>
                        <div className="mt-4 flex justify-center font-semibold text-lg text-gray-600">
                          {testCase.status === 'Accepted' && (
                              <>
                              <h3 className="text-[15px]">
                              Memory:
                          </h3>
                          <p className='ml-2'>
                              {testCase.memory}
                          </p>
                          </>
                          )}
                        </div>


                        {/* Expected Output */}
                        <div className="mt-4">
                            <div className="flex justify-center items-center gap-x-2">
                                <h3 className="font-semibold text-[15px] text-gray-600">
                                    Expected Output:
                                </h3>
                                <p className="text-gray-800 text-[15px]">
                                    <span className="font-semibold text-gray-600">
                                        {testCase.testCases.expectedOutput
                                            .parameterType === 'arrayOfnum' ||
                                            testCase.testCases.expectedOutput
                                                .parameterType === 'jsonType' ? (
                                            <span className="bg-gray-100 p-1 rounded-md">
                                                {JSON.stringify(
                                                    testCase.testCases
                                                        .expectedOutput
                                                        .parameterValue
                                                )}
                                            </span>
                                        ) : (
                                            testCase.testCases.expectedOutput
                                                .parameterValue
                                        )}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default TestCaseResults