export interface StudentsInfo {
    total_students: number
    present: number
    s3link: string
}

export interface DisplayAttendance {
    status: string
    message: string
    attendanceSheet:string
    studentsInfo: StudentsInfo
}


export interface ClassData {
    id: number
    title: string
    s3link: string
    startTime: string
    endTime: string
    meetingId: string
    description:string
}