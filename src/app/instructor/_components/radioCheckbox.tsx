'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { api } from '@/utils/axios.config'
import { usePathname } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronDown } from 'lucide-react'
import axios, { AxiosError } from 'axios'

export interface RadioCheckboxProps {
    fetchSessions: (data: any) => void
    offset: number
    position: any
    setTotalSessions: any
    setPages: any
    setLastPage: any
    debouncedSearch?: string
}

interface Option {
    label: string
    value: string
}

const RadioCheckbox: React.FC<RadioCheckboxProps> = ({
    fetchSessions,
    offset,
    position,
    setTotalSessions,
    setPages,
    setLastPage,
    debouncedSearch,
}: RadioCheckboxProps) => {
    const [batches, setBatches] = useState<any[]>([])
    const [batchId, setBatchId] = useState<any[]>([])
    const [timeFrame, setTimeFrame] = useState<string>('all')
    const [weeks, setWeeks] = useState<number>(0)
    const pathname = usePathname()
    const classRecordings = pathname?.includes('/recording')
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([])

    console.log('debouncedSearch before API', debouncedSearch)

    const getBatches = useCallback(async () => {
        try {
            const response = await api.get(`/instructor/batchOfInstructor`)
            const transformedData = response.data.data.map(
                (item: { batchId: any; batchName: any }) => ({
                    value: item.batchId.toString(),
                    label: item.batchName,
                })
            )
            setSelectedOptions([transformedData[0]])
            setBatchId([transformedData[0]])
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
                let errorMessage = 'An unknown error occurred'
                // Type checking for error
                if (axios.isAxiosError(error)) {
                    // Accessing specific error details from AxiosError
                    errorMessage =
                        error.response?.data?.message || error.message
                } else if (error instanceof Error) {
                    errorMessage = error.message
                }
                toast({
                    title: 'Error fetching Classes:',
                    description: errorMessage,
                    // 'There is an error fetching classes: contact Admin.',
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
                console.log('debouncedSearch in Try', debouncedSearch)
                console.log('It is in Try')
                let ids = ''
                batchId.map((item) => (ids += '&batchId=' + item.value))
                // const response = await api.get(
                //     `/instructor/getAllCompletedClasses?limit=${position}&offset=${offset}&weeks=${weeks}${ids}`
                // )
                let baseUrl = `/instructor/getAllCompletedClasses?limit=${position}&offset=${offset}&weeks=${weeks}${ids}`
                if (debouncedSearch) {
                    baseUrl += `&searchTitle=${encodeURIComponent(
                        debouncedSearch
                    )}`
                }
                console.log('debouncedSearch', debouncedSearch)
                console.log('baseUrl', baseUrl)
                const response = await api.get(baseUrl)
                console.log(
                    'response.data.data.classDetails',
                    response.data.data.classDetails
                )
                fetchSessions(response.data.data.classDetails)
                setTotalSessions(response.data.data.totalCompletedClass)
                setPages(response.data.data.totalPages)
                setLastPage(response.data.data.totalPages)
            } catch (error) {
                let errorMessage = 'An unknown error occurred'
                // Type checking for error
                if (axios.isAxiosError(error)) {
                    // Accessing specific error details from AxiosError
                    errorMessage =
                        error.response?.data?.message || error.message
                } else if (error instanceof Error) {
                    errorMessage = error.message
                }

                console.log('Error fetching Class Recordings:', errorMessage)
                toast({
                    title: 'Error:',
                    description: errorMessage,
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
            }
        },
        [batchId, weeks, debouncedSearch]
    )

    useEffect(() => {
        getBatches()
    }, [getBatches])

    useEffect(() => {
        console.log('It is')
        console.log('offset', offset)
        if (batchId) {
            if (classRecordings) {
                console.log('It is going inside')
                getSessionsRecording(offset)
            } else {
                getSessions(offset)
            }
        }
    }, [batchId, timeFrame, weeks, offset, debouncedSearch])

    const handleOptionClick = (option: Option) => {
        if (
            selectedOptions.some((selected) => selected.value === option.value)
        ) {
            setSelectedOptions((prev) =>
                prev.filter((selected) => selected.value !== option.value)
            )
            setBatchId((prev) =>
                prev.filter((selected) => selected.value !== option.value)
            )
        } else {
            setSelectedOptions((prev) => [...prev, option])
            setBatchId((prev) => [...prev, option])
        }
    }

    const selectedCount = selectedOptions.length

    console.log('batchId', batchId)
    console.log('selectedOptions', selectedOptions)

    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 w-full lg:w-1/2 gap-y-6 lg:gap-y-0">
            {batches && (
                <div className="flex flex-col gap-y-3 items-start w-full lg:w-[350px]">
                    <h1 className="font-semibold">Batches</h1>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="flex w-full items-center justify-between rounded-md border border-secondary px-4 py-2 text-left focus:outline-none">
                                <span className="truncate text-secondary">
                                    {selectedCount > 0
                                        ? `${selectedCount} selected`
                                        : 'Select options'}
                                </span>
                                <ChevronDown className="ml-2 h-5 w-5 text-secondary" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full lg:w-[350px] p-4 border border-secondary text-secondary">
                            <div className="space-y-2">
                                {batches.map((option) => (
                                    <div
                                        key={option.value}
                                        className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer rounded-md"
                                        onClick={() =>
                                            handleOptionClick(option)
                                        }
                                    >
                                        <span>{option.label}</span>
                                        {selectedOptions.some(
                                            (selected) =>
                                                selected.value === option.value
                                        ) && (
                                            <Check className="h-5 w-5 text-secondary" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
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
                                        ? setWeeks(0)
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
                                        ? setWeeks(1)
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
                                        ? setWeeks(2)
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
