'use client'
import React, { useEffect, useState } from 'react'
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { PartyPopper } from "lucide-react";

import Heading from './_components/heading'
import Schedule from './_components/schedule'
import Doubt from './_components/doubt'
import Image from 'next/image'
import { Spinner } from '@/components/ui/spinner'

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
                    <div className="flex flex-wrap items-stretch my-3 gap-5">
                        <div className="flex-1">
                            <Schedule />
                        </div>
                        {/* <div className="max-sm:w-full">
          <Stat />
          <Doubt />
        </div> */}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Page
