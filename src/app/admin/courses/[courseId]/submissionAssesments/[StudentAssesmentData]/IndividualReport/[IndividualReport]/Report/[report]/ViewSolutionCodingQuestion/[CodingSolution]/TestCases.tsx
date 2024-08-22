import { b64DecodeUnicode } from '@/utils/base64'
const TestCaseResults = ({ testCases }: any) => {
    return (
        <div className="w-full space-y-4">
            {testCases.map((testCase: any, index: number) => {
                console.log(testCase.stdout)
                // const decodedString = b64DecodeUnicode(testCase.stdout)
                return (
                    <div
                        key={index}
                        className="p-6 mb-4 border border-gray-300 rounded-lg shadow-md bg-white"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-xl text-gray-700">
                                Test Case {index + 1}
                            </h2>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    testCase.status === 'Accepted'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {testCase.status}
                            </span>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold text-lg text-gray-600">
                                Inputs:
                            </h3>
                            <ul className="list-disc list-inside pl-4 text-gray-800">
                                {testCase.testCases.inputs.map(
                                    (input: any, i: number) => (
                                        <li key={i} className="my-1">
                                            <span className="font-medium text-gray-600">
                                                {input.parameterName} (
                                                {input.parameterType})
                                            </span>
                                            : {input.parameterValue}
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>

                        <div className="mt-4">
                            <h1 className="font-semibold">
                                Student's out: {'decodedString'}
                            </h1>

                            <h3 className="font-semibold text-lg text-gray-600">
                                Expected Output:
                            </h3>
                            <p className="text-gray-800">
                                <span className="font-medium text-gray-600">
                                    {
                                        testCase.testCases.expectedOutput
                                            .parameterType
                                    }
                                </span>
                                :{' '}
                                {
                                    testCase.testCases.expectedOutput
                                        .parameterValue
                                }
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default TestCaseResults
