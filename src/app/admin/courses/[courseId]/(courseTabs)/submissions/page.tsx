'use client'
import React, { useState } from 'react'
import PraticeProblems from '../../_components/PraticeProblems'
import Assesments from '../../_components/Assesments'
import Projects from '../../_components/Projects'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Page = () => {
    const [activeTab, setActiveTab] = useState('practice')

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
    }
    // console.log(params)
    const moduleNumbers = [1, 2, 3]
    return (
        <div className="">
            <div className="flex ml-5 items-start gap-x-3">
                <Button
                    onClick={() => handleTabChange('practice')}
                    className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                        activeTab === 'practice'
                            ? 'bg-secondary  text-white'
                            : 'bg-gray-200 text-gray-800'
                    }`}
                >
                    Practice Problems
                </Button>
                <Button
                    onClick={() => handleTabChange('assessments')}
                    className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                        activeTab === 'assessments'
                            ? 'bg-secondary  text-white'
                            : 'bg-gray-200 text-gray-800'
                    }`}
                >
                    Assessments
                </Button>
                <Button
                    onClick={() => handleTabChange('projects')}
                    className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                        activeTab === 'projects'
                            ? 'bg-secondary  text-white'
                            : 'bg-gray-200 text-gray-800'
                    }`}
                >
                    Projects
                </Button>
            </div>

            <Input
                type="name"
                placeholder="Search By Name..."
                className="w-1/3 ml-5 my-4"
            />
            <div className="w-full">
                {activeTab === 'practice' &&
                    moduleNumbers.map((moduleNo) => (
                        <PraticeProblems key={moduleNo} moduleNo={moduleNo} />
                    ))}
                {activeTab === 'assessments' && <Assesments />}
                {activeTab === 'projects' && <Projects />}
            </div>
        </div>
    )
}

export default Page
