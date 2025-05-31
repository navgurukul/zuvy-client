'use client'

// External imports
import React, { useEffect, useState } from 'react'
import Image from 'next/image'

// Internal imports
import { Spinner } from '@/components/ui/spinner'
import CourseModulesSection from './_components/CourseModulesSection'
import CourseInformationBanner from './_components/CourseInformationBanner'
import AttendanceSection from './_components/AttendanceSection'
import WhatsNextSection from './_components/WhatsNextSection'

function Page() {
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])
    
    return (
        <div className="container mx-auto px-4 md:px-6 pt-8">
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <Spinner className="text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-12 gap-6">
                    {/* Welcome message - spans all 12 columns */}
                    <div className="col-span-12 flex items-center justify-start gap-2 p-4">
                        <Image
                            src={'/party-popper.svg'}
                            alt="party popper"
                            width={32}
                            height={32}
                        />
                        <p className="text-lg">
                            Welcome to Zuvy. You are on route to becoming a star programmer!
                        </p>
                    </div>

                    {/* TOP SECTION: Course Information Banner - spans all 12 columns */}
                    <div className="col-span-12">
                        <CourseInformationBanner />
                    </div>

                    {/* MAIN CONTENT AREA: Divided into two columns */}
                    {/* Left Column (8/12 = ~2/3 width) - "What's Next" and Course Modules sections */}
                    <div className="col-span-12 md:col-span-8 space-y-6">
                        {/* "What's Next" Section */}
                        <WhatsNextSection />
                        
                        {/* Course Modules Section */}
                        <CourseModulesSection />
                    </div>

                    {/* Right Column (4/12 = ~1/3 width) - Attendance section */}
                    <div className="col-span-12 md:col-span-4 space-y-6">
                        {/* Attendance Section */}
                        <AttendanceSection />
                    </div>
                </div>
            )}
        </div>
    )
}

export default Page
