// export async function handleVisibilityChange(
//     submitAssessment: () => void,
//     isCurrentPageSubmitAssessment: () => boolean,
//     assessmentSubmitId: any,
// ) {
//     if (document.hidden) {
//         try {
//             const { tabChange, copyPaste, fullScreenExit, eyeMomentCount} = await getProctoringData(assessmentSubmitId);
//             const newTabChangeInstance = tabChange + 1;

//             // Update the proctoring data with the new values
//             await updateProctoringData(assessmentSubmitId, newTabChangeInstance, copyPaste, fullScreenExit, eyeMomentCount);

//             if (newTabChangeInstance > 3) {
//                 if (isCurrentPageSubmitAssessment()) {
//                     submitAssessment();
//                     return showProctoringAlert({
//                         title: 'Test Ended -> Tab will close now',
//                         description: 'You have changed the tab multiple times.',
//                         violationCount: `${newTabChangeInstance} of 3`
//                     });
//                 }
//             } else {
//                 return showProctoringAlert({
//                     title: 'Tab Switch Detected',
//                     description: 'You have changed the tab. If you change the tab again, your test may get submitted automatically.',
//                     violationCount: `${newTabChangeInstance} of 3`
//                 });
//             }
//         } catch (error) {
//             console.error('Failed to handle visibility change:', error);
//         }
//     }
// }