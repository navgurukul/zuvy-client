import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

type Props = {}

const Page = (props: Props) => {
    return (
        <div>
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
                            Anand NG - Individual Report
                        </h1>
                    </div>
                    <div>
                        <h3 className="text-left">
                            Submitted on 12 April 2024
                        </h3>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2">
                <div className="p-4 bg-white rounded shadow">
                    <h2 className="text-xl text-left font-bold mb-2">
                        Build a calculator
                    </h2>
                    <h3 className="text-md text-left  mb-2">
                        Problem Statement:
                    </h3>
                    <div className="w-[500px]">
                        <li>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Curabitur lacinia massa non
                        </li>
                        <li>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Curabitur lacinia massa non
                        </li>
                        <li>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Curabitur lacinia massa non
                        </li>
                    </div>
                </div>
                <div className="p-4 flex flex-col gap-y-3 bg-white rounded shadow">
                    <h2 className="text-lg text-left font-bold mb-2">
                        Github Link
                    </h2>
                    <Link href={'/'} className="text-blue-600 text-left">
                        <h2 className="text-left">
                            https://github.com/navgurukul/zuvy-client
                        </h2>
                    </Link>
                    <h2 className="text-lg text-left font-bold mb-2">
                        Video Walkthrough
                    </h2>
                    <div className="">
                        <p>Video Walk through</p>
                    </div>
                    <h2 className="text-lg text-left font-bold mb-2">
                        Grading
                    </h2>
                </div>
            </div>
        </div>
    )
}

export default Page
