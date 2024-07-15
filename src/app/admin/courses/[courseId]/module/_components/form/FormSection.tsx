'use client'

// React and third-party libraries
import React, { useEffect, useState, useCallback } from 'react'
import { Plus, X, CalendarIcon } from 'lucide-react'

// Internal imports
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Calendar } from '@/components/ui/calendar'
import { Switch } from '@/components/ui/switch'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

type FormSectionProps = {
    key: any
    item: any
    index: any
    addQuestion: any
    // deleteQuestion: () => void
    form: any
    section: any
    setSection: any
    deleteQuestion: any
}

const FormSection: React.FC<FormSectionProps> = ({
    key,
    item,
    index,
    form,
    addQuestion,
    section,
    setSection,
    deleteQuestion,
}) => {
    const [selectedSected, setSelectedSection] = useState('Multiple Choice')
    const [radioOptions, setRadioOptions] = useState([''])
    const [checkboxOptions, setCheckboxOptions] = useState([''])

    // get the section with the index to add rest of the things
    // and the slice the section to add the new object section and set is to setSection

    const sectionType = [
        { questionType: 'Multiple Choice', typeId: 1 },
        { questionType: 'Checkboxes', typeId: 2 },
        { questionType: 'Long Text Answer', typeId: 3 },
        { questionType: 'Date', typeId: 4 },
        { questionType: 'Time', typeId: 5 },
        // 'Checkboxes',
        // 'Long Text Answer',
        // 'Date',
        // 'Time',
    ]
    const handleSectionType = (type: string) => {
        console.log('type', type)
        const questionTypeId = sectionType.find(
            (item) => item.questionType === type
        )
        console.log('questionTypeId', questionTypeId)
        const obj = section[index]
        obj.questionType = type
        obj.typeId = questionTypeId?.typeId
        if (type === 'Multiple Choice' || type === 'Checkboxes') {
            obj.options = ['']
            setRadioOptions([''])
            setCheckboxOptions([''])
        } else {
            obj.options = []
            setRadioOptions([])
            setCheckboxOptions([])
        }
        section.splice(index, 1, obj)
        setSection(section)
        setSelectedSection(type)
    }

    const handleRequiredQuestion = (index: number) => {
        const newSection = [...section]
        newSection[index] = {
            ...newSection[index],
            required: !newSection[index].required,
        }
        setSection(newSection)
    }

    // console.log('section outside', section)

    const onChangeHandler = (e: any) => {
        const obj = section[index]
        obj.question = e.target.value
        section.splice(index, 1, obj)
        setSection(section)
    }

    const addOptions = (e: any, idx: number) => {
        const obj = section[index]

        if (obj.questionType === 'Multiple Choice') {
            const newRadioOptions = [...radioOptions]
            newRadioOptions[idx] = e.target.value
            obj.options = newRadioOptions
            setRadioOptions(newRadioOptions)
        } else {
            const newCheckboxOptions = [...checkboxOptions]
            newCheckboxOptions[idx] = e.target.value
            obj.options = newCheckboxOptions
            setCheckboxOptions(newCheckboxOptions)
        }
        section.splice(index, 1, obj)
        setSection(section)
    }

    const addRadioOption = () => {
        setRadioOptions([...radioOptions, ''])
        const obj = section[index]
        obj.options = [...radioOptions, '']
        section.splice(index, 1, obj)
        setSection(section)
    }

    const removeRadioOption = (idx: number) => {
        radioOptions.splice(idx, 1)
        setRadioOptions(radioOptions)
        const obj = section[index]
        obj.options = radioOptions
        section.splice(index, 1, obj)
        setSection(section)
    }

    const addCheckboxOption = () => {
        setCheckboxOptions([...checkboxOptions, ''])
        const obj = section[index]
        obj.options = [...checkboxOptions, '']
        section.splice(index, 1, obj)
        setSection(section)
    }

    const removeCheckOption = (idx: number) => {
        checkboxOptions.splice(idx, 1)
        setCheckboxOptions(checkboxOptions)
        const obj = section[index]
        obj.options = checkboxOptions
        section.splice(index, 1, obj)
        setSection(section)
    }

    // const deleteQuestion = useCallback(
    //     (key: number) => {
    //         console.log('section', section)
    //         const updatedSection = section.filter(
    //             (item: any) => item.key !== key
    //         )
    //         console.log('updatedSection', updatedSection)
    //         setSection(updatedSection)
    //     },
    //     [section]
    // )

    return (
        <div key={key}>
            <Select
                onValueChange={(e) => {
                    handleSectionType(e)
                }}
            >
                <div className="flex flex-row justify-between">
                    <div className="mt-5">
                        <SelectTrigger className="w-[175px] focus:ring-0 mb-3">
                            <SelectValue placeholder={selectedSected} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {sectionType.map((section: any) => (
                                    <SelectItem
                                        key={section.questionType}
                                        value={section.questionType}
                                    >
                                        {section.questionType}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </div>
                    {/* <button onClick={() => deleteQuestion(index)}> */}
                    <button
                        type="button" // Set the type to button to prevent form submission
                        onClick={(e) => {
                            e.preventDefault() // Prevent form submission
                            deleteQuestion(item.key)
                            // deleteQuestion(index)
                        }}
                    >
                        <X className="h-5 w-5 ml-3 mt-2 text-muted-foreground" />
                    </button>
                </div>
            </Select>

            <FormField
                control={form.control}
                name={`Question ${index + 1}`}
                render={({ field }) => (
                    <FormItem>
                        <div className="flex flex-row justify-between">
                            <FormLabel className="flex text-left text-md font-semibold mb-1">
                                Question {index + 1}
                            </FormLabel>
                            <Switch
                                checked={section[index].required}
                                onClick={() => handleRequiredQuestion(index)}
                                // className="m-1 w-[50px]" // Adjust height as needed
                            />
                        </div>
                        <FormControl>
                            <Input
                                {...field}
                                className="w-full px-3 py-2 border rounded-md "
                                placeholder="Type a question..."
                                onChange={(e) => {
                                    onChangeHandler(e)
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {selectedSected === 'Multiple Choice' &&
                radioOptions.map((item, index) => (
                    <div className="flex space-x-2 mr-4 mt-1">
                        <RadioGroup
                            key={item}
                            // value={selectedOption}
                            // onValueChange={handleStudentUploadType}
                        >
                            <RadioGroupItem
                                value={item}
                                id={item}
                                className="mt-5"
                            />
                        </RadioGroup>
                        <Input
                            placeholder={`Field ${item}`}
                            className="w-full px-3 py-2 border rounded-md"
                            onChange={(e) => {
                                addOptions(e, index)
                            }}
                            value={item}
                        />
                        <button onClick={() => removeRadioOption(index)}>
                            <X className="h-5 w-5 ml-3 mt-2 text-muted-foreground" />
                        </button>
                    </div>
                ))}

            {selectedSected === 'Multiple Choice' && (
                <div className="flex justify-end">
                    <Button
                        variant={'secondary'}
                        type="button"
                        onClick={addRadioOption}
                        className="gap-x-2 border-none hover:text-secondary hover:bg-popover"
                    >
                        <Plus /> Add Option
                    </Button>
                </div>
            )}

            {selectedSected === 'Checkboxes' &&
                checkboxOptions.map((item, index) => (
                    <div className="flex space-x-2 mt-1">
                        <Checkbox
                            // checked={
                            //     table.getIsAllPageRowsSelected() ||
                            //     (table.getIsSomePageRowsSelected() && 'indeterminate')
                            // }
                            // onCheckedChange={(value) =>
                            //     table.toggleAllPageRowsSelected(!!value)
                            // }
                            aria-label="Select all"
                            className="translate-y-[2px] mr-1 mt-4"
                        />
                        <div>
                            <Input
                                placeholder={`Field ${item}`}
                                className="w-[450px] px-3 py-2 border rounded-md "
                                onChange={(e) => {
                                    addOptions(e, index)
                                }}
                                value={item}
                            />
                        </div>
                        <button onClick={() => removeCheckOption(index)}>
                            <X className="h-5 w-5 ml-3 mt-2 text-muted-foreground" />
                        </button>
                    </div>
                ))}
            {selectedSected === 'Checkboxes' && (
                <div className="flex justify-end">
                    <Button
                        variant={'secondary'}
                        type="button"
                        onClick={addCheckboxOption}
                        className="gap-x-2 border-none hover:text-secondary hover:bg-popover"
                    >
                        <Plus /> Add Option
                    </Button>
                </div>
            )}

            {selectedSected === 'Long Text Answer' && (
                <FormField
                    control={form.control}
                    name={`answer ${index}`}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    // {...field}
                                    className="w-[450px] px-3 py-2 border rounded-md "
                                    placeholder="Placeholder"
                                    disabled
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {selectedSected === 'Date' && (
                <div className="flex justify-start mt-2">
                    <FormField
                        control={form.control}
                        name={`Question ${index}`}
                        render={({ field }) => (
                            <FormItem>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={`w-[230px] pl-3 text-left font-normal ${
                                                    !field.value &&
                                                    'text-muted-foreground'
                                                }`}
                                                disabled
                                            >
                                                <span>Pick a date</span>
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {selectedSected === 'Time' && (
                <FormField
                    control={form.control}
                    name={`Question ${index}`}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    {...field}
                                    className="w-[100px] px-3 py-2 border rounded-md "
                                    placeholder="Time Placeholder"
                                    type="time"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </div>
    )
}

export default FormSection
