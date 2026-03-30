import { Send, Save, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface FinalActionsSectionProps {
  setName: string;
  onAction: (action: 'publish' | 'draft' | 'schedule') => void;
}

export function FinalActionsSection({ setName, onAction }: FinalActionsSectionProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const actions = [
    {
      id: 'publish',
      icon: Send,
      title: 'Publish',
      description: 'Make available to students now',
      gradient: 'from-emerald-500/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-600',
      selectedBorder: 'border-emerald-500/60',
      selectedBg: 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5',
      accentColor: 'emerald',
      delay: 0,
    },
    {
      id: 'draft',
      icon: Save,
      title: 'Save as Draft',
      description: 'Edit and publish later',
      gradient: 'from-blue-500/20 to-blue-500/5',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-600',
      selectedBorder: 'border-blue-500/60',
      selectedBg: 'bg-gradient-to-br from-blue-500/10 to-blue-500/5',
      accentColor: 'blue',
      delay: 1,
    },
    {
      id: 'schedule',
      icon: Clock,
      title: 'Schedule',
      description: 'Set a specific date and time',
      gradient: 'from-purple-500/20 to-purple-500/5',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-600',
      selectedBorder: 'border-purple-500/60',
      selectedBg: 'bg-gradient-to-br from-purple-500/10 to-purple-500/5',
      accentColor: 'purple',
      delay: 2,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="overflow-hidden">
        <div className="animate-fade-in-down">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Finalize Assessment
          </h2>
          <p className="text-sm text-text-secondary mt-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Choose your deployment strategy
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes card-enter {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes icon-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes icon-rotate-clockwise {
          from {
            transform: rotate(0deg) scale(1);
          }
          to {
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes icon-pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.12);
          }
        }

        @keyframes icon-slide {
          0%, 100% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(3px);
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(var(--color-rgb), 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(var(--color-rgb), 0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes button-entrance {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animate-card-enter {
          animation: card-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animate-icon-float {
          animation: icon-float 3s ease-in-out infinite;
        }

        .animate-icon-rotate {
          animation: icon-rotate-clockwise 4s linear infinite;
        }

        .animate-icon-pulse {
          animation: icon-pulse-scale 2s ease-in-out infinite;
        }

        .animate-icon-slide {
          animation: icon-slide 2s ease-in-out infinite;
        }

        .glow-effect {
          transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
        }

        .glow-effect.active {
          animation: glow-pulse 2s infinite;
        }

        .shimmer-effect {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }

        .button-entrance {
          animation: button-entrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @supports (backdrop-filter: blur(1px)) {
          .glass-effect {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.02);
          }
        }
      `}</style>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          const isSelected = selectedAction === action.id;
          
          return (
            <button
              key={action.id}
              onClick={() => setSelectedAction(action.id)}
              className={cn(
                'group relative animate-card-enter',
                'rounded-2xl border-2 text-left overflow-hidden transition-all duration-500 ease-out',
              )}
              style={{
                animationDelay: `${idx * 100}ms`,
              }}
            >
              {/* Animated background */}
              <div className={cn(
                'absolute inset-0 transition-all duration-500',
                isSelected 
                  ? cn(action.selectedBg, action.selectedBorder, 'border-2')
                  : cn(`bg-gradient-to-br ${action.gradient}`, action.borderColor, 'border-2')
              )} />

              {/* Shimmer overlay on hover */}
              <div className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                'shimmer-effect'
              )} />

              <div className={cn(
                'relative p-6 space-y-4 glass-effect',
              )}>
                <div className="flex items-start justify-between">
                  {/* Icon Container */}
                  <div className={cn(
                    'p-3 rounded-xl transition-all duration-500',
                    'group-hover:shadow-lg group-hover:shadow-current/20',
                    isSelected 
                      ? cn(action.selectedBg, 'shadow-lg')
                      : `bg-${action.textColor}/5 group-hover:bg-${action.textColor}/10`
                  )}>
                    <Icon className={cn(
                      'h-6 w-6 transition-all duration-500',
                      isSelected ? action.textColor : `text-text-secondary group-hover:${action.textColor}`,
                      isSelected && (
                        action.id === 'schedule' ? 'animate-icon-rotate' :
                        action.id === 'draft' ? 'animate-icon-pulse' :
                        'animate-icon-slide'
                      )
                    )} />
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="relative">
                      <div className={cn(
                        'w-6 h-6 rounded-full border-2 border-transparent',
                        `bg-gradient-to-r from-${action.accentColor}-500 to-${action.accentColor}-600`,
                        'flex items-center justify-center glow-effect active',
                        'shadow-lg'
                      )}>
                        <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Text content */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-foreground transition-colors duration-300">
                    {action.title}
                  </h4>
                  <p className={cn(
                    'text-xs transition-all duration-300',
                    isSelected ? action.textColor : 'text-text-secondary group-hover:text-text-secondary/80'
                  )}>
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Hover border glow */}
              <div className={cn(
                'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
                `border-2 border-${action.accentColor}-500/30`
              )} />
            </button>
          );
        })}
      </div>

      {/* Confirm Button */}
      {selectedAction && (
        <div className="button-entrance">
          <Button 
            onClick={() => onAction(selectedAction as 'publish' | 'draft' | 'schedule')}
            className={cn(
              'w-full group relative overflow-hidden',
              'bg-gradient-to-r from-primary to-primary/80',
              'hover:from-primary/95 hover:to-primary/75',
              'text-white font-semibold py-6 rounded-2xl',
              'shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40',
              'transition-all duration-500 ease-out',
              'active:scale-95 active:shadow-lg active:shadow-primary/20'
            )}
          >
            <span className="relative flex items-center justify-center gap-3">
              {selectedAction === 'publish' && (
                <>
                  <Send className="h-5 w-5 group-hover:animate-icon-slide transition-all" />
                  <span>Publish Assessment Now</span>
                </>
              )}
              {selectedAction === 'draft' && (
                <>
                  <Save className="h-5 w-5 group-hover:animate-icon-pulse transition-all" />
                  <span>Save as Draft</span>
                </>
              )}
              {selectedAction === 'schedule' && (
                <>
                  <Clock className="h-5 w-5 group-hover:animate-icon-rotate transition-all" />
                  <span>Schedule Assessment</span>
                </>
              )}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
