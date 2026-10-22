"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { PERMISSION_TIERS, type PermissionTier } from '@/utils/types/rbac'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PermissionButtonsProps {
    resourceId: number
    isChild?: boolean
    moduleChildren?: any[]
    maxAllowedTier?: PermissionTier
    currentTier: number
    isAdminRole?: boolean
    isOwnRole?: boolean
    hoveredRowId?: number | null
    onChange: (resourceId: number, tier: PermissionTier, isParent?: boolean) => void
}

const tierLabels = ['No access', 'View only', 'View + Edit', 'View + Edit + Create', 'Full access']
const permissionColumns = [
    { label: 'View', minTier: 1 },
    { label: 'Create', minTier: 3 },
    { label: 'Edit', minTier: 2 },
    { label: 'Delete', minTier: 4 },
]

const PermissionButtons: React.FC<PermissionButtonsProps> = ({
    resourceId,
    isChild = false,
    maxAllowedTier,
    currentTier,
    isAdminRole = false,
    isOwnRole = false,
    onChange,
}) => {
    const tier = Math.max(0, Math.min(4, currentTier)) as PermissionTier
    const tierStyle = PERMISSION_TIERS[tier]
    const isLocked = (minTier: number) => isChild && typeof maxAllowedTier === 'number' && minTier > maxAllowedTier

    return (
        <div className="grid w-full min-w-0 grid-cols-[44%_repeat(4,minmax(0,1fr))] items-center">
            <div className="px-2">
                <Select
                    value={String(tier)}
                    onValueChange={(value) => onChange(resourceId, Number(value) as PermissionTier, !isChild)}
                    disabled={isAdminRole || isOwnRole}
                >
                    <SelectTrigger className={cn(
                        'h-7 rounded border px-2 py-0 text-[11px] font-normal shadow-none focus:ring-1 focus:ring-offset-0',
                        tierStyle.borderColorClass,
                        tierStyle.backgroundColor,
                        tierStyle.darkBackgroundColor,
                        tierStyle.colorClass,
                    )}>
                        <span className={cn('mr-1.5 h-1.5 w-1.5 shrink-0 rounded-full', tierStyle.dotColorClass)} />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {tierLabels.map((label, optionTier) => (
                            <SelectItem
                                key={label}
                                value={String(optionTier)}
                                disabled={isChild && typeof maxAllowedTier === 'number' && optionTier > maxAllowedTier}
                                className="text-xs"
                            >
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {permissionColumns.map(({ label, minTier }) => {
                const granted = tier >= minTier
                const locked = isLocked(minTier)

                return (
                    <div key={label} className="flex justify-center">
                        <span
                            aria-label={locked ? `${label}: locked by parent` : `${label}: ${granted ? 'granted' : 'not granted'}`}
                            title={locked ? 'Locked by parent' : granted ? 'Granted' : 'Not granted'}
                            className={cn(
                                'inline-flex h-[22px] min-w-[30px] items-center justify-center rounded-full px-2 text-[11px] leading-none',
                                locked
                                    ? 'bg-muted text-muted-foreground'
                                    : granted
                                        ? 'bg-primary text-white dark:bg-primary'
                                        : 'border border-dashed border-border bg-background text-muted-foreground'
                            )}
                        >
                            {locked ? '⊘' : granted ? '✓' : '—'}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

export default PermissionButtons
