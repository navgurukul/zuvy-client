import { Send, Save, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { usePublishAssessment } from '@/hooks/usePublishAssessment';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FinalActionsSectionProps {
  setName: string;
  assessmentId?: number;
  onAction: (action: 'publish' | 'draft' | 'schedule') => void;
}

export function FinalActionsSection({ setName, assessmentId, onAction }: FinalActionsSectionProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const { publishAssessment, isLoading: isPublishing } = usePublishAssessment();

  const handlePublishClick = () => {
    if (selectedAction === 'publish') {
      setShowPublishDialog(true);
    } else {
      onAction(selectedAction as 'publish' | 'draft' | 'schedule');
    }
  };

  const handlePublishConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error({
        title: 'Date & Time Required',
        description: 'Please select both date and time for the assessment end.',
      });
      return;
    }

    if (!assessmentId) {
      toast.error({
        title: 'Missing Assessment ID',
        description: 'Assessment ID is required to publish.',
      });
      return;
    }

    try {
      // Parse time string (HH:MM)
      const [hours, minutes] = selectedTime.split(':');
      const dateTime = new Date(selectedDate);
      dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const endDatetime = dateTime.toISOString();

      await publishAssessment(assessmentId, { endDatetime });
      toast.success({
        title: 'Assessment Published',
        description: 'Your assessment has been published successfully.',
      });
      setShowPublishDialog(false);
      setSelectedDate(undefined);
      setSelectedTime('');
      setSelectedAction(null);
      onAction('publish');
    } catch (err) {
      // Error is already handled in the hook and toast
    }
  };

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
    <div className="space-y-4">
      {/* Header */}
      <div className="overflow-hidden">
        <div className="animate-fade-in-down">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Finalize Assessment
          </h2>
          <p className="text-xs text-text-secondary mt-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          const isSelected = selectedAction === action.id;
          
          return (
            <button
              key={action.id}
              onClick={() => setSelectedAction(action.id)}
              className={cn(
                'group relative animate-card-enter',
                'rounded-xl border text-left overflow-hidden transition-all duration-300 ease-out',
              )}
              style={{
                animationDelay: `${idx * 100}ms`,
              }}
            >
              {/* Animated background */}
              <div className={cn(
                'absolute inset-0 transition-all duration-300',
                isSelected 
                  ? cn(action.selectedBg, action.selectedBorder, 'border')
                  : cn(`bg-gradient-to-br ${action.gradient}`, action.borderColor, 'border')
              )} />

              {/* Shimmer overlay on hover */}
              <div className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-300',
                'shimmer-effect'
              )} />

              <div className={cn(
                'relative p-3 space-y-2 glass-effect',
              )}>
                <div className="flex items-start justify-between">
                  {/* Icon Container */}
                  <div className={cn(
                    'p-2 rounded-lg transition-all duration-300',
                    'group-hover:shadow-md group-hover:shadow-current/15',
                    isSelected 
                      ? cn(action.selectedBg, 'shadow-md')
                      : `bg-${action.textColor}/5 group-hover:bg-${action.textColor}/10`
                  )}>
                    <Icon className={cn(
                      'h-5 w-5 transition-all duration-300',
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
                        'w-5 h-5 rounded-full border-2 border-transparent',
                        `bg-gradient-to-r from-${action.accentColor}-500 to-${action.accentColor}-600`,
                        'flex items-center justify-center',
                        'shadow-md'
                      )}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Text content */}
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-foreground group-hover:text-foreground transition-colors duration-300">
                    {action.title}
                  </h4>
                  <p className={cn(
                    'text-xs transition-all duration-300 leading-tight',
                    isSelected ? action.textColor : 'text-text-secondary group-hover:text-text-secondary/80'
                  )}>
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Hover border glow */}
              <div className={cn(
                'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',
                `border border-${action.accentColor}-500/20`
              )} />
            </button>
          );
        })}
      </div>

      {/* Confirm Button */}
      {selectedAction && (
        <div className="button-entrance">
          <Button 
            onClick={handlePublishClick}
            disabled={isPublishing}
            className={cn(
              'w-full group relative overflow-hidden',
              'bg-gradient-to-r from-primary to-primary/80',
              'hover:from-primary/95 hover:to-primary/75',
              'text-white font-medium py-2 px-4 rounded-lg text-sm',
              'shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30',
              'transition-all duration-300 ease-out',
              'active:scale-98 active:shadow-md active:shadow-primary/15',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <span className="relative flex items-center justify-center gap-2">
              {isPublishing && <Loader2 className="h-4 w-4 animate-spin" />}
              {!isPublishing && selectedAction === 'publish' && (
                <>
                  <Send className="h-4 w-4" />
                  <span>Publish Assessment Now</span>
                </>
              )}
              {!isPublishing && selectedAction === 'draft' && (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save as Draft</span>
                </>
              )}
              {!isPublishing && selectedAction === 'schedule' && (
                <>
                  <Clock className="h-4 w-4" />
                  <span>Schedule Assessment</span>
                </>
              )}
            </span>
          </Button>
        </div>
      )}

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="w-1/4 p-0">
          <div className="overflow-hidden rounded-lg">
            <Card className="border-0 shadow-none">
              <CardContent className="p-4">
                <DialogHeader className="mb-4">
                  <DialogTitle>Set Assessment End Date & Time</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      const today = new Date();
                      const checkDate = new Date(date);
                      today.setHours(0, 0, 0, 0);
                      checkDate.setHours(0, 0, 0, 0);
                      return checkDate < today;
                    }}
                    className="p-0"
                  />
                </div>
              </CardContent>
              {selectedDate && (
                <CardFooter className="border-t bg-card p-4 flex-col gap-4">
                  <div className="w-full space-y-2">
                    <Label htmlFor="end-time" className="text-sm flex">End Time</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger id="end-time" className="w-full">
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 48 }, (_, i) => {
                          const hours = Math.floor(i / 2);
                          const minutes = (i % 2) * 30;
                          const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                          return (
                            <SelectItem key={timeString} value={timeString}>
                              {timeString}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-text-secondary">
                      Students will not be able to attempt after this date and time.
                    </p>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
          <DialogFooter className="px-6 py-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowPublishDialog(false);
                setSelectedDate(undefined);
                setSelectedTime('');
              }}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublishConfirm}
              disabled={isPublishing || !selectedDate || !selectedTime}
              className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Assessment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
