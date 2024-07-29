'use client'
import React, { useEffect, useState } from 'react'
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { PartyPopper } from "lucide-react";

import Heading from './_components/heading'
import Schedule from './_components/schedule'
import Doubt from './_components/doubt'
import Image from 'next/image'
import { Spinner } from '@/components/ui/spinner'
import { Stat } from './_components/stat'
import Attendance from './_components/attendance'

function Page() {
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])
    return (
        <div className="md:container md:mx-auto">
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <Spinner className="text-secondary" />
                </div>
            ) : (
                <div>
                    <Heading />
                    {/* <Alert className="text-start bg-accent-foreground ">
        <PartyPopper className="h-4 w-4" color="#082f49" strokeWidth={2.5} />
        <AlertTitle className="text-primary">Congratulations!</AlertTitle>
        <AlertDescription>
          Welcome to Zuvy. You are on route to becoming a star programmer. Happy
          coding!
        </AlertDescription>
      </Alert> */}
                    <div className="flex items-center justify-start gap-1">
                        <Image
                            src={'/party-popper.svg'}
                            alt="party popper"
                            width={'40'}
                            height={'40'}
                        />
                        <p className="text-xl text-justify p-3">
                            Congratulations! Welcome to Zuvy. You are on route
                            to becoming a star programmer. Happy coding!
                        </p>
                    </div>
                    {/* <div className="flex flex-wrap flex-col items-stretch my-3 gap-5">
                        <div className="flex-1">
                            <Schedule />
                        </div>
                        <div className="max-sm:w-full">
                            <Stat />
                        </div>
                    </div> */}
                    {/* <div className="flex flex-wrap items-stretch my-3 gap-5">
                        <div className="flex-1">
                            <Schedule />
                        </div>
                        <div className="max-md:w-full flex flex-col gap-5">
                            <Attendance />
                            <Stat />
                        </div>
                    </div> */}

                    {/* For Large screen like Laptop and large tab */}
                    {/* <div className="hidden lg:flex flex-wrap items-stretch my-3 gap-5">
                        <div className="flex-1">
                            <Schedule />
                        </div>
                        <div className="max-md:w-full flex flex-col gap-5">
                            <Attendance />
                            <Stat />
                        </div>
                    </div>
                    For Small screen like mobile and small tab
                    <div className="block lg:hidden flex flex-wrap items-stretch my-3 gap-5">
                        <div className="max-md:w-full flex flex-col gap-5">
                            <Attendance />
                            <Stat />
                        </div>
                        <div className="flex-1">
                            <Schedule />
                        </div>
                    </div> */}

                    {/* <div className="hidden lg:flex my-3 gap-5">
                        <div className="flex-grow">
                            <Schedule />
                        </div>
                        <div className="w-[300px] flex flex-col gap-5">
                            <Attendance />
                            <Stat />
                        </div>
                    </div>

                    For Small screen like mobile and small tab
                    <div className="block lg:hidden flex flex-col my-3 gap-5">
                        <div className="flex flex-col gap-5">
                            <Attendance />
                            <Stat />
                        </div>
                        <div>
                            <Schedule />
                        </div>
                    </div> */}

                    <div className="flex flex-col lg:flex-row gap-5 my-3">
                        {/* Mobile and Tablet */}
                        <div className="lg:hidden flex flex-col gap-5 w-full">
                            <Attendance />
                            <Stat />
                            <Schedule />
                        </div>

                        {/* Desktop */}
                        <div className="hidden lg:flex w-full gap-5">
                            <div className="w-[70%]">
                                <Schedule />
                            </div>
                            <div className="w-[28%] flex flex-col gap-5">
                                <Attendance />
                                <Stat />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Page
