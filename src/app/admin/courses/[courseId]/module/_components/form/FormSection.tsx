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
import { Clock } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { ellipsis } from '@/lib/utils'

type FormSectionProps = {
    item: any
    index: any
    form: any
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
    item,
    index,
    form,
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

    // get the section with the index to add rest of the things
    // and the slice the section to add the new object section and set is to setSection

    const sectionType: { questionType: string; typeId: number }[] = [
        { questionType: 'Multiple Choice', typeId: 1 },
        { questionType: 'Checkboxes', typeId: 2 },
        { questionType: 'Long Text Answer', typeId: 3 },
        { questionType: 'Date', typeId: 4 },
        { questionType: 'Time', typeId: 5 },
    ]

    // *************** This one is working... Left one empty input field when delete multiple choice *************

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

            const optionsArray = Object.values(questionData.options || {})
            optionsArray.forEach((value, optionIndex) => {
                form.setValue(`option_${index}_${optionIndex}`, value || '')
            })
            // }else {
            //     // Set default values for new questions
            //     form.setValue(`question_${index}`, '')
            //     form.setValue(`questionType_${index}`, 'Multiple Choice')
            //     form.setValue(`option_${index}_0`, '')
        }
    }, [questionData, index, form])

    // *******************************************************************************

    const { setValue, watch } = form

    const handleSectionType = (questionType: string, index: number) => {
        const selectedType = sectionType.find(
            (section) => section.questionType === questionType
        )
        if (selectedType) {
            setValue(`questions.${index}.typeId`, selectedType.typeId)
        }
    }

    const handleOptionChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        optionIndex: number
    ) => {
        const newValue = e.target.value
        const newOptions = [...options]
        newOptions[optionIndex] = newValue
        setOptions(newOptions)
        form.setValue(`questions.${index}.options.${optionIndex}`, newValue)
    }

    const addOption = () => {
        setOptions([...options, ''])
    }

    const removeOption = (idx: number) => {
        // Remove the option from the state
        setOptions((prevOptions) => {
            const updatedOptions = prevOptions.filter(
                (_, optionIndex) => optionIndex !== idx
            )

            // Update form values accordingly
            updatedOptions.forEach((option, optionIndex) => {
                form.setValue(
                    `questions.${index}.options.${optionIndex}`,
                    option
                )
            })

            // Remove any leftover options from the form values
            form.unregister(
                `questions.${index}.options.${updatedOptions.length}`
            )

            return updatedOptions
        })
    }

    // I DON'T THINK THIS IS NEEDED
    useEffect(() => {
        // Reset options when the question type changes
        if (
            selectedSection !== 'Multiple Choice' &&
            selectedSection !== 'Checkboxes'
        ) {
            setOptions([])
            form.setValue(`questions.${index}.options`, [])
        } else if (
            selectedSection === 'Multiple Choice' ||
            selectedSection === 'Checkboxes'
        ) {
            // Ensure options exist when the type is Multiple Choice or Checkboxes
            if (options.length === 0) {
                setOptions([''])
            }
        }
    }, [selectedSection, index, form, questionData])

    return (
        <div>
            <Select
                onValueChange={(e) => {
                    handleSectionType(e, index)
                }}
            >
                <div className="flex flex-row justify-between">
                    <div className="mt-5">
                        <SelectTrigger
                            className="w-[175px] focus:ring-0 mb-3"
                            disabled={!questionData.questionType}
                        >
                            <SelectValue
                                placeholder={getQuestionType(item.typeId)}
                            />
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
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault()
                            deleteQuestion(item.id)
                            // deleteQuestion(index)
                        }}
                    >
                        <X className="h-5 w-5 ml-3 mt-2 text-muted-foreground" />
                    </button>
                </div>
            </Select>

            <FormField
                control={form.control}
                name={`questions.${index}.question`}
                render={({ field }) => (
                    <FormItem>
                        <div className="flex flex-row justify-between">
                            <FormLabel className="flex text-left text-sm text-gray-600 font-semibold mb-1">
                                Question {index + 1}
                            </FormLabel>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div>
                                            <FormField
                                                control={form.control}
                                                name={`questions.${index}.isRequired`}
                                                render={({ field }) => (
                                                    <Switch
                                                        // checked={field.value}
                                                        checked={
                                                            questionData.isRequired
                                                        }
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                    />
                                                )}
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="font-semibold">
                                        Make the question as required by turning
                                        it on
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <FormControl>
                            <Input
                                {...field}
                                placeholder="Type a question..."
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {(questionData.typeId === 1 || questionData.typeId === 2) &&
                options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex space-x-2 mr-4 mt-1">
                        {questionData.typeId === 1 ? (
                            <RadioGroup>
                                <RadioGroupItem
                                    value={option}
                                    className="mt-5"
                                    disabled={true}
                                />
                            </RadioGroup>
                        ) : (
                            <Checkbox className="mt-5" disabled={true} />
                        )}
                        <FormField
                            control={form.control}
                            name={`questions.${index}.options.${optionIndex}`}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    // value={field.value || ''}
                                    value={options[optionIndex]}
                                    placeholder={`Option ${optionIndex + 1}`}
                                    onChange={(e) => {
                                        field.onChange(e)
                                        handleOptionChange(e, optionIndex)
                                    }}
                                />
                            )}
                        />
                        {options.length > 2 && (
                            <button
                                type="button"
                                onClick={() => removeOption(optionIndex)}
                            >
                                <X className="h-5 w-5 ml-3 mt-2 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                ))}

            {(questionData.typeId === 1 || questionData.typeId === 2) && (
                <div className="flex justify-end">
                    <Button
                        variant={'secondary'}
                        type="button"
                        onClick={addOption}
                        className="gap-x-2 border-none text-[rgb(81,134,114)] hover:text-[rgb(81,134,114)] hover:bg-popover"
                    >
                        <Plus /> Add Option
                    </Button>
                </div>
            )}

            {questionData.typeId === 3 && (
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

            {questionData.typeId === 4 && (
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

            {questionData.typeId === 5 && (
                <FormField
                    control={form.control}
                    name={`Question ${index}`}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="relative flex items-center">
                                    <Input
                                        {...field}
                                        className="w-[100px] px-3 py-2 border rounded-md "
                                        placeholder="Time Placeholder"
                                        type="time"
                                        disabled={true}
                                    />
                                    <Clock className="absolute left-[55px] mt-2 h-5 w-5 text-gray-400" />
                                </div>
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
