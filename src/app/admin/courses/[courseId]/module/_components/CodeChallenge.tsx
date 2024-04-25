import React, { useEffect } from 'react'

interface codeChallengeProps {
    content: Array<any>
}

function CodeChallenge({ content }: codeChallengeProps) {
    return (
        <div className="">
            {content
                ? content[0].map((question: any, index: number) => {
                      return (
                          <div
                              key={index}
                              className="bg-white p-4 rounded shadow"
                          >
                              <p className="text-2xl font-bold mb-2">
                                  Problem: {question.title}
                              </p>
                              <p className="mb-2">
                                  Description: {question.description}
                              </p>
                              <p className="mb-2">
                                  Difficulty: {question.difficulty}
                              </p>
                              <p className="mb-2">
                                  Constraints: {question.constraints}
                              </p>
                              <p className="text-xl font-semibold mb-2">
                                  Examples:
                              </p>

                              {question.examples &&
                                  question.examples.map(
                                      (example: any, index: number) => (
                                          <div key={index} className="mb-2">
                                              <p className="font-mono bg-gray-200 p-2 rounded">
                                                  Input:{' '}
                                                  {Array.isArray(example.input)
                                                      ? example.input.join(', ')
                                                      : example.input}
                                              </p>
                                              <p className="font-mono bg-gray-200 p-2 rounded">
                                                  Output:{' '}
                                                  {Array.isArray(example.output)
                                                      ? example.output.join(
                                                            ', '
                                                        )
                                                      : example.output}
                                              </p>
                                          </div>
                                      )
                                  )}

                              <h3 className="text-xl font-semibold mb-2">
                                  Test Cases:
                              </h3>

                              {question.testCases &&
                                  question.testCases.map(
                                      (testCase: any, index: number) => (
                                          <div key={index} className="mb-2">
                                              <p className="font-mono bg-gray-200 p-2 rounded">
                                                  Input:{' '}
                                                  {Array.isArray(testCase.input)
                                                      ? testCase.input.join(
                                                            ', '
                                                        )
                                                      : testCase.input}
                                              </p>
                                              <p className="font-mono bg-gray-200 p-2 rounded">
                                                  Output:{' '}
                                                  {Array.isArray(
                                                      testCase.output
                                                  )
                                                      ? testCase.output.join(
                                                            ', '
                                                        )
                                                      : testCase.output}
                                              </p>
                                          </div>
                                      )
                                  )}

                              <h3 className="text-xl font-semibold mb-2">
                                  Solution:
                              </h3>
                              <p className="font-mono bg-gray-200 p-2 rounded">
                                  {question.solution}
                              </p>
                          </div>
                      )
                  })
                : null}
        </div>
    )
}

export default CodeChallenge
