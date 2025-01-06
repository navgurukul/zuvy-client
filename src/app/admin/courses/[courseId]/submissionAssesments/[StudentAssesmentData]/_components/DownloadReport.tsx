'use client'

import { calculateTimeTaken } from '@/utils/admin';
import { api } from '@/utils/axios.config';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArrowBigDownDash } from 'lucide-react';
import { useEffect, useState } from 'react';

const DownloadReport = ({ userInfo }: any) => {
    const { userId, id } = userInfo;
    const [reportData, setReportData] = useState<any>(null);
    
    const timeTaken: any = calculateTimeTaken(reportData?.startedAt || '0', reportData?.submitedAt || '0');

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMMM dd, yyyy hh:mm a'); // Example: December 16, 2024 09:08 AM
        } catch {
            return 'Invalid Date';
        }
    };

    async function fetchReportData() {
        try {
            const res = await api.get(
                `/tracking/assessment/submissionId=${id}?studentId=${userId}`
            );
            setReportData(res.data);
        } catch (error) {
            console.error('Error fetching report data:', error);
        }
    }

    async function generatePDF() {
        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(16);
        doc.text('Assessment Report', 10, 10);

        // Add User Info
        doc.setFontSize(12);
        doc.text(`Name: ${reportData.user?.name || 'N/A'}`, 10, 20);
        doc.text(`Email: ${reportData.user?.email || 'N/A'}`, 10, 30);
        doc.text(`Marks: ${reportData.marks || 0}`, 10, 40);
        doc.text(`Percentage: ${reportData.percentage ? reportData?.percentage : 0}%`, 10, 50);
        doc.text(`Passed: ${reportData.isPassed ? 'Yes' : 'No'}`, 10, 60);

        // Prepare Submission Details
        const tableBody = [
            ['Submitted At', formatDate(reportData?.submitedAt) || 'N/A'],
            ['Coding Questions Attempted', reportData.attemptedCodingQuestions || 0],
            ['MCQs Attempted', reportData.attemptedMCQQuestions || 0],
            ['Coding Score', reportData?.codingScore || 0],
            ['MCQ Score', reportData?.mcqScore || 0],
            ['Time Taken', timeTaken || 0],
            ['Total Marks', `${reportData?.marks || 0} marks`],
            [
                'Proctoring',
                !reportData?.submitedOutsourseAssessment?.canTabChange &&
                !reportData?.submitedOutsourseAssessment?.canScreenExit
                    ? 'No Proctoring Enabled By the Admin'
                    : 'Proctoring Enabled',
            ],
        ];

        // Add proctoring-specific rows only if proctoring is enabled
        const isProctoringEnabled =
            reportData?.submitedOutsourseAssessment?.canTabChange ||
            reportData?.submitedOutsourseAssessment?.canScreenExit;

        if (isProctoringEnabled) {
            tableBody.push(
                ['Copy Paste Done', `${reportData?.copyPaste || 0} times`],
                ['Tab Change Done', `${reportData?.tabChange || 0} times`],
                ['Screen Exit Done', `${reportData?.fullScreenExit || 0} times`]
            );
        }

        // Add Submission Details to PDF
        autoTable(doc, {
            startY: 70,
            head: [['Field', 'Value']],
            body: tableBody,
        });

        // Save the PDF
        doc.save('Assessment_Report.pdf');
    }

    function handleDownload() {
        generatePDF();
    }

    useEffect(() => {
        if (!reportData) fetchReportData();
    }, []);

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={handleDownload}
                className="max-w-[500px] text-secondary font-medium flex items-center"
            >
                <ArrowBigDownDash className="" />
                Download Report
            </button>
        </div>
    );
};

export default DownloadReport;
