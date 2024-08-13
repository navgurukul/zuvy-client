'use client'

import React, { useState, useEffect, useCallback } from 'react'
import CurricullumCard from '../_components/curricullumCard'
import { api } from '@/utils/axios.config'

const Curricullum = () => {
    const [allCourses, setAllCourses] = useState<any[]>([])

    const getAllCourses = useCallback(async () => {
        try {
            const response = await api.get(`Content/allModules/117`)
            console.log('response', response.data)
            setAllCourses(response.data)
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }, [])

    useEffect(() => {
        getAllCourses()
    }, [getAllCourses])

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="items-start w-1/2">
                <h1 className="font-semibold text-xl text-start mb-2 ">
                    Courses Modules
                </h1>
            </div>

            {allCourses.map((item) => (
                <div key={item.id} className="w-1/2">
                    <div
                        className={`${
                            item.typeId === 2 ? 'bg-yellow/50' : 'bg-muted'
                        } my-3 p-3  flex rounded-xl`}
                    >
                        <CurricullumCard key={item} course={item} />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Curricullum
