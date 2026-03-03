'use client'

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/utils/axios.config';
import { TrackingLogEntry } from '@/hooks/hookType';

interface AuditLogExportProps {
  orgId?: number;
  currentFilters: {
    role?: string;
    action?: string;
    status?: string;
    timeRange?: string;
    search?: string;
  };
}

export default function AuditLogExport({ orgId, currentFilters }: AuditLogExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const downloadCSV = (data: TrackingLogEntry[], filename: string) => {
    // CSV headers
    const headers = [
      'ID',
      'Date & Time',
      'User Name',
      'User Email',
      'Role',
      'Action',
      'Resource Type',
      'Description',
      'Status',
      'Organization ID'
    ];

    // Convert data to CSV rows
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(log => {
        const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
        };

        const formatField = (field: any) => {
          if (field === null || field === undefined) return '';
          
          // Convert to string and escape quotes
          const str = String(field);
          
          // If the field contains comma, newline, or quotes, wrap in quotes and escape internal quotes
          if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          
          return str;
        };

        return [
          formatField(log.id),
          formatField(formatDate(log.createdAt)),
          formatField(log.actorName),
          formatField(log.actorEmail),
          formatField(log.actorRoles?.join(', ') || ''),
          formatField(log.action),
          formatField(log.resourceType),
          formatField(log.description),
          formatField(log.status),
          formatField(log.orgId)
        ].join(',');
      })
    ];

    // Create and download CSV
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(link.href);
  };

  const handleExport = async () => {
    if (!orgId) {
      console.error('Organization ID is required for export');
      return;
    }

    setIsExporting(true);

    try {
      // Build query parameters
      const params: any = {
        orgId: orgId,
        limit: 10000, // Get all records for export
        offset: 0,
        timeRange: currentFilters.timeRange || 'all'
      };

      // Add filter parameters if they exist
      if (currentFilters.role && currentFilters.role !== 'all') {
        params.role = currentFilters.role;
      }
      if (currentFilters.action && currentFilters.action !== 'all') {
        params.action = currentFilters.action;
      }
      if (currentFilters.status && currentFilters.status !== 'all') {
        params.status = currentFilters.status;
      }
      if (currentFilters.search) {
        params.search = currentFilters.search;
      }

      console.log('Exporting with filters:', params);

      // Fetch data from API
      const response = await api.get('/trackinglog', { params });

      if (response.data?.success && response.data?.data?.logs) {
        const logs = response.data.data.logs;
        
        // Generate filename with current date and filters info
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        
        let filename = `audit-log-${dateStr}`;
        
        // Add filter info to filename
        const activeFilters = [];
        if (currentFilters.role && currentFilters.role !== 'all') {
          activeFilters.push(`role-${currentFilters.role}`);
        }
        if (currentFilters.action && currentFilters.action !== 'all') {
          activeFilters.push(`action-${currentFilters.action.replace(/[^a-zA-Z0-9]/g, '-')}`);
        }
        if (currentFilters.status && currentFilters.status !== 'all') {
          activeFilters.push(`status-${currentFilters.status}`);
        }
        if (currentFilters.search) {
          activeFilters.push(`search-${currentFilters.search.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 10)}`);
        }
        
        if (activeFilters.length > 0) {
          filename += `-${activeFilters.join('-')}`;
        }
        
        filename += '.csv';

        // Download CSV
        downloadCSV(logs, filename);
        
        console.log(`Exported ${logs.length} audit log records to ${filename}`);
      } else {
        console.error('No data received from API');
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      // You could add a toast notification here
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      className="bg-primary hover:bg-primary-dark shadow-4dp"
      disabled={isExporting || !orgId}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {isExporting ? 'Exporting...' : 'Export'}
    </Button>
  );
}