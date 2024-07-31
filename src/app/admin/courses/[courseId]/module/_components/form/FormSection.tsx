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
    formData: any
}

const getQuestionType = (typeId: number) => {
    switch (typeId) {
        case 1:
            return 'Multiple Choice'
        case 2:
            return 'Checkboxes'
        case 3:
            return 'Long Text Answer'
        case 4:
            return 'Date'
        case 5:
            return 'Time'
        default:
            return 'Multiple Choice'
    }
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
    formData,
}) => {
    const questionData = formData[index] || {}
    const [selectedSection, setSelectedSection] = useState(
        getQuestionType(questionData.typeId || 1)
    )
    const [options, setOptions] = useState<string[]>(
        Object.values(questionData.options || {}).length > 0
            ? Object.values(questionData.options || {})
            : ['']
    )

    // console.log('item', item)

    // get the section with the index to add rest of the things
    // and the slice the section to add the new object section and set is to setSection

    const sectionType = [
        { questionType: 'Multiple Choice', typeId: 1 },
        { questionType: 'Checkboxes', typeId: 2 },
        { questionType: 'Long Text Answer', typeId: 3 },
        { questionType: 'Date', typeId: 4 },
        { questionType: 'Time', typeId: 5 },
    ]

    useEffect(() => {
        if (questionData && Object.keys(questionData).length > 0) {
            setSelectedSection(getQuestionType(questionData.typeId))
            setOptions(Object.values(questionData.options || {}))

            // Set form values
            form.setValue(`question_${index}`, questionData.question || '')
            form.setValue(
                `questionType_${index}`,
                getQuestionType(questionData.typeId)
            )

            Object.entries(questionData.options || {}).forEach(
                ([key, value]) => {
                    form.setValue(`option_${index}_${key}`, value)
                }
            )
        }
    }, [questionData, index, form])

    const handleSectionType = (type: string) => {
        setSelectedSection(type)
        form.setValue(`questionType_${index}`, type)

        setSection((prevSection: any) => {
            const newSection = [...prevSection]
            newSection[index] = {
                ...newSection[index],
                questionType: type,
                typeId: sectionType.find((item) => item.questionType === type)
                    ?.typeId,
            }
            return newSection
        })

        if (type === 'Multiple Choice' || type === 'Checkboxes') {
            setOptions(options.length ? options : [''])
        } else {
            setOptions([])
        }
    }

    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        form.setValue(`question_${index}`, newValue)
        setSection((prevSection: any) => {
            const newSection = [...prevSection]
            newSection[index] = { ...newSection[index], question: newValue }
            return newSection
        })
    }

    const handleOptionChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        optionIndex: number
    ) => {
        const newValue = e.target.value
        const newOptions = [...options]
        newOptions[optionIndex] = newValue
        setOptions(newOptions)
        // form.setValue(`option_${index}_${optionIndex + 1}`, e.target.value)
        form.setValue(`option_${index}_${optionIndex}`, e.target.value)
        setSection((prevSection: any) => {
            const newSection = [...prevSection]
            newSection[index] = { ...newSection[index], options: newOptions }
            return newSection
        })
    }

    const addOption = () => {
        setOptions([...options, ''])
    }

    const handleRequiredQuestion = (index: number) => {
        const newSection = [...section]
        newSection[index] = {
            ...newSection[index],
            isRequired: !newSection[index].isRequired,
        }
        setSection(newSection)
    }

    const removeOption = (idx: number) => {
        setOptions((prevOptions) => {
            const updatedOptions = prevOptions.filter(
                (_, optionIndex) => optionIndex !== idx
            )

            setSection((prevSections: any) => {
                const updatedSections = [...prevSections]
                updatedSections[index] = {
                    ...updatedSections[index],
                    options: updatedOptions,
                }
                return updatedSections
            })

            return updatedOptions
        })

        // Update form values
        options.forEach((_, optionIndex) => {
            if (optionIndex >= idx) {
                form.setValue(
                    `option_${index}_${optionIndex}`,
                    options[optionIndex + 1] || ''
                )
            }
        })
    }

    // console.log('formData', formData)

    // useEffect(() => {
    //     console.log('Updated section:', section)
    // }, [section])

    // const deleteQuestion = useCallback(
    //     (deleteItem: any) => {
    //         console.log('deleteItem', deleteItem)
    //         const newData = section.filter(
    //             (question: any) => question.key !== deleteItem.key
    //         )
    //         console.log('newData', newData)

    //         setSection(newData)
    //         // setSection((prevOptions: any) => {
    //         //     const updatedOptions = prevOptions.filter(
    //         //         (_: any, optionIndex: any) => optionIndex !== deleteIndex
    //         //     )
    //         //     return updatedOptions
    //         // })
    //     },
    //     [section]
    // )

    // console.log('section', section)

    // useEffect(() => {
    //     console.log('Updated section:', section)
    // }, [section])

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
                            <SelectValue placeholder={selectedSection} />
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
                            deleteQuestion(item)
                            // deleteQuestion(item.key)
                            // deleteQuestion(index)
                        }}
                    >
                        <X className="h-5 w-5 ml-3 mt-2 text-muted-foreground" />
                    </button>
                </div>
            </Select>

            <FormField
                control={form.control}
                name={`question_${index}`}
                render={({ field }) => (
                    <FormItem>
                        <div className="flex flex-row justify-between">
                            <FormLabel className="flex text-left text-md font-semibold mb-1">
                                Question {index + 1}
                            </FormLabel>
                            <Switch
                                checked={section[index].isRequired}
                                onClick={() => handleRequiredQuestion(index)}
                                // className="m-1 w-[50px]" // Adjust height as needed
                            />
                        </div>
                        <FormControl>
                            <Input
                                {...field}
                                placeholder="Type a question..."
                                onChange={handleQuestionChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />

            {(selectedSection === 'Multiple Choice' ||
                selectedSection === 'Checkboxes') &&
                options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex space-x-2 mr-4 mt-1">
                        {selectedSection === 'Multiple Choice' ? (
                            <RadioGroup>
                                <RadioGroupItem
                                    value={option}
                                    className="mt-5"
                                />
                            </RadioGroup>
                        ) : (
                            <Checkbox className="mt-5" />
                        )}
                        <FormField
                            control={form.control}
                            // name={`option_${index}_${optionIndex + 1}`}
                            name={`option_${index}_${optionIndex}`}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder={`Option ${optionIndex + 1}`}
                                    onChange={(e) =>
                                        handleOptionChange(e, optionIndex)
                                    }
                                />
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => removeOption(optionIndex)}
                        >
                            <X className="h-5 w-5 ml-3 mt-2 text-muted-foreground" />
                        </button>
                    </div>
                ))}

            {(selectedSection === 'Multiple Choice' ||
                selectedSection === 'Checkboxes') && (
                <div className="flex justify-end">
                    <Button
                        variant={'secondary'}
                        type="button"
                        onClick={addOption}
                        className="gap-x-2 border-none hover:text-secondary hover:bg-popover"
                    >
                        <Plus /> Add Option
                    </Button>
                </div>
            )}

            {selectedSection === 'Long Text Answer' && (
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

            {selectedSection === 'Date' && (
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

            {selectedSection === 'Time' && (
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
