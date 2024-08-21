'use client'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import React from 'react'
import { ArrowLeft, Camera } from 'lucide-react'
import { useLazyLoadedStudentData } from '@/store/store'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
type Props = {}

function Page({}: Props) {
    const { studentData } = useLazyLoadedStudentData()
    const router = useRouter()

    const handleBack = () => {
        router.back()
    }
    return (
        <div>
            <MaxWidthWrapper className="flex flex-col items-center justify-between sm:flex-col ">
                <div className="flex items-start justify-between min-w-full ">
                    <div>
                        <Button variant={'ghost'} onClick={handleBack}>
                            <ArrowLeft />
                        </Button>
                    </div>
                    <div className="flex flex-col items-center mx-auto justify-center">
                        <div className="relative">
                            <Avatar className="h-40 w-40 flex flex-col justify-center items-center">
                                <AvatarImage
                                    src={studentData?.profile_picture}
                                />
                                <AvatarFallback>NAME</AvatarFallback>
                            </Avatar>
                            <button className="absolute bottom-0 right-0 bg-[#2f433a] text-white rounded-full p-2 shadow-md hover:bg-[#518672] focus:outline-none">
                                <Camera />
                            </button>
                        </div>
                        <div className="flex items-start justify-center flex-col ">
                            <p className="mt-2  ">Name</p>
                            <input
                                className="flex h-18 w-[420px] rounded-md mt-4 border border-black/30 bg-transparent px-2 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-black/30 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                type="name"
                                placeholder={studentData?.name}
                                disabled
                            />
                        </div>
                        <div className="flex items-start justify-center flex-col ">
                            <p className="mt-2  ">Email</p>
                            <input
                                className="flex h-18 w-[420px] rounded-md mt-4 border border-black/30 bg-transparent px-2 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-black/30 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                type="email"
                                placeholder={studentData?.email}
                                disabled
                            />
                        </div>
                        {/* <div className='flex items-start justify-center flex-col '>
              <p className='mt-2  '>Phone Number</p>
              <input
                className='flex h-18 w-[420px] rounded-md mt-4 border border-black/30 bg-transparent px-2 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-black/30 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50'
                type='mumber'
                placeholder=' +14567892145'
                disabled
              />
            </div> */}
                        <button className="bg-[#f0f0f0] rounded p-3 mt-3 h-30  w-[180px]">
                            <Link href="/profile">
                                <span className="text-sm text-gray-700  font-semibold">
                                    Update Profile
                                </span>
                            </Link>
                        </button>
                    </div>
                </div>
            </MaxWidthWrapper>
        </div>
    )
}

export default Page
