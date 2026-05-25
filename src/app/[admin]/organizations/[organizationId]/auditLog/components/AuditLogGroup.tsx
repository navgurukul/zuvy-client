import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { AuditLog, AuditLogGroupProps } from './auditLogTypes';

const getInitialsBgColor = (initials: string) => {
  const colors = ['bg-blue-100', 'bg-purple-100', 'bg-green-100', 'bg-yellow-100', 'bg-pink-100'];
  const charCode = initials.charCodeAt(0);
  return colors[charCode % colors.length];
};

export default function AuditLogGroup({ title, logs, groupKey, count }: AuditLogGroupProps) {
  const showDate = groupKey !== 'today';

  return (
    <div key={groupKey}>
      <div
        className="px-6 py-4 text-sm font-semibold text-slate-600"
        style={{ backgroundColor: 'hsl(48, 30%, 90%)', borderBottom: '2px solid hsl(48, 23%, 90%)' }}
      >
        <span>{title} ({count})</span>
      </div>

      <div className="divide-y divide-slate-50 text-start">
        {logs.map((log, index) => (
          <React.Fragment key={log.id}>
            <div className="px-6 py-5 hover:bg-slate-50 transition-colors">
              <div className="space-y-3">
                {/* Main Entry Row */}
                <div className="flex gap-5 items-start group">
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getInitialsBgColor(log.user.initials)} flex items-center justify-center border-2 border-slate-200 shadow-sm`}>
                    <span className="text-xs font-bold text-foreground">
                      {log.user.initials}
                    </span>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-sm leading-relaxed">
                          <span className="font-bold text-foreground">{log.user.name}</span>
                          <span className="text-muted-foreground ml-2 text-xs">({log.user.email})</span>
                          <span className="mx-2 text-muted-foreground">{log.action}</span>
                          {(() => {
                            // List of prepositions to render as normal text
                            const prepositions = ['to', 'in', 'from', 'for'];
                            // Helper to check if inside quotes
                            let inQuotes = false;
                            // Split on quotes to handle quoted and unquoted segments
                            const quoteSplit = log.target.split(/(\")/g); // ✅ Escaped quote
                            let afterPrep = false;
                            return quoteSplit.map((segment, i) => {
                              if (segment === '"') {
                                inQuotes = !inQuotes;
                                return <span key={i}>&quot;</span>; {/* ✅ Used HTML entity */}
                              }
                              if (inQuotes) {
                                // Everything inside quotes: bold, same color
                                return <span key={i} className="font-bold text-foreground">{segment}</span>;
                              }
                              // Outside quotes: split on prepositions
                              const parts = segment.split(new RegExp(` (${prepositions.join('|')}) `, 'g'));
                              return parts.map((part, idx) => {
                                if (prepositions.includes(part)) {
                                  afterPrep = true;
                                  return (
                                    <span key={i + '-' + idx} className="text-foreground"> {part} </span>
                                  );
                                }
                                if (afterPrep && part.trim() !== '') {
                                  afterPrep = false;
                                  return (
                                    <span key={i + '-' + idx} className="font-bold text-muted-foreground">{part}</span>
                                  );
                                }
                                return (
                                  <span key={i + '-' + idx} className="font-bold text-foreground">{part}</span>
                                );
                              });
                            });
                          })()}
                        </div>
                        
                        {/* Module Badge - Moved to bottom */}
                        <div className="mt-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                            {log.module}
                          </span>
                        </div>
                      </div>
                      
                      {/* Time Badge */}
                      <div className="flex-shrink-0">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md border border-border/40">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {showDate && log.dateLabel ? `${log.dateLabel}, ${log.timestamp}` : log.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Box - Only show when needed */}
                {log.showDetails && (
                  <div className="ml-14 pl-4 py-2 border-l-2 border-border/40">
                    <div className="flex flex-col gap-2 w-full">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        Property Update
                      </span>
                      {/* Topics/Items as chips */}
                      {log.details.items && log.details.items.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {log.details.items.map((item, idx) => (
                            <span 
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-accent text-accent-foreground border border-accent/30"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-muted/20 text-muted-foreground">
                            {log.details.from}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-success/10 text-success">
                            {log.details.to}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {index < logs.length - 1 && (
              <div className="mx-6 border-t border-border/60" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}