'use client';

import { Lock } from 'lucide-react';
import Image from 'next/image';

interface ChapterLockedViewProps {
  lockMessage?: string | null;
  chapterTitle?: string;
}

const ChapterLockedView = ({ lockMessage, chapterTitle }: ChapterLockedViewProps) => {
  const message =
    lockMessage ||
    'Please complete the previous chapter before accessing this chapter.';

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center -mt-16">
      {/* Mascot / illustration */}
      <div className="relative mb-4 w-72 h-72 flex items-center justify-center">
        <Image
          src="/images/undraw_lock.svg"
          alt="Locked chapter"
          width={280}
          height={280}
          className="object-contain w-full h-full"
          onError={(e) => {
            // fallback: hide the image if mascot isn't found
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      <h2 className="text-2xl font-heading font-bold mb-2">
        {chapterTitle ? `"${chapterTitle}" is locked` : 'Page doesn\'t open'}
      </h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        You don&apos;t have permission to access this chapter yet.
      </p>

      {/* Reason card */}
      <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-4 max-w-md w-full text-left">
        <div className="flex-shrink-0 mt-0.5 bg-muted rounded-full p-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-sm mb-1">Why?</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ChapterLockedView;
