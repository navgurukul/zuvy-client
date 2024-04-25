'use client'

import React, { useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import Dropzone from '@/app/admin/courses/[courseId]/_components/dropzone'

const page = () => {
    // const [language, setLanguage] = useState('English')

    return (
        <>
            <div className="flex w-full justify-between m-5 border-b-2">
                <div>X</div>
                <h1 className="heading font-bold">
                    Module: AFE + NavGurukul Coding Bootcamp
                </h1>
                {/* <div className="">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="focus-visible:ring-muted"
                            >
                                {language}
                                <ChevronDown className=" ml-1" size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup
                                value={language}
                                onValueChange={setLanguage}
                            >
                                {[
                                    'English',
                                    'Spanish',
                                    'French',
                                    'German',
                                    'Italian',
                                ].map((lang) => {
                                    return (
                                        <DropdownMenuRadioItem
                                            key={lang}
                                            value={lang}
                                        >
                                            {lang}
                                        </DropdownMenuRadioItem>
                                    )
                                })}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div> */}
            </div>
            <div className="container flex text-left">
                <div className="left-container flex-1">
                    <p className="mt-10">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Sit nostrum voluptatum, fugiat nisi illo iusto qui,
                        commodi hic velit incidunt, facere nulla. Voluptas non
                        consequuntur optio rem ad praesentium libero!
                    </p>
                </div>
                <div className="right-container flex-1 text-left ">
                    <div className="right-inside-container flex flex-col gap-1">
                        <h2 className="mt-10 font-bold">Submit Your Project</h2>

                        <h5 className="mb-2 font-bold text-sm">Github Link:</h5>
                        <input
                            type="text"
                            placeholder="https://github.com/projectcode123"
                            className="w-full border-2 rounded-md mb-3 p-2 focus:outline-none"
                        />
                        <h3 className="font-bold text-sm">Video Walkthrough</h3>
                        <p>
                            Please describe your project idea in brief, your
                            process and problems you faced while doing the
                            project
                        </p>
                        <Dropzone
                            className="px-5 py-2 mt-10 border-dashed border-2 rounded-[10px] block"
                            acceptedFiles="video/mp4"
                        />
                    </div>
                    <Button>Submit Project</Button>
                </div>
            </div>
        </>
    )
}

export default page
