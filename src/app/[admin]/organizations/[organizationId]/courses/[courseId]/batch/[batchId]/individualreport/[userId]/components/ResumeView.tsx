'use client'

import React from 'react'
import { Mail, Briefcase, Award, TrendingUp, Users, Calendar, Phone, Linkedin, GraduationCap, Code, Download, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { exportStudentsToCSV } from '@/utils/csvExporter'

interface StudentData {
    userId?: number | string
    name?: string
    email?: string
    overAllAttendance?: number | null
    numberOfAssessmentsAttempted?: number
    averageAssessmentPercentage?: number | null
    assessments?: unknown[]
    oneOnOneSessionsCompleted?: number
    profile?: any
}

interface ResumeViewProps {
    student: StudentData | undefined
    courseName?: string
    batchName?: string
}

const ResumeView: React.FC<ResumeViewProps> = ({ student, courseName, batchName }) => {
    const profile = typeof student?.profile === 'object' ? student.profile : null

    const handleDownloadCSV = () => {
        if (!student) return

        const data = {
            courseName: courseName || '',
            batchName: batchName || '',
            students: [student],
        }

        const fileName = `${student?.name || 'student'}_${courseName || 'report'}_${new Date().toISOString().split('T')[0]}.csv`
        exportStudentsToCSV(data, fileName)
    }

    if (!student) {
        return (
            <Card className="p-6 text-center text-muted-foreground">
                No student data available
            </Card>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Download Button */}
            <div className="flex items-center justify-end gap-3 mb-4 print:hidden">
                {profile?.resumeUrl && (
                    <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                        <ExternalLink size={16} />
                        View Resume
                    </a>
                )}
                <Button
                    onClick={handleDownloadCSV}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                    <Download size={18} />
                    Download as CSV
                </Button>
            </div>

            {/* Resume Container */}
            <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
                {/* Header Section */}
                <div className="border-b-2 border-gray-300 pb-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1 text-left">
                        {profile?.fullName || student?.name || 'Student'}
                    </h1>
                    <div className="flex flex-col md:flex-row md:items-center md:gap-6 text-sm text-gray-600 mt-3">
                        {student?.email && (
                            <div className="flex items-center gap-2">
                                <Mail size={16} />
                                <span>{student.email}</span>
                            </div>
                        )}
                        {profile?.phoneNumber && (
                            <div className="flex items-center gap-2">
                                <Phone size={16} />
                                <span>{profile.phoneNumber}</span>
                            </div>
                        )}
                        {profile?.linkedinProfile && (
                            <div className="flex items-center gap-2">
                                <Linkedin size={16} />
                                <a href={profile.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    LinkedIn
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Batch and Course Information Card */}
                {(courseName || batchName) && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {courseName && (
                                <div>
                                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">Course Name</p>
                                    <p className="text-lg font-semibold text-gray-900">{courseName}</p>
                                </div>
                            )}
                            {batchName && (
                                <div>
                                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">Batch Name</p>
                                    <p className="text-lg font-semibold text-gray-900">{batchName}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Education Section */}
                {profile && (profile.degree || profile.collegeName || profile.otherCollegeName) && (
                    <section className="mb-6">
                        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <GraduationCap size={18} className="text-blue-600" />
                            Education
                        </h2>
                        <div className="border-l-3 border-blue-500 pl-3 py-1">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-800">
                                        {profile.degree || 'N/A'} in {profile.branch || profile.collegeStream || 'N/A'}
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {profile.collegeName || profile.otherCollegeName || 'N/A'}
                                    </p>
                                </div>
                                <div className="text-right text-xs text-gray-600 whitespace-nowrap">
                                    {profile.graduationYear && (
                                        <p>
                                            {profile.graduationMonth ? `${new Date(0, profile.graduationMonth - 1).toLocaleString('default', { month: 'long' })} ` : ''}
                                            {profile.graduationYear}
                                        </p>
                                    )}
                                    {profile.yearOfStudy && <p className="text-xs">Year: {profile.yearOfStudy}</p>}
                                </div>
                            </div>
                            {profile.collegeScore && (
                                <p className="text-xs text-gray-600 mt-2">
                                    <span className="font-semibold">GPA:</span> {profile.collegeScore} {profile.collegeScoreType ? `(${profile.collegeScoreType})` : ''}
                                </p>
                            )}
                        </div>
                    </section>
                )}

                {/* Technical Skills Section */}
                {profile?.technicalSkills && Array.isArray(profile.technicalSkills) && profile.technicalSkills.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Code size={20} className="text-blue-600" />
                            Technical Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.technicalSkills.map((skill: any, index: number) => (
                                <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                >
                                    {typeof skill === 'string' ? skill : skill?.name || skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects Section */}
                {profile?.projects && Array.isArray(profile.projects) && profile.projects.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Award size={18} className="text-blue-600" />
                            Projects
                        </h2>
                        <div className="space-y-3">
                            {profile.projects.map((project: any, index: number) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-3">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-1">
                                        {project?.name || project?.title || `Project ${index + 1}`}
                                    </h3>
                                    {project?.description && (
                                        <p className="text-xs text-gray-600 mb-2">{project.description}</p>
                                    )}
                                    {project?.technologies && (
                                        <p className="text-xs text-gray-500">
                                            <span className="font-semibold">Tech:</span> {project.technologies}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Work Experience Section */}
                {profile?.workExperiences && Array.isArray(profile.workExperiences) && profile.workExperiences.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Briefcase size={20} className="text-blue-600" />
                            Work Experience
                        </h2>
                        <div className="space-y-4">
                            {profile.workExperiences.map((experience: any, index: number) => (
                                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                                    <h3 className="font-semibold text-gray-800">
                                        {experience?.designation || experience?.jobTitle || 'Position'}
                                    </h3>
                                    <p className="text-gray-700 text-sm">{experience?.company || 'N/A'}</p>
                                    {(experience?.startDate || experience?.endDate) && (
                                        <p className="text-xs text-gray-600">
                                            {experience.startDate} {experience.endDate ? `- ${experience.endDate}` : '- Present'}
                                        </p>
                                    )}
                                    {experience?.description && (
                                        <p className="text-sm text-gray-600 mt-2">{experience.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Competitive Programming Section */}
                {(profile?.leetcodeProfiles?.length > 0 || profile?.codechefProfiles?.length > 0 || profile?.codeforcesProfiles?.length > 0) && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Code size={20} className="text-blue-600" />
                            Competitive Programming
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {profile?.leetcodeProfiles && profile.leetcodeProfiles.length > 0 && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">LeetCode</h3>
                                    {profile.leetcodeProfiles.map((profile_item: any, index: number) => (
                                        <div key={index} className="text-sm">
                                            <p className="text-gray-700">{profile_item?.username || profile_item}</p>
                                            {profile_item?.rank && <p className="text-xs text-gray-600">Rank: {profile_item.rank}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {profile?.codechefProfiles && profile.codechefProfiles.length > 0 && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">CodeChef</h3>
                                    {profile.codechefProfiles.map((profile_item: any, index: number) => (
                                        <div key={index} className="text-sm">
                                            <p className="text-gray-700">{profile_item?.username || profile_item}</p>
                                            {profile_item?.rank && <p className="text-xs text-gray-600">Rank: {profile_item.rank}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {profile?.codeforcesProfiles && profile.codeforcesProfiles.length > 0 && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Codeforces</h3>
                                    {profile.codeforcesProfiles.map((profile_item: any, index: number) => (
                                        <div key={index} className="text-sm">
                                            <p className="text-gray-700">{profile_item?.username || profile_item}</p>
                                            {profile_item?.rank && <p className="text-xs text-gray-600">Rank: {profile_item.rank}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Current Status Section */}
                {profile?.currentStatus && (
                    <section className="mb-8">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Current Status</p>
                            <p className="font-semibold text-gray-800">{profile.currentStatus}</p>
                        </div>
                    </section>
                )}

                {/* Performance Summary Section */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-600" />
                        Performance Summary
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">
                                Attendance Rate
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                                {student?.overAllAttendance == null ? 'N/A' : `${student.overAllAttendance}%`}
                            </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">
                                Assessments Completed
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                                {student?.numberOfAssessmentsAttempted ?? 0}
                            </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">
                                Avg Performance
                            </p>
                            <p className="text-2xl font-bold text-purple-600">
                                {student?.averageAssessmentPercentage == null
                                    ? 'N/A'
                                    : `${student.averageAssessmentPercentage}%`}
                            </p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">
                                1:1 Sessions
                            </p>
                            <p className="text-2xl font-bold text-orange-600">
                                {student?.oneOnOneSessionsCompleted ?? 0}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Assessments Section */}
                {student?.assessments && student.assessments.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Award size={20} className="text-blue-600" />
                            Assessment Results
                        </h2>
                        <div className="space-y-3">
                            {Array.isArray(student.assessments) &&
                                student.assessments.map((assessment: any, index: number) => (
                                    <div
                                        key={assessment?.id || index}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800 mb-1 text-lg">
                                                    {assessment?.name || `Assessment ${index + 1}`}
                                                </h3>
                                                <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-gray-600">
                                                    {assessment?.completedDate && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            {new Date(assessment.completedDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    {assessment?.status && (
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                                                assessment.status === 'completed'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : assessment.status === 'pending'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {assessment.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {assessment?.percentage ?? 'N/A'}
                                                    {typeof assessment?.percentage === 'number' && '%'}
                                                </p>
                                                <p className="text-xs text-gray-500">Score</p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {typeof assessment?.percentage === 'number' && (
                                            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${
                                                        assessment.percentage >= 75
                                                            ? 'bg-green-500'
                                                            : assessment.percentage >= 50
                                                            ? 'bg-yellow-500'
                                                            : 'bg-red-500'
                                                    }`}
                                                    style={{
                                                        width: `${Math.min(assessment.percentage, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </section>
                )}

                {/* Professional Development Section */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-blue-600" />
                        Professional Development
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-700">One-on-One Mentoring Sessions</span>
                            <span className="font-semibold text-gray-900">
                                {student?.oneOnOneSessionsCompleted ?? 0} Completed
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-700">Course Attendance</span>
                            <span className="font-semibold text-gray-900">
                                {student?.overAllAttendance == null ? 'N/A' : `${student.overAllAttendance}%`}
                            </span>
                        </div>
                    </div>
                </section>

            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .bg-white {
                        box-shadow: none;
                    }
                }
            `}</style>
        </div>
    )
}

export default ResumeView
