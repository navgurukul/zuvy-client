// export async function updateProctoringData(
//     assessmentSubmitId:any,
//     tabChangeInstance: any,
//     copyPasteAttempt: any,
//     fullScreenExit: any,
//     eyeMomentCount: any,
// ){
//     try {
//         const res = await api.patch(
//             `submission/assessment/properting?assessment_submission_id=${assessmentSubmitId}`,
//             {
//                 tabChange: tabChangeInstance,
//                 copyPaste: copyPasteAttempt,
//                 fullScreenExit: fullScreenExit,
//                 eyeMomentCount: eyeMomentCount
//             }
//         )
//     } catch (error) {
//         console.error('Error updating Proctoring data:', error)
//         return null
//     }
// }