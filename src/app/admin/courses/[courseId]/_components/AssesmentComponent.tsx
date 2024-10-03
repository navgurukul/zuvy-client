    'use client'
    import { Button } from '@/components/ui/button'
    import { getAssesmentBackgroundColorClass } from '@/lib/utils'
    import { api } from '@/utils/axios.config'
    import { ArrowDownToLine, ChevronRight } from 'lucide-react'
    import Link from 'next/link'
    import React, { useRef } from 'react'
    import { jsPDF } from "jspdf";
    import autoTable from 'jspdf-autotable';
    import { toast } from 'react-toastify';

    type Props = {
        title: string
        codingChallenges: number
        mcq: number
        openEnded: number
        studentsSubmitted: number
        totalSubmissions: number
        id: any
        bootcampId: number
        qualifiedStudents: number
    }

    const AssesmentComponent = (props: Props) => {
        const printRef = useRef<HTMLDivElement | null>(null);

        const handleDownloadPdf = async () => {
            const apiUrl = `/admin/assessment/students/assessment_id${props.id}`;

            async function fetchData() {
                try {
                    const response = await api.get(apiUrl);
                    const assessments = response.data.submitedOutsourseAssessments;

                    if (Array.isArray(assessments) && assessments.length === 0) {

                        return;
                    }

                    const doc = new jsPDF();

                    // Title Styling
                    doc.setFontSize(18);
                    doc.setFont('Regular', 'normal');
                    doc.text(props.title, 14, 10);

                    // Passed Percentage Styling
                    doc.setFontSize(14);
                    doc.setFont('Regular', 'normal');
                    doc.text('Passed Percentage: 70%', 14, 16); // Closer to the title

                    // Add section title for students (closer to the table)
                    doc.setFontSize(15);
                    doc.setFont('Regular', 'normal');
                    doc.text('List of Students-:', 14, 23); // Closer to the table

                    // Define columns for the table
                    const columns = [
                        { header: 'Name', dataKey: 'name' },
                        { header: 'Email', dataKey: 'email' },
                        { header: 'Qualified', dataKey: 'qualified' },
                        { header: 'Percentage', dataKey: 'percentage' }
                    ];

                    // Prepare rows for the table
                    const rows = assessments.map((assessment: { name: any; email: any; isPassed: any; percentage: number }) => ({
                        name: assessment.name || 'N/A',
                        email: assessment.email || 'N/A',
                        qualified: assessment.isPassed ? 'Yes' : 'No',
                        percentage: Math.floor(assessment.percentage) || 0
                    }));

                    // Use autoTable to create the table in the PDF
                    autoTable(doc, {
                        head: [columns.map(col => col.header)],
                        body: rows.map((row: { name: any; email: any; qualified: any; percentage: any }) => [row.name, row.email, row.qualified, row.percentage]),
                        startY: 25, // Start the table closer to the section title
                        margin: { horizontal: 10 },
                        styles: { overflow: 'linebreak', halign: 'center' },
                        headStyles: { fillColor: [22, 160, 133] },
                        theme: 'grid'
                    });

                    // Save the document
                    doc.save(`${props.title}.pdf`);
                } catch (error) {


                }
            }

            fetchData();
        };



        const color = getAssesmentBackgroundColorClass(
            props.totalSubmissions,
            props.studentsSubmitted
        );

        const isDisabled = props.studentsSubmitted === 0; // Disable if no submissions

        return (
            <div ref={printRef} className="lg:flex-row h-auto lg:h-[280px] sm:h-[360px] w-full shadow-lg my-5 rounded-lg p-4 lg:p-6 bg-white dark:bg-gray-800 transition-transform transform hover:shadow-xl">
                <div className="w-full justify-between py-2 lg:mx-4 min-h-[250px] sm:min-h-[200px]">
                    <div className="flex items-center justify-between">
                        <h1 className="text-sm lg:text-base text-start font-medium text-gray-900 dark:text-white">
                            {props.title}
                        </h1>
                        <div className="relative group">
                            <button
                                className={`ml-2 cursor-pointer ${isDisabled ? 'text-gray-400' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={isDisabled ? undefined : handleDownloadPdf}
                                aria-label="Download full report"
                                disabled={isDisabled} // Disable button
                            >
                                <ArrowDownToLine size={20} />
                            </button>
                            <div className={`absolute right-0 bottom-full mb-2 hidden px-2 py-1 text-xs text-white bg-gray-800 rounded group-hover:block whitespace-nowrap ${isDisabled ? 'hidden' : 'block'}`}>
                                {isDisabled ? ' No submissions available.' : 'Download full report'}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row justify-start gap-y-3 lg:gap-x-6 my-3 flex-grow">
                        {props.codingChallenges > 0 && (
                            <div className="text-left">
                                <div className="text-base lg:text-lg font-medium text-gray-900 dark:text-white">
                                    {props.codingChallenges}
                                </div>
                                <p className="text-gray-700 font-normal text-md">Coding Challenges</p>
                            </div>
                        )}
                        {props.mcq > 0 && (
                            <div className="text-left">
                                <div className="text-base lg:text-lg font-medium text-gray-900 dark:text-white">
                                    {props.mcq}
                                </div>
                                <p className="text-gray-700 font-normal text-md mt-1">MCQs</p>
                            </div>
                        )}
                        {props.openEnded > 0 && (
                            <div className="text-left">
                                <div className="text-base lg:text-lg font-medium text-gray-900 dark:text-white">
                                    {props.openEnded}
                                </div>
                                <p className="text-gray-700 font-normal text-md">Open-Ended</p>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-y-3 lg:gap-x-6 my-3 pb-3 flex-grow">
                        <div className="flex flex-row items-center gap-x-2">
                            <div className={`h-3 w-3 rounded-full ${props.studentsSubmitted / props.totalSubmissions > 0.8
                                ? 'bg-green-400'
                                : props.studentsSubmitted / props.totalSubmissions >= 0.5
                                    ? 'bg-orange-400'
                                    : 'bg-red-500'
                                }`} />
                            <div className="text-base lg:text-lg font-medium text-gray-700">
                                {props.studentsSubmitted}/{props.totalSubmissions}
                            </div>
                            <p className="text-gray-700 font-normal text-md">Submissions</p>
                        </div>
                        <div className="flex flex-row items-center gap-x-2">
                            <div className="h-3 w-3 bg-orange-400 rounded-full" />
                            <div className="text-base lg:text-lg font-medium text-gray-700">{props.qualifiedStudents}</div>
                            <p className="text-gray-700 font-normal text-md">Qualified</p>
                        </div>
                        <div className="flex justify-end mt-auto">
                            <Link href={`/admin/courses/${props.bootcampId}/submissionAssesments/${props.id}`} className="w-full lg:w-auto">
                                <Button variant="ghost" className="flex justify-center items-center w-full lg:w-auto py-2 text-secondary font-bold rounded-md transition-all duration-300">
                                    <h1 className="w-full text-center flex lg:text-right">View Submission<ChevronRight size={20} className="ml-2" /></h1>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    export default AssesmentComponent;
