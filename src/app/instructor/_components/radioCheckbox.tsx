'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { api } from '@/utils/axios.config'
import { usePathname } from 'next/navigation'
import MultipleSelector from '@/components/ui/multiple-selector'
import { toast } from '@/components/ui/use-toast'

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
    const [batchId, setBatchId] = useState<any[]>([])
    const [timeFrame, setTimeFrame] = useState<any>('all')
    const [selectedBatches, setSelectedBatches] = useState<any[]>([])
    const pathname = usePathname()
    const classRecordings = pathname?.includes('/recording')

    const handleChange = (selected: any) => {
        setSelectedBatches(selected)
        setBatchId(selected)
    }

    const getBatches = useCallback(async () => {
        try {
            const response = await api.get(`/instructor/batchOfInstructor`)
            const transformedData = response.data.data.map(
                (item: { batchId: any; batchName: any }) => ({
                    value: item.batchId.toString(),
                    label: item.batchName,
                })
            )
            setBatchId([transformedData[0]])
            setSelectedBatches([transformedData[0]])
            setBatches(transformedData)
        } catch (error) {
            toast({
                title: 'Error fetching Batches:',
                description:
                    'There is an error fetching batches: contact Admin.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }, [])

    const getSessions = useCallback(
        async (offset: number) => {
            try {
                let ids = ''
                batchId.map((item) => (ids += '&batchId=' + item.value))
                const response = await api.get(
                    `/instructor/getAllUpcomingClasses?limit=${position}&offset=${offset}&timeFrame=${timeFrame}${ids}`
                )
                fetchSessions(response.data.data.responses)
                setTotalSessions(response.data.data.totalUpcomingClasses)
                setPages(response.data.data.totalUpcomingPages)
                setLastPage(response.data.data.totalUpcomingPages)
            } catch (error) {
                toast({
                    title: 'Error fetching Classes:',
                    description:
                        'There is an error fetching classes: contact Admin.',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
            }
        },
        [batchId, timeFrame]
    )

    const getSessionsRecording = useCallback(
        async (offset: number) => {
            try {
                let ids = ''
                batchId.map((item) => (ids += '&batchId=' + item.value))
                const response = await api.get(
                    `/instructor/getAllCompletedClasses?limit=${position}&offset=${offset}&timeFrame=${timeFrame}${ids}`
                )
                fetchSessions(response.data.data.classDetails)
                setTotalSessions(response.data.data.totalCompletedClass)
                setPages(response.data.data.totalPages)
                setLastPage(response.data.data.totalPages)
            } catch (error) {
                toast({
                    title: 'Error fetching Class Recordings:',
                    description:
                        'There is an error fetching class recordings: contact Admin.',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
            }
        },
        [batchId, timeFrame]
    )

    useEffect(() => {
        getBatches()
    }, [getBatches])

    useEffect(() => {
        if (batchId) {
            if (classRecordings) {
                getSessionsRecording(offset)
            } else {
                getSessions(offset)
            }
        }
    }, [batchId, timeFrame, offset])

    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 w-full lg:w-1/2 gap-y-6 lg:gap-y-0">
            {batches && (
                <div className="flex flex-col gap-y-3 items-start w-full lg:w-[350px]">
                    <h1 className="font-semibold">Batches</h1>
                    <MultipleSelector
                        options={batches}
                        value={selectedBatches}
                        onChange={handleChange}
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
                                onClick={() =>
                                    classRecordings
                                        ? setTimeFrame(0)
                                        : setTimeFrame('all')
                                }
                            />
                            <Label htmlFor="r1">All Time</Label>
                        </div>
                        <div className="flex space-x-2">
                            <RadioGroupItem
                                value="default"
                                id="r2"
                                onClick={() =>
                                    classRecordings
                                        ? setTimeFrame(1)
                                        : setTimeFrame('1 week')
                                }
                            />
                            <Label htmlFor="r2">1 Week</Label>
                        </div>
                        <div className="flex  space-x-2">
                            <RadioGroupItem
                                value="compact"
                                id="r3"
                                onClick={() =>
                                    classRecordings
                                        ? setTimeFrame(2)
                                        : setTimeFrame('2 week')
                                }
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
