'use client'

import React, { useEffect, useState, useCallback } from 'react'
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
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Plus, X, CalendarIcon } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

type FormSectionProps = {
    index: any
    addQuestion: any
    // fetchChapterContent: (chapterId: number) => void
    form: any
    section: any
    setSection: any
}

const FormSection: React.FC<FormSectionProps> = ({
    index,
    form,
    addQuestion,
    section,
    setSection,
}) => {
    const [selectedSected, setSelectedSection] = useState('Multiple Choice')
    const [radioOptions, setRadioOptions] = useState(['1'])
    const [checkboxOptions, setCheckboxOptions] = useState(['1'])

    // {
    //     type: '',
    //     question: '',
    //     options if type is 'Multiple Choice' or 'Checkboxes',
    //     empty fields if type is rest
    // }

    // const list = [
    //     {
    //         type: 'Multiple Choice',
    //         question: 'Question 1',
    //         options: ['Op1', 'Op2', 'Op3'],
    //         textField: true,
    //     },
    // ]

    // get the section with the index to add rest of the things
    // and the slice the section to add the new object section and set is to setSection

    const sectionType = [
        'Multiple Choice',
        'Checkboxes',
        'Long Text Answer',
        'Date',
        'Time',
    ]
    // const options =
    const handleSectionType = (type: string) => {
        // console.log('index in handleSectionType', index)
        // console.log('typeeee', type)
        // console.log('section in handleSectionType', section)
        const obj = section[index]
        // console.log('obj', obj)
        obj.type = type
        if (type === 'Multiple Choice' || type === 'Checkboxes') {
            obj.options = ['1']
            setRadioOptions(['1'])
            setCheckboxOptions(['1'])
        } else {
            obj.options = []
            setRadioOptions([])
            setCheckboxOptions([])
        }
        section.splice(index, 1, obj)
        setSection(section)
        setSelectedSection(type)
    }

    console.log('section outside', section)

    const addRadioOption = () => {
        const addOption = radioOptions.length + 1
        setRadioOptions([...radioOptions, addOption.toString()])
        const obj = section[index]
        obj.options = [...radioOptions, addOption.toString()]
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
        const addOption = checkboxOptions.length + 1
        setCheckboxOptions([...checkboxOptions, addOption.toString()])
        console.log('section in addCheckboxOption', section)
        const obj = section[index]
        console.log('obj', obj)
        obj.options = [...checkboxOptions, addOption.toString()]
        console.log('Edited obj', obj)
        section.splice(index, 1, obj)
        console.log('section after added CheckboxOption')
        setSection(section)
    }

    const removeCheckOption = (idx: number) => {
        // console.log('Radiooooooo')
        // const removeOption =
        checkboxOptions.splice(idx, 1)
        // console.log('checkboxOptions', checkboxOptions)
        setCheckboxOptions(checkboxOptions)
        console.log('section in removeCheckOption', section)
        const obj = section[index]
        console.log('obj', obj)
        obj.options = checkboxOptions
        console.log('Edited obj', obj)
        section.splice(index, 1, obj)
        console.log('section after removeCheckOption')
        setSection(section)
    }

    console.log('radioOptions', radioOptions)
    return (
        <div>
            <Select
                onValueChange={(e) => {
                    handleSectionType(e)
                }}
            >
                <SelectTrigger className="w-[175px] focus:ring-0 mb-3">
                    <SelectValue placeholder={selectedSected} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {sectionType.map((section: any) => (
                            <SelectItem key={section} value={section}>
                                {section}
                                {/* <p className="text-lg">{section}</p> */}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <FormField
                control={form.control}
                name={`Question ${index + 1}`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="flex text-left text-md font-semibold mb-1">
                            Question {index + 1}
                        </FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                className="w-[450px] px-3 py-2 border rounded-md "
                                placeholder="Placeholder"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {selectedSected === 'Multiple Choice' &&
                radioOptions.map((item, index) => (
                    <RadioGroup
                        key={item}
                        // value={selectedOption}
                        // onValueChange={handleStudentUploadType}
                    >
                        <div className="flex space-x-2 mr-4 mt-1">
                            <RadioGroupItem
                                value={item}
                                id={item}
                                className="mt-5"
                            />
                            <Input
                                placeholder={`Field ${item}`}
                                className="w-[450px] px-3 py-2 border rounded-md "
                            />

                            {/* <X
                                className="h-4 w-4 mt-5 hover:cursor-pointer"
                                onClick={() => removeRadioOption(index)}
                            /> */}
                            <button onClick={() => removeRadioOption(index)}>
                                <X className="h-5 w-5 ml-3 mt-2 text-muted-foreground" />
                            </button>
                            {/* <Button
                                variant={'secondary'}
                                type="button"
                                onClick={() => removeRadioOption(index)}
                                className="gap-x-2 border-none hover:text-secondary hover:bg-popover"
                            >
                                <X className="h-5 w-5 ml-3 mt-2 hover:cursor-pointer" />
                            </Button> */}
                            {/* <FormField
                control={form.control}
                name={`Question ${index}`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="flex text-left text-md font-semibold mb-1">
                            Question {index}
                        </FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                className="w-[450px] px-3 py-2 border rounded-md "
                                placeholder="Placeholder"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            /> */}
                            {/* <Label htmlFor={item}>{item}</Label> */}
                        </div>
                    </RadioGroup>
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
                    name={`Question ${index}`}
                    render={({ field }) => (
                        <FormItem>
                            {/* <FormLabel className="flex text-left text-md font-semibold mb-1">
                            Question {index}
                        </FormLabel> */}
                            <FormControl>
                                <Input
                                    {...field}
                                    className="w-[450px] px-3 py-2 border rounded-md "
                                    placeholder="Placeholder"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {selectedSected === 'Date' && (
                <FormField
                    control={form.control}
                    name={`Question ${index}`}
                    render={({ field }) => (
                        <FormItem>
                            {/* <FormLabel className="flex text-left text-md font-semibold mb-1">
                            Question {index}
                        </FormLabel> */}
                            {/* <FormControl>
                                <Input
                                    {...field}
                                    className="w-[450px] px-3 py-2 border rounded-md "
                                    placeholder="Date Placeholder"
                                />
                            </FormControl>
                            <FormMessage /> */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={'outline'}
                                            className={`w-[230px] pl-3 text-left font-normal ${
                                                !field.value &&
                                                'text-muted-foreground'
                                            }`}
                                        >
                                            {/* {field.value ? (
                                                            format(
                                                                field.value,
                                                                'PPP'
                                                            )
                                                        ) : ( */}
                                            <span>Pick a date</span>
                                            {/* )} */}
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
                                        // disabled={(date) =>
                                        //     date <= addDays(new Date(), -1)
                                        // } // Disable past dates
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </FormItem>
                    )}
                />
            )}

            {selectedSected === 'Time' && (
                <FormField
                    control={form.control}
                    name={`Question ${index}`}
                    render={({ field }) => (
                        <FormItem>
                            {/* <FormLabel className="flex text-left text-md font-semibold mb-1">
                            Question {index}
                        </FormLabel> */}
                            <FormControl>
                                <Input
                                    {...field}
                                    className="w-[450px] px-3 py-2 border rounded-md "
                                    placeholder="Time Placeholder"
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
