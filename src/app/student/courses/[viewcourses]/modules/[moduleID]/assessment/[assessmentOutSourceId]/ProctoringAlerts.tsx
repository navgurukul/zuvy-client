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
import {AlertContextType,AlertProviderProps,AlertProps}from '@/app/student/courses/[viewcourses]/modules/[moduleID]/assessment/[assessmentOutSourceId]/type'


const AlertContext = createContext<AlertContextType | null>(null);

// Custom Alert Icon Component
const AlertIcon = () => (
  <div className="w-8 h-8 rounded-full bg-red-500 border-4 border-black flex items-center justify-center relative">
    <span className="text-white text-xl font-bold">!</span>
  </div>
);

export const AlertProvider: React.FC<AlertProviderProps> = ({
  children,
  requestFullScreen,
  setIsFullScreen,
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
      {alertContent && (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogContent className="max-w-md rounded-lg p-0 overflow-hidden">
            <div className="flex flex-col items-center px-6 pt-8 pb-6 gap-4">
              <AlertIcon />

              <AlertDialogTitle className="text-gray-800 text-xl font-semibold m-0">
                {alertContent.title}
              </AlertDialogTitle>

              {alertContent.violationCount && (
                <div className="bg-red-50 text-red-500 py-1 px-4 rounded-full text-sm">
                  Violation Count: {alertContent.violationCount}
                </div>
              )}

              <AlertDialogDescription className="text-center text-gray-600 m-0 max-w-sm">
                {alertContent.description}
              </AlertDialogDescription>
            </div>

            <AlertDialogFooter className="flex justify-center p-6 pt-0 m-0">
              <div className="flex-grow flex justify-center">
                <Button
                  onClick={hideAlert}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-2 rounded-md text-sm"
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