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
}

const RadioCheckbox: React.FC<RadioCheckboxProps> = ({
    fetchSessions,
}: RadioCheckboxProps) => {
    // let batches = true
    const [batches, setBatches] = useState<any[]>([])
    const [batchId, setBatchId] = useState<any>()
    const [timeFrame, setTimeFrame] = useState<string>('all')
    const { setbatchValueData } = setStoreBatchValue()

    const handleComboboxChange = (value: string) => {
        setBatchId(value)
        setbatchValueData(value)
    }

    console.log('batchId', batchId)
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
            // setbatchValueData(transformedData[0])
            console.log('transformedData[0]', transformedData[0])
            console.log('transformedData', transformedData)
            setBatches(transformedData)
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }, [])

    const getSessions = useCallback(async () => {
        try {
            const response = await api.get(
                `/instructor/getAllUpcomingClasses?limit=10&offset=0&timeFrame=${timeFrame}&batchId=${batchId}`
            )
            console.log('response', response.data.data.responses)
            fetchSessions(response.data.data.responses)
            // const transformedData = response.data.data.map(
            //     (item: { batchId: any; batchName: any }) => ({
            //         value: item.batchId.toString(),
            //         label: item.batchName,
            //     })
            // )
            // setBatchId(response.data.data[0].batchId)
            // // setbatchValueData(transformedData[0])
            // console.log('transformedData[0]', transformedData[0])
            // console.log('transformedData', transformedData)
            // setBatches(transformedData)
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }, [batchId, timeFrame])

    useEffect(() => {
        getBatches()
    }, [getBatches])

    useEffect(() => {
        getSessions()
    }, [batchId, timeFrame])

    console.log('timeFrame', timeFrame)

    return (
        <div className="flex items-center justify-between p-3 w-1/2">
            {batches && (
                <div className=" flex  flex-col gap-y-3 items-start">
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
            <div className="flex  flex-col gap-y-3 items-start">
                <h1 className="font-semibold">Time Period</h1>
                <div className="flex items-center space-x-2">
                    <RadioGroup
                        className="flex items-center "
                        defaultValue="comfortable"
                    >
                        <div className="flex  space-x-2">
                            <RadioGroupItem
                                value="comfortable"
                                id="r1"
                                onClick={() => setTimeFrame('all')}
                            />
                            <Label htmlFor="r1">All Time</Label>
                        </div>
                        <div className="flex  space-x-2">
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
