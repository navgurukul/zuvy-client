import React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { ChevronDown } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import OverviewComponent from '../../../../_components/OverviewComponent'
import IndividualStudentAssesment from '../../../../_components/individualStudentAssesment'

const Page = ({ params }: { params: any }) => {
    return (
        <div>
            <h1 className="text-start ml-6 font-bold text-xl mb-5">
                Python Basic Assesment 1 : Student Reports
            </h1>
            <div className="ml-6 flex flex-col items-start gap-x-3 gap-y-5">
                <div className="flex items-center gap-x-3">
                    <Avatar className="w-5 h-5">
                        <AvatarImage
                            src="https://github.com/shadcn.png"
                            alt="@shadcn"
                        />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a fruit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel className="mr-7">
                                    Student Names
                                </SelectLabel>
                                <SelectItem value="apple">Apple</SelectItem>
                                <SelectItem value="banana">Banana</SelectItem>
                                <SelectItem value="blueberry">
                                    Blueberry
                                </SelectItem>
                                <SelectItem value="grapes">Grapes</SelectItem>
                                <SelectItem value="pineapple">
                                    Pineapple
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <h1 className=" mb-10 text-gray-400">
                    Submitted on 10 April 2024{' '}
                </h1>
            </div>

            <h1 className="text-start ml-6 font-bold text-xl ">Overview</h1>
            {/* <OverviewComponent
                totalCodingChallenges={30}
                correctedCodingChallenges={20}
                correctedMcqs={10}
                totalCorrectedMcqs={10}
                openEndedCorrect={5}
                totalOpenEnded={5}
                score={50}
                totalScore={100}
                copyPaste={'None'}
                tabchanges={0}
            /> */}

            <h1 className="text-start ml-6 font-bold text-xl ">
                Coding Challenges
            </h1>
            <IndividualStudentAssesment />
        </div>
    )
}

export default Page
