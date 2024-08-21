'use client'

import React from 'react'
import SubmissionsList from '@/app/student/playground/_components/submissions-list'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Select } from '@/components/ui/select'
import Editor from '@monaco-editor/react'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Code, Play, Upload } from 'lucide-react'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'

type Props = {}

const ViewSolution = (props: Props) => {
    return (
        <div>
            <h1>View Solution</h1>
            {/* <MaxWidthWrapper className="flex flex-col gap-5">
                <div className="flex  items-center gap-x-3">
                    <div className="flex flex-col gap-x-2">
                        <div className="flex gap-x-4 my-4 ">
                            <Avatar>
                                <AvatarImage
                                    src="https://github.com/shadcn.png"
                                    alt="@shadcn"
                                />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <h1 className="text-left font-semibold text-lg">
                                {'Ananf- NG'}- Open Ended Questions Report
                            </h1>
                        </div>
                    </div>
                </div>
                <h1 className="text-left font-semibold text-[20px]">
                    Overview
                </h1>
                <div className="lg:flex h-[150px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md w-1/3 ">
                    <div className="flex flex-col w-full justify-between   ">
                        <div className="flex items-center justify-between p-4 rounded-md bg-green-300">
                            <h1 className="text-xl text-start font-semibold text-gray-800  dark:text-white ">
                                Total Score
                            </h1>
                        </div>
                        <div className="flex flex-start p-4 gap-x-4">
                            <div>
                                <h1 className="text-start font-bold">
                                    {'None'}
                                </h1>
                                <p className="text-gray-500 text-start">
                                    Copy Paste
                                </p>
                            </div>
                            <div>
                                <h1 className="text-start font-bold">{'2'}</h1>
                                <p className="text-gray-500">Tab Changes</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="my-5 flex flex-col gap-y-3 text-left ">
                    <h1 className="text-left font-semibold">Student Answers</h1>

                    <div>
                        <h1 className="text-left font-semibold">
                            1. dasdasdasdasdasdasdasdasdasdasdsadasd
                        </h1>
                        <p>
                            Lorem, ipsum dolor sit amet consectetur adipisicing
                            elit. At quas vitae similique architecto ea
                            praesentium blanditiis fugiat cumque, omnis quisquam
                            maxime incidunt dolores molestiae possimus illum
                            sed! Porro, rerum veniam?
                        </p>
                        <div className="flex items-center gap-2 font-semibold">
                            <div className="bg-green-500 h-3 w-3 rounded-full " />
                            <h1>Evaluation: {'Correct'}</h1>
                        </div>
                    </div>
                </div>
            </MaxWidthWrapper> */}
            {/* <MaxWidthWrapper className="flex flex-col gap-5">
                <div className="flex  items-center gap-x-3">
                    <div className="flex flex-col gap-x-2">
                        <div className="flex gap-x-4 my-4 ">
                            <Avatar>
                                <AvatarImage
                                    src="https://github.com/shadcn.png"
                                    alt="@shadcn"
                                />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <h1 className="text-left font-semibold text-lg">
                                {'Ananf- NG'}- Coding Questions Report
                            </h1>
                        </div>
                    </div>
                </div>
                <h1 className="text-left font-semibold text-[20px]">
                    Overview
                </h1>
                <div className="lg:flex h-[150px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md w-1/3 ">
                    <div className="flex flex-col w-full justify-between   ">
                        <div className="flex items-center justify-between p-4 rounded-md bg-green-300">
                            <h1 className="text-xl text-start font-semibold text-gray-800  dark:text-white ">
                                Total Score
                            </h1>
                        </div>
                        <div className="flex flex-start p-4 gap-x-4">
                            <div>
                                <h1 className="text-start font-bold">
                                    {'None'}
                                </h1>
                                <p className="text-gray-500 text-start">
                                    Copy Paste
                                </p>
                            </div>
                            <div>
                                <h1 className="text-start font-bold">{'2'}</h1>
                                <p className="text-gray-500">Tab Changes</p>
                            </div>
                            <div>
                                <h1 className="text-start font-bold">
                                    {'Yes'}
                                </h1>
                                <p className="text-gray-500">
                                    Cheating Detected
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="my-5 flex flex-col gap-y-3 text-left ">
                    <h1 className="text-left font-semibold">Student Answers</h1>

                    <div>
                        <div className="flex justify-between mb-2">
                            <div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    // onClick={onBack}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {true && (
                            <ResizablePanelGroup
                                direction="horizontal"
                                className="w-full max-w-12xl rounded-lg "
                            >
                                <ResizablePanel defaultSize={50}>
                                    <div className="flex h-[90vh]">
                                        <div className="w-full max-w-12xl p-2  bg-muted text-left">
                                            <div className="p-2">
                                                <h1 className="text-xl">
                                                    {'questionDetails?.title'}
                                                </h1>
                                                <p>
                                                    {
                                                        'questionDetails?.description'
                                                    }
                                                </p>
                                                <p>Examples : Input - </p>
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={50}>
                                    <ResizablePanelGroup direction="vertical">
                                        <ResizablePanel defaultSize={70}>
                                            <div className="flex h-full">
                                                <div className="w-full max-w-5xl bg-muted p-2">
                                                    <form>
                                                        <div>
                                                            <div className="flex justify-between p-2">
                                                                <div className="flex gap-2 items-center">
                                                                    <Code
                                                                        size={
                                                                            20
                                                                        }
                                                                    />
                                                                    <p className="text-lg">
                                                                        Code
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Editor
                                                                height="52vh"
                                                                // language={
                                                                //     language
                                                                // }
                                                                theme="vs-dark"
                                                                // value={
                                                                //     currentCode
                                                                // }
                                                                // onChange={
                                                                //     handleEditorChange
                                                                // }
                                                                className="p-2"
                                                            />
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </ResizablePanel>
                                        <ResizableHandle withHandle />
                                    </ResizablePanelGroup>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        )}
                    </div>
                </div>
            </MaxWidthWrapper> */}
            {/* <MaxWidthWrapper>
                <div>
                    <ScrollArea className="h-screen w-full rounded-md">
                        <div className="flex flex-col justify-center items-center">
                            <div className="p-4 flex gap-y-4 flex-col items-start">
                                <h1 className="text-xl font-semibold">
                                    {props.content.title}
                                </h1>
                                {!status ? (
                                    <h2 className="text-red-600">
                                        Please complete all the questions and
                                        then submit.
                                    </h2>
                                ) : (
                                    <h1 className="text-lg text-secondary font-semibold">
                                        You have already submitted this Quiz
                                    </h1>
                                )}
                                {questions?.map((question, index) => (
                                    <div key={question.id}>
                                        <h1 className="font-semibold my-3">
                                            {'Q'}
                                            {index + 1} .{question.question}
                                        </h1>
                                        <div className="flex flex-col items-start">
                                            {Object.entries(
                                                question.options
                                            ).map(([optionId, optionText]) => (
                                                <div
                                                    key={optionId}
                                                    className="flex items-center gap-5"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question_${question.id}`}
                                                        value={optionId}
                                                        className="m-4 w-4 h-4 text-secondary focus:ring-secondary-500"
                                                        checked={
                                                            question.status ===
                                                                'pass' ||
                                                            question.status ===
                                                                'fail' ||
                                                            question.status ===
                                                                'done'
                                                                ? question.correctOption ===
                                                                  Number(
                                                                      optionId
                                                                  )
                                                                : selectedAnswers[
                                                                      question
                                                                          .id
                                                                  ] === optionId
                                                        }
                                                        onChange={() =>
                                                            handleCorrectQuizQuestion(
                                                                question.id,
                                                                optionId
                                                            )
                                                        }
                                                        disabled={
                                                            question.status ===
                                                                'pass' ||
                                                            question.status ===
                                                                'fail' ||
                                                            question.status ===
                                                                'done'
                                                        }
                                                    />
                                                    {status ? (
                                                        <label
                                                            key={optionId}
                                                            className={`m-4 flex  font-semibold items-center ${
                                                                question
                                                                    .quizTrackingData[0]
                                                                    .chosenOption ===
                                                                Number(optionId)
                                                                    ? question
                                                                          .quizTrackingData[0]
                                                                          .chosenOption ===
                                                                      question.correctOption
                                                                        ? 'text-green-600'
                                                                        : 'text-red-600'
                                                                    : ''
                                                            }`}
                                                        >
                                                            {String(optionText)}
                                                        </label>
                                                    ) : (
                                                        <label
                                                            key={optionId}
                                                            className="m-4 flex items-center"
                                                        >
                                                            {String(optionText)}
                                                        </label>
                                                    )}
                                                </div>
                                            ))}

                                            {status && (
                                                <p
                                                    className={`mt-2 font-semibold ${
                                                        question.status ===
                                                        'fail'
                                                            ? 'text-red-600'
                                                            : 'text-green-600'
                                                    }`}
                                                >
                                                    Status:{' '}
                                                    {
                                                        question
                                                            .quizTrackingData[0]
                                                            .status
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="flex flex-col items-end">
                        <Button
                            disabled={!allQuestionsAnswered()}
                            onClick={handleSubmit}
                            className="flex w-1/6 flex-col"
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </MaxWidthWrapper> */}
        </div>
    )
}

export default ViewSolution
