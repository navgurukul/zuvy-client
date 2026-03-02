'use client'

import React, { useMemo, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import AuditLogGroup from './components/AuditLogGroup';
import AuditLogExport from './components/AuditLogExport';
import { SearchBox } from '@/utils/searchBox';
import { AuditLog } from './components/auditLogTypes';
import { useTrackingLog } from '@/hooks/useTrackingLog';
import { useSearchWithSuggestions } from '@/utils/useUniversalSearchDynamic';
import { api } from '@/utils/axios.config';
import { getUser } from '@/store/store';

export default function AuditLogPage() {
  const { organizationId } = useParams();
  const [actualSearchTerm, setActualSearchTerm] = useState(''); // This will trigger the API call
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const INITIAL_BATCH_SIZE = 20;
  const LOAD_MORE_BATCH_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);

  // Get user and org info (same pattern as courses page)
  const { user } = getUser();
  const userRole = user?.rolesList?.[0]?.toLowerCase() || '';
  const isSuperAdmin = userRole === 'super_admin';
  const orgId = isSuperAdmin ? Number(organizationId) : user?.orgId;

  // Use the tracking log hook with current filter values - using actual search term
  const { trackingLogs, loading, error, totalRows, refetch } = useTrackingLog({
    limit: 100,
    offset: 0,
    role: selectedRole !== 'all' ? selectedRole : undefined,
    action: selectedAction !== 'all' ? selectedAction : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    timeRange: selectedTimeRange,
    search: actualSearchTerm || undefined
  });

  // Fetch all data without filters to get available options for dropdowns
  const { trackingLogs: allLogs } = useTrackingLog({
    limit: 1000, // Get more records to extract all possible values
    initialFetch: true
  });

  // Set initial load to false after first successful load
  useEffect(() => {
    if (!loading && trackingLogs && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [loading, trackingLogs, isInitialLoad]);

  // Current filters for export
  const currentFilters = useMemo(() => ({
    role: selectedRole !== 'all' ? selectedRole : undefined,
    action: selectedAction !== 'all' ? selectedAction : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    timeRange: selectedTimeRange,
    search: actualSearchTerm || undefined
  }), [selectedRole, selectedAction, selectedStatus, selectedTimeRange, actualSearchTerm]);

  // Extract unique values from API data for dropdowns
  const filterOptions = useMemo(() => {
    if (!Array.isArray(allLogs) || allLogs.length === 0) {
      return {
        roles: [],
        actions: [],
        statuses: [],
        timeRanges: ['all', 'today', 'past7Days', 'past30Days']
      };
    }

    // Extract unique roles from actorRoles arrays
    const rolesSet = new Set<string>();
    allLogs.forEach(log => {
      if (log.actorRoles && Array.isArray(log.actorRoles)) {
        log.actorRoles.forEach(role => rolesSet.add(role));
      }
    });

    // Extract unique actions
    const actionsSet = new Set<string>();
    allLogs.forEach(log => {
      if (log.action) actionsSet.add(log.action);
    });

    // Extract unique statuses
    const statusesSet = new Set<string>();
    allLogs.forEach(log => {
      if (log.status) statusesSet.add(log.status);
    });

    return {
      roles: Array.from(rolesSet).sort(),
      actions: Array.from(actionsSet).sort(),
      statuses: Array.from(statusesSet).sort(),
      timeRanges: ['all', 'today', 'past7Days', 'past30Days']
    };
  }, [allLogs]);

  // Backend API function for search suggestions (same pattern as courses page)
  const fetchSuggestionsApi = useCallback(async (query: string) => {
    if (orgId === undefined) return [];
    if (!query || query.length < 2) return [];
    
    try {
      console.log('FETCHING AUDIT LOG SUGGESTIONS FOR:', query);
      
      // Call tracking log API with search query
      const response = await api.get(
        `/trackinglog?orgId=${orgId}&limit=10&offset=0&search=${encodeURIComponent(query)}&timeRange=all`
      );
      
      console.log('Audit Log Suggestions API Response:', response.data);
      
      if (response.data?.success && response.data?.data?.logs) {
        const logs = response.data.data.logs;
        
        // Extract unique simple suggestions
        const suggestions = new Set<string>();
        
        logs.forEach((log: any) => {
          // Add actor names only if they match the query
          if (log.actorName && log.actorName.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(log.actorName);
          }
          
          // Add actions (formatted) only if they match
          if (log.action) {
            const formattedAction = log.action.replace(/_/g, ' ');
            if (formattedAction.toLowerCase().includes(query.toLowerCase())) {
              suggestions.add(formattedAction);
            }
          }
          
          // Add resource types only if they match
          if (log.resourceType && log.resourceType.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(log.resourceType);
          }
        });

        // Return Suggestion objects (first 8)
        return Array.from(suggestions).slice(0, 8).map((text, index) => ({ id: String(index), label: text }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching audit log suggestions:', error);
      return [];
    }
  }, [orgId]);

  const fetchSearchResultsApi = useCallback(async (query: string) => {
    console.log("AUDIT LOG SEARCH API CALLED", { query });
    
    // This will trigger the actual search
    setActualSearchTerm(query);
    setVisibleCount(INITIAL_BATCH_SIZE);
    return [];
  }, []);

  const defaultFetchApi = useCallback(async () => {
    console.log("AUDIT LOG DEFAULT FETCH API CALLED");
    
    // Clear search and reset to default view
    setActualSearchTerm('');
    setVisibleCount(INITIAL_BATCH_SIZE);
    return [];
  }, []);

  // Use the search hook (same as courses page)
  const { clearSearch } = useSearchWithSuggestions({
    fetchSuggestionsApi,
    fetchSearchResultsApi,
    defaultFetchApi,
  });

  // Get suggestion label for display (simple text only)
  const getSuggestionLabel = useCallback((suggestion: any) => {
    if (typeof suggestion === 'string') {
      return (
        <div className="capitalize font-medium text-foreground">
          {suggestion}
        </div>
      );
    }
    
    if (typeof suggestion === 'object' && suggestion !== null) {
      return (
        <div className="capitalize font-medium text-foreground">
          {suggestion.label || suggestion.name || String(suggestion)}
        </div>
      );
    }
    
    return String(suggestion);
  }, []);

  const getSuggestionValue = useCallback((suggestion: any) => {
    if (typeof suggestion === 'string') {
      return suggestion;
    }
    
    if (typeof suggestion === 'object' && suggestion !== null) {
      return suggestion.name || suggestion.value || suggestion.label || String(suggestion);
    }
    
    return String(suggestion);
  }, []);

  // Transform API data to match your UI component format
  const transformedLogs = useMemo(() => {
    if (!Array.isArray(trackingLogs) || trackingLogs.length === 0) {
      return [];
    }

    return trackingLogs.map((log) => {
      // Extract user initials from actorName
      const getInitials = (name: string) => {
        return name
          .split(' ')
          .map(word => word.charAt(0).toUpperCase())
          .slice(0, 2)
          .join('');
      };

      // Determine time grouping based on createdAt timestamp
      const logDate = new Date(log.createdAt);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 3600 * 24));
      
      let dateGroup: 'today' | 'thisWeek' | 'older' = 'older';
      let dateLabel = logDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      if (diffInDays === 0) {
        dateGroup = 'today';
        dateLabel = '';
      } else if (diffInDays <= 7) {
        dateGroup = 'thisWeek';
        dateLabel = diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
      }

      // Format timestamp
      const timeString = logDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      // Map actor roles to UI roles
      const mapRole = (roles: string[]) => {
        const role = roles[0]?.toLowerCase();
        switch (role) {
          case 'admin': return 'Admin';
          case 'instructor': return 'Instructor';
          case 'ops': return 'Ops';
          default: return 'Admin';
        }
      };

      const auditLog: AuditLog = {
        id: log.id.toString(),
        user: {
          name: log.actorName,
          email: log.actorEmail,
          initials: getInitials(log.actorName),
        },
        action: log.action,
        module: log.resourceType,
        target: log.description,
        timestamp: timeString,
        dateLabel: dateLabel || undefined,
        details: {
          type: 'STATUS',
          from: '',
          to: log.status,
        },
        showDetails: Boolean(log.status && log.status !== 'success'),
        userRole: mapRole(log.actorRoles) as 'Admin' | 'Instructor' | 'Ops',
        category: log.resourceType?.toUpperCase() || 'SYSTEM',
        date: dateGroup,
      };

      return auditLog;
    });
  }, [trackingLogs]);

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const visibleLogs = transformedLogs.slice(0, visibleCount);
    return {
      today: visibleLogs.filter(log => log.date === 'today'),
      thisWeek: visibleLogs.filter(log => log.date === 'thisWeek'),
      older: visibleLogs.filter(log => log.date === 'older'),
    };
  }, [transformedLogs, visibleCount]);

  const hasMore = transformedLogs.length > visibleCount;

  // Handle filter changes and refetch data
  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  const handleActionChange = (value: string) => {
    setSelectedAction(value);
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  const handleTimeRangeChange = (value: string) => {
    setSelectedTimeRange(value);
    setVisibleCount(INITIAL_BATCH_SIZE);
  };

  // Refetch data when actual search term or other filters change
  useEffect(() => {
    refetch({
      role: selectedRole !== 'all' ? selectedRole : undefined,
      action: selectedAction !== 'all' ? selectedAction : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      timeRange: selectedTimeRange,
      search: actualSearchTerm || undefined,
      offset: 0,
      limit: 100
    });
  }, [selectedRole, selectedAction, selectedStatus, selectedTimeRange, actualSearchTerm, refetch]);

  // Only show full loading screen on initial load
  if (isInitialLoad && loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading audit logs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && isInitialLoad) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading audit logs</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="flex text-start items-center justify-between mb-8">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-h5">User Activity Log</h1>
            {/* Subtle loading indicator for filter changes */}
            {loading && !isInitialLoad && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
          </div>
          <p className="text-muted-foreground">
            Track and monitor all actions performed within your workspace
          </p>
        </div>
        
        {/* Export Button with current filters */}
        <AuditLogExport 
          orgId={orgId} 
          currentFilters={currentFilters}
        />
      </div>

      {/* Filters Section */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <SearchBox
          placeholder="Search by user, action, or module..."
          fetchSuggestionsApi={fetchSuggestionsApi}
          fetchSearchResultsApi={fetchSearchResultsApi}
          defaultFetchApi={defaultFetchApi}
          getSuggestionLabel={getSuggestionLabel}
          getSuggestionValue={getSuggestionValue}
          inputWidth="flex-1 max-w-sm"
        />

        {/* Role Filter */}
        <Select value={selectedRole} onValueChange={handleRoleChange} disabled={loading}>
          <SelectTrigger className="w-[150px] mt-2">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {filterOptions.roles.map((role) => (
              <SelectItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Action Filter */}
        <Select value={selectedAction} onValueChange={handleActionChange} disabled={loading}>
          <SelectTrigger className="w-[150px] mt-2">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {filterOptions.actions.map((action) => (
              <SelectItem key={action} value={action}>
                {action.replace(/_/g, ' ').charAt(0).toUpperCase() + action.replace(/_/g, ' ').slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={selectedStatus} onValueChange={handleStatusChange} disabled={loading}>
          <SelectTrigger className="w-[150px] mt-2">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {filterOptions.statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Time Range Filter */}
        <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange} disabled={loading}>
          <SelectTrigger className="w-[150px] mt-2">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="past7Days">Past 7 Days</SelectItem>
            <SelectItem value="past30Days">Past 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content - Audit Log with API Data */}
      <div className={`space-y-6 ${loading && !isInitialLoad ? 'opacity-75' : ''} transition-opacity`}>
        {groupedLogs.today.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
            <AuditLogGroup
              title="Today"
              logs={groupedLogs.today}
              groupKey="today"
              count={groupedLogs.today.length}
            />
          </div>
        )}
        {groupedLogs.thisWeek.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
            <AuditLogGroup
              title="This Week"
              logs={groupedLogs.thisWeek}
              groupKey="thisWeek"
              count={groupedLogs.thisWeek.length}
            />
          </div>
        )}
        {groupedLogs.older.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
            <AuditLogGroup
              title="Older"
              logs={groupedLogs.older}
              groupKey="older"
              count={groupedLogs.older.length}
            />
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center py-4">
            <Button
              variant="outline"
              onClick={() => setVisibleCount(visibleCount + LOAD_MORE_BATCH_SIZE)}
              disabled={loading}
            >
              Load More
            </Button>
          </div>
        )}

        {transformedLogs.length === 0 && !loading && (
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-slate-600">
            <p>No audit logs found for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
