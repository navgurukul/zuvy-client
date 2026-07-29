/**
 * Returns a Tailwind text-color class based on content type and completion status.
 * Used by sidebar components (MobileSideBar, ModuleContentPage).
 */
export const getIconColor = (type: string, status: string): string => {
    switch (type) {
        case 'live-class':
        case 'video':
            return status === 'completed' ? 'text-success' : 'text-primary';
        case 'article':
        case 'assessment':
            return status === 'completed' ? 'text-success' : 'text-accent';
        case 'assignment':
            return status === 'completed' ? 'text-success' : 'text-secondary';
        case 'quiz':
        case 'coding-challenge':
            return status === 'completed' ? 'text-success' : 'text-warning';
        case 'feedback-form':
            return status === 'completed' ? 'text-success' : 'text-info';
        default:
            return 'text-muted-foreground';
    }
};
