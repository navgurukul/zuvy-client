// export async function handleFullScreenChange(
//     submitAssessment: () => void,
//     isCurrentPageSubmitAssessment: () => Boolean,
//     setIsFullScreen: any,
//     assessmentSubmitId: any,
// ) {
//     if (!document.fullscreenElement) {
//         setIsFullScreen(false)
//         const { tabChange, copyPaste, fullScreenExit, eyeMomentCount} = await getProctoringData(assessmentSubmitId);
//         const newFullScreenExitInstance = fullScreenExit + 1
//         await updateProctoringData(assessmentSubmitId, tabChange, copyPaste, newFullScreenExitInstance, eyeMomentCount);


//           if (newFullScreenExitInstance > 3) {
//             // Check if the current page is the submitAssessment page
//             if (isCurrentPageSubmitAssessment()) {
//                 submitAssessment()
//                return showProctoringAlert({
//                     title: 'Test Ended',
//                     description: 'You have exited full screen multiple times.',
//                     violationCount: `${newFullScreenExitInstance} of 3`
//                 })
//             }
//         }else{
//             return showProctoringAlert({
//                 title: 'Full Screen Exit Detected',
//                 description:
//                     'You have exited full screen. If you exit full screen again, your test may get submitted automatically.',
//                violationCount: `${newFullScreenExitInstance} of 3`
//             })
//         }
      
//     }
// }