export interface AuditLog {
  id: string;
  user: {
    name: string;
    email: string;
    initials: string;
  };
  action: string;
  module: string;
  target: string;
  timestamp: string;
  dateLabel?: string;
  details: {
    type: string;
    from: string;
    to: string;
    items?: string[]; 
  };
  showDetails?: boolean;
  userRole: 'Admin' | 'Instructor' | 'Ops';
  category: string;
  date: 'today' | 'thisWeek' | 'older';
}

export interface AuditLogGroupProps {
  title: string;
  logs: AuditLog[];
  groupKey: 'today' | 'thisWeek' | 'older';
  count: number;
}