import { ChevronRight, Sparkles, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RevealButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
}

const variantConfig = {
  primary: {
    gradient: 'from-primary via-primary-dark to-primary',
    shadow: 'shadow-primary/30',
    icon: Sparkles,
  },
  secondary: {
    gradient: 'from-secondary via-secondary-dark to-secondary',
    shadow: 'shadow-secondary/30',
    icon: Zap,
  },
  accent: {
    gradient: 'from-accent via-accent-dark to-accent',
    shadow: 'shadow-accent/30',
    icon: Star,
  },
};

export function RevealButton({ label, onClick, variant = 'primary' }: RevealButtonProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  
  return (
    <div className="flex justify-center py-10">
      <div className="relative group">
        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${config.gradient} rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500`} />
        
        {/* Button */}
        <Button
          onClick={onClick}
          className={`relative px-10 py-7 text-lg font-bold bg-gradient-to-r ${config.gradient} hover:shadow-2xl ${config.shadow} rounded-xl transition-all duration-500 group-hover:scale-105 border-0`}
        >
          <Icon className="mr-3 h-5 w-5 animate-pulse" />
          {label}
          <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
      </div>
    </div>
  );
}
