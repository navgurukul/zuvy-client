import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[520px] md:max-w-[600px] gap-4",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center space-x-6 overflow-hidden rounded-2xl border-0 backdrop-blur-xl p-6 transition-all duration-500 ease-out data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full hover:scale-[1.02] transform-gpu min-h-[100px] max-w-full shadow-[0_8px_25px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_12px_35px_rgba(0,0,0,0.35)]",
  {
    variants: {
      variant: {
        default: 
          "bg-gradient-to-br from-white/95 via-slate-50/95 to-white/90 text-slate-900 ring-1 ring-slate-200/60 dark:from-slate-800/95 dark:via-slate-900/95 dark:to-slate-800/90 dark:text-slate-50 dark:ring-slate-700/60",
        success:
          "bg-gradient-to-br from-emerald-50/95 via-green-50/95 to-emerald-100/90 text-emerald-900 ring-1 ring-emerald-200/60 shadow-emerald-500/20 dark:from-emerald-950/95 dark:via-emerald-900/95 dark:to-emerald-950/90 dark:text-emerald-50 dark:ring-emerald-800/60 dark:shadow-emerald-500/30",
        error:
          "bg-gradient-to-br from-red-50/95 via-rose-50/95 to-red-100/90 text-red-900 ring-1 ring-red-200/60 shadow-red-500/20 dark:from-red-950/95 dark:via-red-900/95 dark:to-red-950/90 dark:text-red-50 dark:ring-red-800/60 dark:shadow-red-500/30",
        warning:
          "bg-gradient-to-br from-amber-50/95 via-yellow-50/95 to-amber-100/90 text-amber-900 ring-1 ring-amber-200/60 shadow-amber-500/20 dark:from-amber-950/95 dark:via-amber-900/95 dark:to-amber-950/90 dark:text-amber-50 dark:ring-amber-800/60 dark:shadow-amber-500/30",
        info:
          "bg-gradient-to-br from-blue-50/95 via-sky-50/95 to-blue-100/90 text-blue-900 ring-1 ring-blue-200/60 shadow-blue-500/20 dark:from-blue-950/95 dark:via-blue-900/95 dark:to-blue-950/90 dark:text-blue-50 dark:ring-blue-800/60 dark:shadow-blue-500/30",
        destructive:
          "bg-gradient-to-br from-red-50/95 via-rose-50/95 to-red-100/90 text-red-900 ring-1 ring-red-200/60 shadow-red-500/20 dark:from-red-950/95 dark:via-red-900/95 dark:to-red-950/90 dark:text-red-50 dark:ring-red-800/60 dark:shadow-red-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants> & { duration?: number }
>(({ className, variant, duration = 4000, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      duration={duration}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: string }
>(({ className, variant, ...props }, ref) => {
  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />;
      case "error":
      case "destructive":
        return <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />;
      case "warning":
        return <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />;
      case "info":
        return <Info className="h-8 w-8 text-blue-600 dark:text-blue-400" />;
      default:
        return <Info className="h-8 w-8 text-slate-600 dark:text-slate-400" />;
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl shadow-lg backdrop-blur-sm",
        {
          "bg-gradient-to-br from-emerald-100/80 to-emerald-200/80 dark:from-emerald-900/60 dark:to-emerald-800/60": variant === "success",
          "bg-gradient-to-br from-red-100/80 to-red-200/80 dark:from-red-900/60 dark:to-red-800/60": variant === "error" || variant === "destructive",
          "bg-gradient-to-br from-amber-100/80 to-amber-200/80 dark:from-amber-900/60 dark:to-amber-800/60": variant === "warning",
          "bg-gradient-to-br from-blue-100/80 to-blue-200/80 dark:from-blue-900/60 dark:to-blue-800/60": variant === "info",
          "bg-gradient-to-br from-slate-100/80 to-slate-200/80 dark:from-slate-900/60 dark:to-slate-800/60": variant === "default",
        },
        className
      )}
      {...props}
    >
      {getIcon()}
    </div>
  );
});
ToastIcon.displayName = "ToastIcon"

const ToastProgress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    variant?: string;
    duration?: number;
    messageLength?: number;
  }
>(({ className, variant, duration, messageLength = 0, ...props }, ref) => {
  const [progress, setProgress] = React.useState(0);

  // Calculate dynamic duration based on message length
  const getDynamicDuration = () => {
    if (duration) return duration;
    
    // Base duration of 3 seconds, add time for longer messages
    const baseDuration = 3000;
    const additionalTime = Math.min(messageLength * 50, 2000); // Max 2 seconds additional
    return baseDuration + additionalTime;
  };

  const finalDuration = getDynamicDuration();

  React.useEffect(() => {
    setProgress(0);
    const interval = 50;
    const increment = (interval / finalDuration) * 100;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [finalDuration]);

  const getProgressColor = () => {
    switch (variant) {
      case "success":
        return "bg-emerald-500 dark:bg-emerald-400";
      case "error":
      case "destructive":
        return "bg-red-500 dark:bg-red-400";
      case "warning":
        return "bg-amber-500 dark:bg-amber-400";
      case "info":
        return "bg-blue-500 dark:bg-blue-400";
      default:
        return "bg-slate-500 dark:bg-slate-400";
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 rounded-b-2xl overflow-hidden",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full transition-all duration-300 ease-out rounded-b-2xl absolute left-0",
          getProgressColor()
        )}
        style={{ 
          width: `${progress}%`,
          marginLeft: "auto"
        }}
      />
    </div>
  );
});
ToastProgress.displayName = "ToastProgress";

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-9 shrink-0 items-center justify-center rounded-lg border bg-transparent px-4 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-6 top-1/2 -translate-y-1/2 rounded-full p-1 text-foreground/60 opacity-70 transition-all duration-300 hover:text-foreground hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 group-hover:opacity-100 hover:scale-110",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-5 w-5" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-tight mb-2 text-left", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-base opacity-90 leading-relaxed text-left", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

const ToastContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 min-w-0 pr-8", className)}
    {...props}
  />
));
ToastContent.displayName = "ToastContent";

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast> & {
  duration?: number;
};
type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastIcon,
  ToastContent,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastProgress,
};