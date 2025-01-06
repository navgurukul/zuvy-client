import { difficultyColor } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import { useEffect, useRef } from 'react'
import useDebounce from '@/hooks/useDebounce'
import { getEditCodingQuestionDialogs } from '@/store/store'
import { Search } from 'lucide-react'
import { SelectScrollDownButton } from '@radix-ui/react-select'
import { POSITION } from './constant'

export function handleDelete(
    deleteCodingQuestionId: any,
    setCodingQuestions: any,
    filteredCodingQuestions?: any,
    selectedOptions?: any,
    difficulty?: any,
    offset?: number,
    position?: String
) {
    api({
        method: 'delete',
        url: 'Content/deleteCodingQuestion',
        data: {
            questionIds: [deleteCodingQuestionId],
        },
    })
        .then((res) => {
            toast({
                title: 'Success',
                description: res.data.message,
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
            // getAllCodingQuestions(setCodingQuestions)
            filteredCodingQuestions(
                setCodingQuestions,
                offset,
                position,
                difficulty,
                selectedOptions
            )
        })
        .catch((error) => {
            toast({
                title: 'Error',
                description:
                    error.response?.data?.message || 'An error occurred',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        })
}

export function deleteOpenEndedQuestion(
    deleteOpenEndedQuestionId: any,
    setOpenEndedQuestions: any,
    // getAllOpenEndedQuestions?: any,
    filteredOpenEndedQuestions?: any,
    selectedOptions?: any,
    difficulty?: any,
    offset?: number,
    position?: String
) {
    api({
        method: 'delete',
        url: 'Content/deleteOpenEndedQuestion',
        data: {
            questionIds: [deleteOpenEndedQuestionId],
        },
    })
        .then((res) => {
            toast({
                title: 'Success',
                description: res.data.message,
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
            filteredOpenEndedQuestions(
                setOpenEndedQuestions,
                offset,
                position,
                difficulty,
                selectedOptions
            )
        })
        .catch((error) => {
            toast({
                title: 'Error',
                description:
                    error?.response?.data?.message || 'An error occurred',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        })
}

export const handleDeleteModal = (
    setDeleteModalOpen: any,
    setDeleteCodingQuestionId: any,
    codingQuestion: any
) => {
    setDeleteModalOpen(true)
    setDeleteCodingQuestionId(codingQuestion.id)
}

export const handleConfirm = (
    handleDelete: any,
    setDeleteModalOpen: any,
    deleteCodingQuestionId: any,
    filteredCodingQuestions: any,
    setCodingQuestions: any,
    difficulty?: any,
    selectedOptions?: any,
    offset?: number,
    position?: String
) => {
    handleDelete(
        deleteCodingQuestionId,
        setCodingQuestions,
        filteredCodingQuestions,
        difficulty,
        selectedOptions,
        offset,
        position
    )
    setDeleteModalOpen(false)
}

export async function getAllCodingQuestions(setCodingQuestions: any) {
    try {
        const response = await api.get('Content/allCodingQuestions')
        setCodingQuestions(response.data.data)
    } catch (error) {
        console.error(error)
    }
}
export function handleQuizDelete(
    deleteQuizQuestionId: any,
    // getAllQUizQuestions: any,
    filteredQuizQuestions?: any,
    setStoreQuizData?: any,
    selectedOptions?: any,
    difficulty?: any,
    offset?: number,
    position?: string
) {
    api({
        method: 'delete',
        url: 'Content/deleteMainQuizOrVariant',
        data: {
            questionIds: [
                {
                    id: deleteQuizQuestionId,
                    type: 'main',
                },
            ],
        },
    })
        .then((res) => {
            toast({
                title: 'Success',
                description: res.data.message,
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
            // getAllQUizQuestions(getAllQUizQuestions,offset,position,difficulty,selectedOptions)
            filteredQuizQuestions(
                setStoreQuizData,
                offset,
                position,
                difficulty,
                selectedOptions
            )
        })
        .catch((error) => {
            toast({
                title: 'Error',
                description:
                    error.response?.data?.message || 'An error occurred',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        })
}

export const handleDeleteQuizModal = (
    setDeleteModalOpen: any,
    setDeleteQuizQuestionId: any,
    quizQuestion: any
) => {
    setDeleteModalOpen(true)
    setDeleteQuizQuestionId(quizQuestion.id)
}

export const handleQuizConfirm = (
    handleQuizDelete: any,
    setDeleteModalOpen: any,
    deleteQuizQuestionId: any,
    // getAllQuizQuestions: any,
    filteredQuizQuestions: any,
    setQuizQuestions: any,
    difficulty: any,
    selectedOptions: any,
    offset: number,
    position: string
) => {
    handleQuizDelete(
        deleteQuizQuestionId,
        // getAllQuizQuestions,
        filteredQuizQuestions,
        setQuizQuestions,
        difficulty,
        selectedOptions,
        offset,
        position
    )
    setDeleteModalOpen(false)
}

export async function getAllQuizQuestion(
    setQuizQuestion: any,
    difficulty?: any,
    mcqSearch?: string
) {
    try {
        const mcqtagId: any = localStorage.getItem('MCQCurrentTag')
        const MCQCurrentTagId = JSON.parse(mcqtagId)
        let url = `/Content/allQuizQuestions`

        let selectedDiff = ''
        difficulty?.map(
            (item: any) => (selectedDiff += '&difficulty=' + item.value)
        )

        const queryParams: string[] = []

        if (mcqSearch && mcqSearch !== 'None') {
            queryParams.push(`searchTerm=${mcqSearch}`)
        }
        if (MCQCurrentTagId?.id !== undefined && MCQCurrentTagId?.id !== -1) {
            queryParams.push(`tagId=${MCQCurrentTagId.id}`)
        }

        if (difficulty.length > 0) {
            if (difficulty[0].value !== 'None') {
                queryParams.push(selectedDiff.substring(1))
            }
        }

        if (queryParams.length > 0) {
            url += `?${queryParams.join('&')}`
        }

        const response = await api.get(url)
        setQuizQuestion(response.data.data)
    } catch (error) {
        console.error(error)
    }
}

export const getAllOpenEndedQuestions = async (
    setAllOpenEndedQuestions: any
) => {
    try {
        const response = await api.get('/Content/openEndedQuestions')
        setAllOpenEndedQuestions(response.data.data)
    } catch (error) {
        console.error(error)
    }
}

export const handleEditOpenEndedQuestion = (
    openEndedQuestion: any,
    setIsOpenEndDialogOpen: any,
    setEditOpenEndedQuestionId: any
) => {
    setIsOpenEndDialogOpen(true)
    setEditOpenEndedQuestionId(openEndedQuestion.id)
}
export const handleEditCodingQuestion = (
    codingQuestion: any,
    setIsCodingEditDialogOpen: any,
    setEditCodingQuestionId: any,
    setIsQuestionUsed: any
) => {
    setIsCodingEditDialogOpen(true)
    setEditCodingQuestionId(codingQuestion.id)
    if (codingQuestion?.usage) {
        setIsQuestionUsed(true)
    } else {
        setIsQuestionUsed(false)
    }
}
export const handlerQuizQuestions = (
    quizQuestion: any,
    setIsEditModalOpen: any,
    setIsQuizQuestionId: any
) => {
    setIsEditModalOpen(true)
    setIsQuizQuestionId(quizQuestion.id)
}

export async function getAllTags(setTags: any, setOptions?: any) {
    const response = await api.get('Content/allTags')
    if (response) {
        const tagArr = [
            { id: -1, tagName: 'All Topics' },
            ...response.data.allTags,
        ]
        const transformedTags = tagArr.map(
            (item: { id: any; tagName: any }) => ({
                id: item.id,
                tagName: item.tagName,
            })
        )
        const transformedData = tagArr.map(
            (item: { id: any; tagName: any }) => ({
                value: item.id.toString(),
                label: item.tagName,
            })
        )

        setTags(transformedTags)
        setOptions(transformedData)
    }
}

// get tags without filtering:

export async function getAllTagsWithoutFilter(setTags: any) {
    const response = await api.get('Content/allTags')
    if (response) {
        setTags([{ id: -1, tagName: 'All Topics' }, ...response.data.allTags])
    }
}

// --------------------------------------------
// AddAssessment.tsx functions:-
// async (offset: number ,position:any) => {
//     let url = `/allCodingQuestions?limit=${position}&offset=${offset}`
//     if (debouncedSearch) {
//         url = `/allCodingQuestions?limit=${position}&searchTerm=${encodeURIComponent(
//             debouncedSearch
//         )}`
//     }

export async function filteredCodingQuestions(
    // offset: number,
    setFilteredQuestions: (newValue: any[]) => void,
    offset: number,
    position?: string,
    difficulty?: any,
    selectedOptions?: any,
    setTotalCodingQuestion?: any,
    setLastPage?: any,
    setTotalPages?: any,
    // difficulty?: any,
    // selectedOptions?: any,
    debouncedSearch?: string | undefined,
    // position?: any,
    // TotalCodingQuestion?: any,
    selectedLanguage?: string

    // setTotalCodingQuestion: any, // Accepting setTotalBootcamps from parent
) {
    try {
        const safeOffset = Math.max(0, offset)

        let url = `/Content/allCodingQuestions?limit=${position}&offset=${offset}`

        let selectedTagIds = ''
        selectedOptions?.map(
            (item: any) => (selectedTagIds += '&tagId=' + item.value)
        )

        let selectedDiff = ''
        difficulty?.map(
            (item: any) => (selectedDiff += '&difficulty=' + item.value)
        )

        const queryParams = []

        if (selectedTagIds?.length > 0) {
            if (selectedOptions[0].value !== '-1') {
                queryParams.push(selectedTagIds.substring(1))
            }
        }
        if (difficulty?.length > 0) {
            if (difficulty[0].value !== 'None') {
                queryParams.push(selectedDiff.substring(1))
            }
        }
        if (debouncedSearch) {
            queryParams.push(`searchTerm=${debouncedSearch}`)
        }

        if (queryParams.length > 0) {
            url += '&' + queryParams.join('&')
        }

        const response = await api.get(url)

        setFilteredQuestions(response.data.data)
        setTotalCodingQuestion(response.data.totalRows)
        setTotalPages(response.data.totalPages)
        setLastPage(response.data.totalPages)
    } catch (error) {
        console.error('Error:', error)
    }
}

export async function filteredQuizQuestions(
    setStoreQuizData: (newValue: any[]) => void,
    offset?: number,
    position?: string,
    difficulty?: any,
    selectedOptions?: any,
    setTotalMCQQuestion?: any,
    // selectedTopic?: any,
    setLastPage?: any,
    setTotalPages?: any,
    debouncedSearch?: string | undefined,
    selectedLanguage?: string
) {
    try {
        // const safeOffset = Math.max(0, offset)
        let url = `/Content/allQuizQuestions?limit=${position}&offset=${offset}`

        let selectedTagIds = ''
        selectedOptions?.map(
            (item: any) => (selectedTagIds += '&tagId=' + item.value)
        )

        let selectedDiff = ''
        difficulty?.map(
            (item: any) => (selectedDiff += '&difficulty=' + item.value)
        )

        const queryParams = []

        if (difficulty?.length > 0) {
            if (difficulty[0].value !== 'None') {
                queryParams.push(selectedDiff.substring(1))
            }
        }
        if (selectedTagIds?.length > 0) {
            if (selectedOptions[0].value !== '-1') {
                queryParams.push(selectedTagIds.substring(1))
            }
        }
        if (debouncedSearch) {
            queryParams.push(
                `searchTerm=${encodeURIComponent(debouncedSearch)}`
            )
        }

        if (queryParams.length > 0) {
            url += `&${queryParams.join('&')}`
        }
        const res = await api.get(url)

        setStoreQuizData(res.data.data)
        setTotalMCQQuestion(res.data.totalRows)
        setTotalPages(res.data.totalPages)
        setLastPage(res.data.totalPages)
    } catch (error) {
        console.error('Error fetching quiz questions:', error)
    }
}

export async function filteredOpenEndedQuestions(
    setFilteredQuestions: (newValue: any[]) => void,
    offset: number,
    position?: string,
    difficulty?: any,
    selectedOptions?: any,
    setTotalOpenEndedQuestion?: any,
    setLastPage?: any,
    setTotalPages?: any,
    selectedLanguage?: string,
    debouncedSearch?: string | undefined
) {
    try {
        const safeOffset = Math.max(0, offset)

        let url = `/Content/openEndedQuestions?limit=${position}&offset=${offset}`

        let selectedTagIds = ''
        selectedOptions.map(
            (item: any) => (selectedTagIds += '&tagId=' + item.value)
        )

        let selectedDiff = ''
        difficulty.map(
            (item: any) => (selectedDiff += '&difficulty=' + item.value)
        )

        const queryParams = []

        if (selectedTagIds.length > 0) {
            if (selectedOptions[0].value !== '-1') {
                queryParams.push(selectedTagIds.substring(1))
            }
        }
        if (difficulty.length > 0) {
            if (difficulty[0].value !== 'None') {
                queryParams.push(selectedDiff.substring(1))
            }
        }
        if (debouncedSearch) {
            queryParams.push(`searchTerm=${debouncedSearch}`)
        }
        // Add more conditions here as needed, e.g., selectedLanguage, etc.

        // if (queryParams.length > 0) {
        //     url += '?' + queryParams.join('&')
        // }
        if (queryParams.length > 0) {
            url += '&' + queryParams.join('&')
        }

        const response = await api.get(url)

        setFilteredQuestions(response.data.data)
        setTotalOpenEndedQuestion(response.data.totalRows)
        setTotalPages(response.data.totalPages)
        setLastPage(response.data.totalPages)
    } catch (error) {
        console.error('Error:', error)
    }
}

export async function filterQuestions(
    setFilteredQuestions: any,
    selectedDifficulties: any[], // Array of difficulties
    selectedTopics: any[], // Array of topics
    selectedLanguage: string,
    debouncedSearch: string,
    questionType: string // Type of question to determine the endpoint
) {
    try {
        // Set the endpoint based on question type
        let url = ''

        switch (questionType) {
            case 'coding':
                url = `/Content/allCodingQuestions`
                break
            case 'mcq':
                url = `/Content/allQuizQuestions`
                break
            case 'open-ended':
                url = `/Content/openEndedQuestions`
                break
        }

        const queryParams: string[] = []

        // Handle multiple selected topics (tags), but ignore 'All Topics' (id: -1 or 0)
        let selectedTagIds = ''
        selectedTopics.forEach((topic: any) => {
            if (topic.id !== -1 && topic.id !== 0) {
                // Skip 'All Topics'
                selectedTagIds += `&tagId=${topic.id}`
            }
        })

        // Handle multiple selected difficulties, but ignore 'Any Difficulty'
        let selectedDiff = ''
        selectedDifficulties.forEach((difficulty: string) => {
            if (difficulty !== 'Any Difficulty') {
                selectedDiff += `&difficulty=${difficulty}`
            }
        })

        // Add valid topics to query params
        if (selectedTagIds.length > 0) {
            queryParams.push(selectedTagIds.substring(1)) // Remove the first '&'
        }

        // Add valid difficulties to query params
        if (selectedDiff.length > 0) {
            queryParams.push(selectedDiff.substring(1)) // Remove the first '&'
        }

        // Add search term if provided
        if (debouncedSearch) {
            queryParams.push(`searchTerm=${debouncedSearch}`)
        }

        // Combine query parameters into the URL
        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&')
        }

        const response = await api.get(url)

        // Additional filtering for quiz questions, if needed
        if (questionType === 'quiz') {
            const filtered = response.data.filter(
                (question: any) =>
                    selectedDifficulties.includes('Any Difficulty') ||
                    selectedDifficulties.includes(question.difficulty)
            )
            setFilteredQuestions(filtered)
        } else {
            setFilteredQuestions(response.data.data || response.data)
        }
    } catch (error) {
        console.error('Error:', error)
    }
}

interface FetchStudentsParams {
    courseId: string
    limit: number
    offset: number
    searchTerm: string
    setLoading: (loading: boolean) => void
    setStudents: (students: any[]) => void
    setTotalPages: (totalPages: number) => void
    setTotalStudents: (totalStudents: number) => void
    setCurrentPage: (currentPage: number) => void
}

export const fetchStudentsHandler = async ({
    courseId,
    limit,
    offset,
    searchTerm,
    setLoading,
    setStudents,
    setTotalPages,
    setTotalStudents,
    setCurrentPage,
}: FetchStudentsParams) => {
    setLoading(true)

    const endpoint = searchTerm
        ? `/bootcamp/students/${courseId}?searchTerm=${searchTerm}`
        : `/bootcamp/students/${courseId}?limit=${limit}&offset=${offset}`

    try {
        const res = await api.get(endpoint)
        setStudents(res.data.modifiedStudentInfo)
        setTotalPages(res.data.totalPages)
        setTotalStudents(res.data.totalStudentsCount)
        setCurrentPage(res.data.currentPage)
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to fetch the data',
            className:
                'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
        })
    } finally {
        setLoading(false)
    }
}

export function cleanUpValues(value: string) {
    if (!value) return ''

    value = value.toString().trim()

    // Remove extra commas, spaces, and clean up the value
    value = value.replace(/,\s*,+/g, ',') // Remove extra commas
    value = value.replace(/\s{2,}/g, ' ') // Remove extra spaces
    value = value.replace(/,\s*$/, '') // Remove trailing commas
    value = value.replace(/^\s*,/, '') // Remove leading commas

    return value
}

// --------------------------
export const convertSeconds = (seconds: number) => {
    const SECONDS_IN_A_MINUTE = 60
    const SECONDS_IN_AN_HOUR = 60 * SECONDS_IN_A_MINUTE
    const SECONDS_IN_A_DAY = 24 * SECONDS_IN_AN_HOUR
    const SECONDS_IN_A_WEEK = 7 * SECONDS_IN_A_DAY
    const SECONDS_IN_A_MONTH = 28 * SECONDS_IN_A_DAY
    const months = Math.floor(seconds / SECONDS_IN_A_MONTH)
    seconds %= SECONDS_IN_A_MONTH
    const weeks = Math.floor(seconds / SECONDS_IN_A_WEEK)
    seconds %= SECONDS_IN_A_WEEK
    const days = Math.floor(seconds / SECONDS_IN_A_DAY)
    seconds %= SECONDS_IN_A_DAY
    return {
        months: months,
        weeks: weeks,
        days: days,
    }
}

// --------------------------------------------
// Preview Assessment Page functions:-

export async function fetchPreviewData(
    params: any,
    setPreviewContent: any,
    setAssessmentPreviewCodingContent?: any
) {
    try {
        const response = await api.get(
            `Content/chapterDetailsById/${params?.chapterId}?bootcampId=${params?.courseId}&moduleId=${params?.moduleId}&topicId=${params?.topicId}`
        )
        setPreviewContent(response.data)
        setAssessmentPreviewCodingContent &&
            setAssessmentPreviewCodingContent(response.data.CodingQuestions)
    } catch (error) {
        console.error('Error fetching chapter content:', error)
    }
}
function setPages(totalPages: any) {
    throw new Error('Function not implemented.')
}

export function removeNulls<T>(obj: T): T {
    if (Array.isArray(obj)) {
        return obj
            .map((item) => removeNulls(item))
            .filter(
                (item) => item && Object.keys(item).length > 0
            ) as unknown as T
    } else if (obj && typeof obj === 'object') {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            const filteredValue = removeNulls(value)
            if (filteredValue !== null && filteredValue !== undefined) {
                ;(acc as any)[key] = filteredValue
            }
            return acc
        }, {} as T)
    }
    return obj
}

export function transformQuizzes(data: any): { quizzes: any[] } {
    const quizzesMap: { [key: string]: any } = {}

    data.forEach((item: any) => {
        const title = item['quizzes/title']
        if (!quizzesMap[title]) {
            quizzesMap[title] = {
                title: item['quizzes/title'],
                difficulty: item['quizzes/difficulty'],
                tagId: item['quizzes/tagId'],
                content: item['quizzes/content'],
                isRandomOptions: item['quizzes/isRandomOptions'],
                variantMCQs: [],
            }
        }

        // Collect variantMCQs
        let mcqIndex = 0
        while (true) {
            const questionKey = `quizzes/variantMCQs/${mcqIndex}/question`
            const question = item[questionKey]

            if (!question) break // Exit if no more questions

            const options: any = {}
            let optionIndex = 1

            while (true) {
                const optionKey = `quizzes/variantMCQs/${mcqIndex}/options/${optionIndex}`
                const optionValue = item[optionKey]

                if (!optionValue) break // Exit if no more options

                options[optionIndex.toString()] = optionValue
                optionIndex++
            }

            const correctOption =
                item[`quizzes/variantMCQs/${mcqIndex}/correctOption`]

            quizzesMap[title].variantMCQs.push({
                question,
                options,
                correctOption,
            })
            mcqIndex++
        }
    })

    return { quizzes: Object.values(quizzesMap) }
}

export const addClassToCodeTags: any = (
    htmlString: string,
    codeBlockClass: string
) => {
    // Find the positions of the first <code> and the last </code>
    const firstCodeIndex = htmlString.indexOf('<code')
    const lastCodeIndex = htmlString.lastIndexOf('</code>')

    if (
        firstCodeIndex === -1 ||
        lastCodeIndex === -1 ||
        lastCodeIndex < firstCodeIndex
    ) {
        // If no valid code blocks are found, return the string unchanged
        return htmlString
    }

    // Split the content into three parts
    const beforeCode = htmlString.substring(0, firstCodeIndex) // Everything before the first <code>
    const codeContent = htmlString.substring(firstCodeIndex, lastCodeIndex + 7) // From the first <code> to the last </code>
    const afterCode = htmlString.substring(lastCodeIndex + 7) // Everything after the last </code>

    // Wrap the codeContent with <pre> and the given class
    const styledCodeBlock = `
        <pre class="${codeBlockClass}">
            ${codeContent}
        </pre>
    `

    // Combine the parts back together
    return `${beforeCode}${styledCodeBlock}${afterCode}`
}

export async function handleSaveChapter(
    moduleId: string,
    contentId: number,
    reqBody: any
) {
    const response = await api.put(
        `/Content/editChapterOfModule/${moduleId}?chapterId=${contentId}`,
        reqBody
    )
    if (response) {
        toast({
            title: 'Success',
            description: 'Chapter edited successfully',
            className:
                'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
        })
    }
}

export const proctoringOptions = [
    {
        label: 'Copy Paste',
        name: 'canCopyPaste' as const,
        tooltip:
            'Prevents users from copying and pasting content during the exam to maintain test integrity.',
    },
    {
        label: 'Tab Change',
        name: 'tabSwitch' as const,
        tooltip:
            'Monitors and restricts switching between browser tabs during the exam to prevent unauthorized access to external resources.',
    },
    {
        label: 'Screen Exit',
        name: 'screenExit' as const,
        tooltip: 'Detects and logs any attempts to exit the exam screen, helping to identify potential cheating attempts.'
    }
];

// Calculate the time taken between start and submit times
export const calculateTimeTaken = (start: string, submit: string): string => {
    const startDate = new Date(start);
    const submitDate = new Date(submit);

    const diffInMilliseconds = submitDate.getTime() - startDate.getTime();
    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h & ${minutes}m`;
};

  
  // Extract the submission date in YYYY-MM-DD format
  export const getSubmissionDate = (submit: string): string => {
    const submitDate = new Date(submit);
    return submitDate.toISOString().split("T")[0];
  };
  