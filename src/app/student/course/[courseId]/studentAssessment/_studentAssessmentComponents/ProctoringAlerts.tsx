import React, { createContext, useContext, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";



import {AlertContextType,AlertProps}from '@/app/student/course/[courseId]/studentAssessment/_studentAssessmentComponents/projectStudentAssessmentUtilsType'
const AlertContext = createContext<AlertContextType | null>(null);

// Custom Alert Icon Component
const AlertIcon = () => (
  <div className="w-8 h-8 rounded-full bg-destructive border-4 border-border flex items-center justify-center relative shadow-4dp">
    <span className="text-destructive-foreground text-xl font-bold">!</span>
  </div>
);


export const AlertProvider = ({ 
  children, 
  requestFullScreen,
  setIsFullScreen ,
}: { 
  children: React.ReactNode;
  requestFullScreen: (element: Element) => void;
  setIsFullScreen: (isFullScreen: boolean) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [alertContent, setAlertContent] = useState<AlertProps | null>(null);
 


  const showAlert = (props: AlertProps) => {
    setAlertContent(props);
    setIsOpen(true);
  };

  const hideAlert = () => {
    setIsOpen(false);
    setAlertContent(null);
    requestFullScreen(document.documentElement);
    setIsFullScreen(true);
   
  };

  React.useEffect(() => {
    window.alertSystem = { showAlert, hideAlert };
    return () => {
      window.alertSystem = undefined;
    };
  }, []);




  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alertContent && (        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogContent className="max-w-md rounded-lg p-0 overflow-hidden bg-background border-border shadow-4dp">
            <div className="flex flex-col items-center px-6 pt-8 pb-6 gap-4">
              <AlertIcon />

              <AlertDialogTitle className="text-foreground text-xl font-semibold m-0">
                {alertContent.title}
              </AlertDialogTitle>

              {alertContent.violationCount && (
                <div className="bg-destructive/10 text-destructive border border-destructive/20 py-1 px-4 rounded-full text-sm">
                  Violation Count: {alertContent.violationCount}
                </div>
              )}

              <AlertDialogDescription className="text-center text-muted-foreground m-0 max-w-sm">
                {alertContent.description}
              </AlertDialogDescription>
            </div>

            <AlertDialogFooter className="flex justify-center p-6 pt-0 m-0">
              <div className="flex-grow flex justify-center">
                <Button
                  onClick={hideAlert}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-2 rounded-md text-sm shadow-2dp"
                >
                  Return to Assessment
                </Button>
              </div>
            </AlertDialogFooter>

          </AlertDialogContent>
        </AlertDialog>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const showProctoringAlert = (props: AlertProps) => {
  if (window.alertSystem) {
    window.alertSystem.showAlert(props);
  }
};