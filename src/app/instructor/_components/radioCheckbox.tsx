'use client'

import React, { useState, useEffect, useCallback } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { api } from '@/utils/axios.config'
import { getCourseData, setStoreBatchValue } from '@/store/store'

import { ComboboxStudent } from '@/app/admin/courses/[courseId]/(courseTabs)/students/components/comboboxStudentDataTable'
import { Combobox } from '@/components/ui/combobox'

export interface RadioCheckboxProps {
    fetchSessions: (data: any) => void
    offset: number
    position: any
    setTotalSessions: any
    setPages: any
    setLastPage: any
}

const RadioCheckbox: React.FC<RadioCheckboxProps> = ({
    fetchSessions,
    offset,
    position,
    setTotalSessions,
    setPages,
    setLastPage,
}: RadioCheckboxProps) => {
    const [batches, setBatches] = useState<any[]>([])
    const [batchId, setBatchId] = useState<any>()
    const [timeFrame, setTimeFrame] = useState<string>('all')
    const { setbatchValueData } = setStoreBatchValue()

    const handleComboboxChange = (value: string) => {
        setBatchId(value)
        setbatchValueData(value)
    }

    const getBatches = useCallback(async () => {
        try {
            const response = await api.get(`/instructor/batchOfInstructor`)
            console.log('response', response.data.data)
            const transformedData = response.data.data.map(
                (item: { batchId: any; batchName: any }) => ({
                    value: item.batchId.toString(),
                    label: item.batchName,
                })
            )
            setBatchId(response.data.data[0].batchId)
            setBatches(transformedData)
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }, [])

    const getSessions = useCallback(
        async (offset: number) => {
            try {
                const response = await api.get(
                    `/instructor/getAllUpcomingClasses?limit=${position}&offset=${offset}&timeFrame=${timeFrame}&batchId=${batchId}`
                )
                console.log('response', response.data.data)
                fetchSessions(response.data.data.responses)
                setTotalSessions(response.data.data.totalUpcomingClasses)
                setPages(response.data.data.totalUpcomingPages)
                setLastPage(response.data.data.totalUpcomingPages)
            } catch (error) {
                console.error('Error fetching courses:', error)
            }
        },
        [batchId, timeFrame]
    )

    useEffect(() => {
        getBatches()
    }, [getBatches])

    useEffect(() => {
        if (batchId) getSessions(offset)
    }, [batchId, timeFrame, offset])

    console.log('timeFrame', timeFrame)

    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 w-full lg:w-1/2 gap-y-6 lg:gap-y-0">
            {batches && (
                <div className="flex flex-col gap-y-3 items-start w-full lg:w-auto">
                    <h1 className="font-semibold">Batches</h1>
                    <Combobox
                        data={batches}
                        title={'Batch'}
                        onChange={handleComboboxChange}
                        batch={batches.length > 0}
                        batchChangeData={batches[0]}
                    />
                </div>
            )}
            <div className="flex flex-col gap-y-3 items-start w-full lg:w-auto lg:ml-6">
                <h1 className="font-semibold">Time Period</h1>
                <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 lg:space-x-2 mt-2">
                    <RadioGroup
                        className="flex flex-col lg:flex-row items-start lg:items-center"
                        defaultValue="comfortable"
                    >
                        <div className="flex space-x-2">
                            <RadioGroupItem
                                value="comfortable"
                                id="r1"
                                onClick={() => setTimeFrame('all')}
                            />
                            <Label htmlFor="r1">All Time</Label>
                        </div>
                        <div className="flex space-x-2">
                            <RadioGroupItem
                                value="default"
                                id="r2"
                                onClick={() => setTimeFrame('1 week')}
                            />
                            <Label htmlFor="r2">1 Week</Label>
                        </div>
                        <div className="flex  space-x-2">
                            <RadioGroupItem
                                value="compact"
                                id="r3"
                                onClick={() => setTimeFrame('2 week')}
                            />
                            <Label htmlFor="r3">2 Weeks</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
        </div>
    )
}

export default RadioCheckbox
