// export async function getProctoringData(assessmentSubmissionId: any) {
//     try {
//         const res = await api.get(`tracking/assessment/properting/${assessmentSubmissionId}`);
//         const eyeMomentCount = res?.data?.data?.eyeMomentCount;
//         const fullScreenExit = res?.data?.data?.fullScreenExit;
//         const copyPaste = res?.data?.data?.copyPaste;
//         const tabChange = res?.data?.data?.tabChange;

//         // Check if the values are valid
//         if (tabChange === undefined || copyPaste === undefined) {
//             throw new Error('Invalid data structure received from API');
//         }

//         return {eyeMomentCount, fullScreenExit, copyPaste, tabChange};  // Return as an object
//     } catch (error) {
//         console.error('Error fetching Proctoring data:', error);
//         throw error;  // Rethrow the error to be handled by the calling function
//     }
// }