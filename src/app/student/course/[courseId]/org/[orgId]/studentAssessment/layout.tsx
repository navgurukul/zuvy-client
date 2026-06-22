import React from 'react';

export default function StudentAssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* No header - just the content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 