import React from 'react';
import { api } from '@/utils/axios.config';
import { ArrowBigDownDash } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const DownloadReport = ({ userInfo }: any) => {
    const { userId, id } = userInfo;

    const [reportData, setReportData] = React.useState<any>({});

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
        doc.text(`Percentage: ${reportData.percentage > -1 ? reportData?.percentage : 0 }%`, 10, 50);
        doc.text(`Passed: ${reportData.isPassed ? 'Yes' : 'No'}`, 10, 60);

        // Add Submission Details
        autoTable(doc, {
            startY: 70,
            head: [['Field', 'Value']],
            body: [
                ['Started At', reportData.startedAt || 'N/A'],
                ['Submitted At', reportData.submitedAt || 'N/A'],
                ['Type of Submission', reportData.typeOfsubmission || 'N/A'],
                ['Coding Questions Attempted', reportData.attemptedCodingQuestions || 0],
                ['MCQs Attempted', reportData.attemptedMCQQuestions || 0],
                ['Coding Score', reportData?.codingScore || 0],
                ['MCQ Score', reportData?.mcqScore || 0],
            ],
        });
        // Save the PDF
        doc.save('Assessment_Report.pdf');
    }

    async function handleDownload() {
        await fetchReportData();
        await generatePDF();
    }

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
