/**
 * Converts the nested API response data into a flat CSV format
 * Each row represents a student's project (if no projects, one row per student)
 */

interface StudentRecord {
    name?: string
    email?: string
    overAllAttendance?: number | null
    numberOfAssessmentsAttempted?: number
    averageAssessmentPercentage?: number | null
    assessments?: unknown[]
    oneOnOneSessionsCompleted?: number
    profile?: any
}

interface ApiData {
    courseName?: string
    batchName?: string
    students?: StudentRecord[]
}

interface FlattenOptions {
    expandProjects?: boolean
    includeProfileFields?: boolean
    includeProjectFields?: boolean
}

const stringifyValue = (value: unknown): string => {
    if (value == null) {
        return ''
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => stringifyValue(item))
            .filter((item) => item.length > 0)
            .join('; ')
    }

    if (typeof value === 'object') {
        return JSON.stringify(value)
    }

    return String(value)
}

const buildBaseStudentRecord = (
    data: ApiData,
    student: StudentRecord,
    includeProfileFields: boolean
): Record<string, any> => {
    const profile = typeof student.profile === 'object' ? student.profile : null

    const baseRecord: Record<string, any> = {
        'Course Name': data.courseName || '',
        'Batch Name': data.batchName || '',
        'Student Name': student.name || '',
        'Email': student.email || '',
        'Overall Attendance': student.overAllAttendance ?? '',
        'Assessments Attempted': student.numberOfAssessmentsAttempted ?? '',
        'Average Assessment %': student.averageAssessmentPercentage ?? '',
        'One-on-One Sessions Completed': student.oneOnOneSessionsCompleted ?? '',
    }

    if (includeProfileFields && profile) {
        baseRecord['Phone Number'] = profile.phoneNumber ?? ''
        baseRecord['LinkedIn Profile'] = profile.linkedinProfile ?? ''
        baseRecord['College Name'] = profile.collegeName ?? profile.otherCollegeName ?? ''
        baseRecord['Degree'] = profile.degree ?? ''
        baseRecord['Branch'] = profile.branch ?? profile.collegeStream ?? ''
        baseRecord['Year of Study'] = profile.yearOfStudy ?? ''
        baseRecord['Graduation Month'] = profile.graduationMonth ?? ''
        baseRecord['Graduation Year'] = profile.graduationYear ?? ''
        baseRecord['Current Status'] = profile.currentStatus ?? ''
        baseRecord['Technical Skills'] = Array.isArray(profile.technicalSkills)
            ? profile.technicalSkills.filter(Boolean).join('; ')
            : ''
        baseRecord['College Score'] = profile.collegeScore ?? ''
        baseRecord['College Score Type'] = profile.collegeScoreType ?? ''
        baseRecord['Class 12 Board'] = profile.class12Board ?? ''
        baseRecord['Class 12 Score'] = profile.class12Score ?? ''
        baseRecord['Class 12 Score Type'] = profile.class12ScoreType ?? ''
        baseRecord['Class 10 Board'] = profile.class10Board ?? ''
        baseRecord['Class 10 Score'] = profile.class10Score ?? ''
        baseRecord['Class 10 Score Type'] = profile.class10ScoreType ?? ''
        baseRecord['Has Work Experience'] = profile.hasWorkExperience ? 'Yes' : 'No'
        baseRecord['LeetCode Profiles'] = Array.isArray(profile.leetcodeProfiles)
            ? profile.leetcodeProfiles.filter(Boolean).join('; ')
            : ''
        baseRecord['CodeChef Profiles'] = Array.isArray(profile.codechefProfiles)
            ? profile.codechefProfiles.filter(Boolean).join('; ')
            : ''
        baseRecord['CodeForces Profiles'] = Array.isArray(profile.codeforcesProfiles)
            ? profile.codeforcesProfiles.filter(Boolean).join('; ')
            : ''
        baseRecord['Target Roles'] = Array.isArray(profile.targetRoles)
            ? profile.targetRoles.filter(Boolean).join('; ')
            : ''
        baseRecord['Preferred Locations'] = Array.isArray(profile.preferredLocations)
            ? profile.preferredLocations.filter(Boolean).join('; ')
            : ''
        baseRecord['Open to Remote'] = profile.openToRemote ? 'Yes' : 'No'
        baseRecord['Internship Stipend'] = profile.internshipStipend ?? ''
        baseRecord['Full Time CTC'] = profile.fullTimeCtc ?? ''
        baseRecord['Preferred Contact Methods'] = Array.isArray(profile.preferredContactMethods)
            ? profile.preferredContactMethods.filter(Boolean).join('; ')
            : ''
        baseRecord['Resume URL'] = profile.resumeUrl ?? ''
        baseRecord['Profile Created At'] = profile.createdAt ?? ''
        baseRecord['Profile Updated At'] = profile.updatedAt ?? ''
    }

    return baseRecord
}

const buildProjectSummaryRecord = (projects: unknown[]): Record<string, any> => {
    const projectObjects = projects
        .filter((project) => project && typeof project === 'object' && !Array.isArray(project))
        .map((project) => project as Record<string, unknown>)

    return {
        'Project Title': projectObjects
            .map((project) => stringifyValue(project.title ?? project.name ?? ''))
            .filter((title) => title.length > 0)
            .join(' | '),
        'Tech Stack': projectObjects
            .map((project) => stringifyValue(project.techStack ?? project.technologies ?? []))
            .filter((stack) => stack.length > 0)
            .join(' | '),
        'Project Description': projectObjects
            .map((project) => stringifyValue(project.description ?? ''))
            .filter((description) => description.length > 0)
            .join(' | '),
    }
}

export const flattenStudentsData = (
    data: ApiData,
    options: FlattenOptions = {}
): Record<string, any>[] => {
    const flatData: Record<string, any>[] = []
    const expandProjects = options.expandProjects !== false
    const includeProfileFields = options.includeProfileFields !== false
    const includeProjectFields = options.includeProjectFields !== false

    if (!data.students || data.students.length === 0) {
        return flatData
    }

    data.students.forEach((student) => {
        const profile = typeof student.profile === 'object' ? student.profile : null
        const projects = Array.isArray(profile?.projects) ? profile.projects : []
        const shouldIncludeProfileFields = includeProfileFields && !!profile
        const shouldIncludeProjectFields = includeProjectFields && !!profile
        const baseRecord = buildBaseStudentRecord(
            data,
            student,
            shouldIncludeProfileFields
        )

        if (!expandProjects || !shouldIncludeProjectFields) {
            flatData.push({
                ...baseRecord,
                ...(shouldIncludeProjectFields ? buildProjectSummaryRecord(projects) : {}),
            })
            return
        }

        if (projects.length > 0) {
            projects.forEach((project: any) => {
                const projectRecord = { ...baseRecord }
                projectRecord['Project Title'] = project.title ?? ''
                projectRecord['Tech Stack'] = Array.isArray(project.techStack)
                    ? project.techStack.filter(Boolean).join('; ')
                    : ''
                projectRecord['Project Description'] = project.description ?? ''
                flatData.push(projectRecord)
            })
        } else {
            // If no projects, still add one row for the student with empty project fields
            baseRecord['Project Title'] = ''
            baseRecord['Tech Stack'] = ''
            baseRecord['Project Description'] = ''
            flatData.push(baseRecord)
        }
    })

    return flatData
}

/**
 * Converts an array of objects to CSV string
 */
export const convertToCSV = (data: Record<string, any>[]): string => {
    if (data.length === 0) {
        return ''
    }

    // Get all unique keys from all objects to ensure complete headers
    const headers = Array.from(
        new Set(data.flatMap((row) => Object.keys(row)))
    )

    // Create CSV header row
    const csvHeaders = headers.map((header) => `"${header}"`).join(',')

    // Create CSV data rows
    const csvRows = data.map((row) => {
        return headers
            .map((header) => {
                let value = row[header] ?? ''
                // Escape quotes and wrap in quotes if contains comma, newline, or quotes
                if (
                    typeof value === 'string' &&
                    (value.includes(',') || value.includes('\n') || value.includes('"'))
                ) {
                    value = `"${value.replace(/"/g, '""')}"`
                } else if (typeof value !== 'string') {
                    value = `"${value}"`
                } else {
                    value = `"${value}"`
                }
                return value
            })
            .join(',')
    })

    return [csvHeaders, ...csvRows].join('\n')
}

/**
 * Downloads CSV file
 */
export const downloadCSV = (csvContent: string, fileName: string = 'students_report.csv') => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up the URL object
    URL.revokeObjectURL(url)
}

/**
 * All-in-one function to export data to CSV
 */
export const exportStudentsToCSV = (
    data: ApiData,
    fileName: string = 'students_report.csv'
) => {
    const hasProfileData = Boolean(
        data.students?.some(
            (student) =>
                student &&
                typeof student.profile === 'object' &&
                student.profile !== null &&
                !Array.isArray(student.profile)
        )
    )

    const flattenedData = flattenStudentsData(data, {
        expandProjects: false,
        includeProfileFields: hasProfileData,
        includeProjectFields: hasProfileData,
    })
    const csvContent = convertToCSV(flattenedData)
    downloadCSV(csvContent, fileName)
}

/**
 * Export students from a batch report (multiple students)
 * Use this when you have data with multiple students and want to flatten all of them
 */
export const exportBatchStudentsToCSV = (
    data: ApiData,
    fileName?: string
) => {
    const flattenedData = flattenStudentsData(data)
    const csvContent = convertToCSV(flattenedData)
    const defaultFileName = `${data.batchName || 'batch'}_${data.courseName || 'students'}_${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(csvContent, fileName || defaultFileName)
}
