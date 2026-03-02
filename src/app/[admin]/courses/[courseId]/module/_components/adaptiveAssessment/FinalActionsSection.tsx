import { Send, Save, Clock, CheckCircle, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      title: 'Publish Now',
      description: 'Make this assessment immediately available to students',
      gradient: 'from-success to-success-dark',
      bgLight: 'bg-success/10',
      borderColor: 'border-success/30',
      hoverBorder: 'hover:border-success/60',
    },
    {
      id: 'draft',
      icon: Save,
      title: 'Save as Draft',
      description: 'Save for later editing before publishing',
      gradient: 'from-secondary to-secondary-dark',
      bgLight: 'bg-secondary/10',
      borderColor: 'border-secondary/30',
      hoverBorder: 'hover:border-secondary/60',
    },
    {
      id: 'schedule',
      icon: Clock,
      title: 'Schedule for Future',
      description: 'Set a specific date and time for publishing',
      gradient: 'from-info to-info-dark',
      bgLight: 'bg-info/10',
      borderColor: 'border-info/30',
      hoverBorder: 'hover:border-info/60',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center relative">
        {/* Background orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-success/20 to-accent/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-success to-success-dark mx-auto mb-6 flex items-center justify-center shadow-lg shadow-success/30 rotate-3 hover:rotate-0 transition-transform duration-500">
            <CheckCircle className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Almost There!</h2>
          <p className="text-text-secondary text-lg">
            Your assessment "<span className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{setName}</span>" is ready.
          </p>
          <p className="text-text-tertiary mt-1">Choose how you'd like to proceed.</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {actions.map(action => {
          const Icon = action.icon;
          const isSelected = selectedAction === action.id;
          
          return (
            <button
              key={action.id}
              onClick={() => setSelectedAction(action.id)}
              className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-500 overflow-hidden ${
                isSelected
                  ? `${action.borderColor} ${action.bgLight} scale-[1.02] shadow-xl`
                  : `border-border/50 bg-card/50 backdrop-blur-sm ${action.hoverBorder} hover:bg-card`
              }`}
            >
              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              <div className="relative">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-5 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h4 className="font-bold text-foreground text-lg mb-2">{action.title}</h4>
                <p className="text-sm text-text-secondary leading-relaxed">{action.description}</p>
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${action.gradient} flex items-center justify-center`}>
                    <CheckCircle className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Confirm Button */}
      <div className="flex justify-center pt-4">
        <div className="relative group">
          {selectedAction && (
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
          )}
          <Button
            onClick={() => selectedAction && onAction(selectedAction as 'publish' | 'draft' | 'schedule')}
            disabled={!selectedAction}
            className="relative px-12 h-14 text-lg font-bold bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary rounded-xl transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            size="lg"
          >
            <Rocket className="mr-2 h-5 w-5" />
            Confirm Action
          </Button>
        </div>
      </div>
    </div>
  );
}
