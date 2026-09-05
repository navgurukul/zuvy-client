import { Card, CardContent } from "@/components/ui/card";
import { Plus, Sparkles } from "lucide-react";

interface ProfileStrengthCardProps {
  displayProgress: number;
  profileLevel: string;
  profileLevelColor: string;
  profileMessage: string;
  isProfileComplete: boolean;
  remainingProfilePercentage: number;
  remainingProfileMessage: string;
  onProfileClick: () => void;
}

const ProfileStrengthCard = ({
  displayProgress,
  profileLevel,
  profileLevelColor,
  profileMessage,
  isProfileComplete,
  remainingProfilePercentage,
  remainingProfileMessage,
  onProfileClick,
}: ProfileStrengthCardProps) => (
  <Card className="shadow-sm">
    <CardContent className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-xl font-heading font-bold">Profile Strength</h3>
        <span className="rounded-lg bg-primary-light px-3 py-1 text-xl font-semibold text-primary">
          {Math.round(displayProgress)}%
        </span>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="relative h-32 w-32">
          <svg className="h-32 w-32 -rotate-90 transform">
            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="none" className="text-muted" />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - displayProgress / 100)}`}
              className="text-primary transition-all duration-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-accent" />
          </div>
        </div>
      </div>

      <div className="mb-8 text-center">
        <p className="mb-1 text-base">
          Your profile is <span className={`font-semibold ${profileLevelColor}`}>{profileLevel}</span>.
        </p>
        <p className="text-sm text-muted-foreground">{profileMessage}</p>
      </div>

      <button
        onClick={onProfileClick}
        className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-primary-light p-4 transition-all hover:border-primary hover:bg-primary-light/80"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-card shadow-sm">
          <Plus className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-medium text-foreground">
            {isProfileComplete ? 'Review profile' : 'Complete profile'}
          </p>
          <p className="text-xs font-medium text-primary">
            {isProfileComplete ? 'All key details are filled out' : `${remainingProfilePercentage}% remaining`}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isProfileComplete ? 'Your profile is complete.' : remainingProfileMessage}
          </p>
        </div>
      </button>
    </CardContent>
  </Card>
);

export default ProfileStrengthCard;
