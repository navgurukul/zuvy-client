"use client"
import {
  Toast,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastIcon,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastProgress,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, duration = 2000, ...props }) {
        return (
          <Toast key={id} variant={variant} duration={duration} {...props}>
            <div className="flex items-start space-x-5 w-full">
              <ToastIcon variant={variant} />
              <ToastContent className="flex-1">
                {title && (
                  <ToastTitle className="text-lg font-semibold leading-tight mb-3 pr-10">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="text-base opacity-90 leading-relaxed pr-10">
                    {description}
                  </ToastDescription>
                )}
              </ToastContent>
              {action}
            </div>
            <ToastClose />
            <ToastProgress variant={variant} duration={duration} />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}