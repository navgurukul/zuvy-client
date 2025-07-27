'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TruncatedDescriptionProps {
  text: string;
  maxLength?: number;
  className?: string;
}

const TruncatedDescription = ({ 
  text, 
  maxLength = 150, 
  className = "" 
}: TruncatedDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate && !isExpanded ? text.slice(0, maxLength) + "..." : text;

  if (!shouldTruncate) {
    return <p className={className}>{text}</p>;
  }

  return (
    <div className="my-3">
      <p className={className}>{displayText}</p>
      <Button
        variant="link"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-0 h-auto text-primary text-sm mt-1 flex hover:underline items-center gap-1"
      >
        {isExpanded ? (
          <>
            Show less
            <ChevronUp className="w-3 h-3" />
          </>
        ) : (
          <>
            View More
            <ChevronDown className="w-3 h-3" />
          </>
        )}
      </Button>
    </div>
  );
};

export default TruncatedDescription; 