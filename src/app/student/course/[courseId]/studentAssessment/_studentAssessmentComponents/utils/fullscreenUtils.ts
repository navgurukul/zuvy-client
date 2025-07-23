import{FullScreenElement,FullScreenDocument }from '@/app/student/course/[courseId]/studentAssessment/_studentAssessmentComponents/utils/courseStudentAssesmentUtilstsTypes'
export const requestFullScreen = (element: HTMLElement) => {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if ((element as FullScreenElement).webkitRequestFullscreen) {
    (element as any).webkitRequestFullscreen();
  } else if ((element as FullScreenElement).msRequestFullscreen) {
    (element as any).msRequestFullscreen();
  }
};

export const exitFullScreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ((document as FullScreenDocument).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen();
  } else if ((document as FullScreenDocument).msExitFullscreen) {
    (document as any).msExitFullscreen();
  }
};

export const isFullScreen = (): boolean => {
  return !!(
    document.fullscreenElement ||
    (document as FullScreenDocument).webkitFullscreenElement ||
    (document as FullScreenDocument).msFullscreenElement
  );
}; 