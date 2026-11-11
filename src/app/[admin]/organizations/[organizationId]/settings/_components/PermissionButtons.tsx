"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { PERMISSION_LEVELS, PERMISSION_TIERS, PERMISSION_TIER_LEVELS, type PermissionTier } from '@/utils/types/rbac'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface PermissionButtonsProps {
    resourceId: number
    isChild?: boolean
    moduleChildren?: any[]
    maxAllowedTier?: PermissionTier
    currentTier: number
    isAdminRole?: boolean
    isOwnRole?: boolean
    hoveredRowId?: number | null
    parentName?: string
    onChange: (resourceId: number, tier: PermissionTier, isParent?: boolean) => void
}

// Permission combinations used by the RBAC permission selector.
const TIER_LABELS = Object.entries(PERMISSION_TIER_LEVELS).map(([tier, label]) => ({
    tier: Number(tier) as PermissionTier,
    label,
}))

// Ordered: View(1), Create(3), Edit(2), Delete(4) — matches prototype column order
const PERM_COLUMNS = [
    { label: 'View', permission: 'view' as const },
    { label: 'Create', permission: 'create' as const },
    { label: 'Edit', permission: 'edit' as const },
    { label: 'Delete', permission: 'delete' as const },
]

const PermissionButtons: React.FC<PermissionButtonsProps> = ({
    resourceId,
    isChild = false,
    maxAllowedTier,
    currentTier,
    isAdminRole = false,
    isOwnRole = false,
    parentName,
    onChange,
}) => {
    const tier = Math.max(0, Math.min(6, currentTier)) as PermissionTier
    const tierStyle = PERMISSION_TIERS[tier]
    const tierPermissions = PERMISSION_LEVELS[PERMISSION_TIER_LEVELS[tier]]

    const isOptionDisabled = (optionTier: PermissionTier) => {
        if (!isChild || typeof maxAllowedTier !== 'number') return false
        const parentPermissions = PERMISSION_LEVELS[PERMISSION_TIER_LEVELS[maxAllowedTier]]
        const optionPermissions = PERMISSION_LEVELS[PERMISSION_TIER_LEVELS[optionTier]]
        return (Object.keys(optionPermissions) as Array<keyof typeof optionPermissions>)
            .some((permission) => optionPermissions[permission] && !parentPermissions[permission])
    }

    const isColumnLocked = (permission: keyof typeof tierPermissions) =>
        isChild
        && typeof maxAllowedTier === 'number'
        && !PERMISSION_LEVELS[PERMISSION_TIER_LEVELS[maxAllowedTier]][permission]

    return (
        <div className="grid w-full min-w-0 grid-cols-[44%_repeat(4,minmax(0,1fr))] items-center">
            {/* Permission level selector */}
            <div className="px-2">
                <Select
                    value={String(tier)}
                    onValueChange={(value) => onChange(resourceId, Number(value) as PermissionTier, !isChild)}
                    disabled={isAdminRole || isOwnRole}
                >
                    <SelectTrigger className={cn(
                        'h-7 rounded border px-2 py-0 text-left text-[11px] font-normal shadow-none focus:ring-1 focus:ring-offset-0',
                        tierStyle.borderColorClass,
                        tierStyle.backgroundColor,
                        tierStyle.darkBackgroundColor,
                        tierStyle.colorClass,
                    )}>
                        <span className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
                            {/* Coloured dot matching the tier heat-map */}
                            <span className={cn('h-2 w-2 shrink-0 rounded-full', tierStyle.dotColorClass)} />
                            <SelectValue className="min-w-0 text-left" />
                        </span>
                    </SelectTrigger>
                    <SelectContent>
                        {TIER_LABELS.map(({ tier: optionTier, label }) => {
                            const disabled = isOptionDisabled(optionTier)
                            const optStyle = PERMISSION_TIERS[optionTier as PermissionTier]
                            return (
                                <SelectItem
                                    key={label}
                                    value={String(optionTier)}
                                    disabled={disabled}
                                    className={cn('text-xs', disabled && 'opacity-40 cursor-not-allowed')}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', optStyle.dotColorClass)} />
                                        <span>{label}</span>
                                        {disabled && parentName && (
                                            <span className="ml-auto text-[10px] italic text-muted-foreground">
                                                exceeds {parentName}
                                            </span>
                                        )}
                                    </div>
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
            </div>

            {/* Permission indicator chips */}
            {PERM_COLUMNS.map(({ label, permission }) => {
                const granted = tierPermissions[permission]
                const locked = isColumnLocked(permission)

                return (
                    <div key={label} className="flex justify-center">
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span
                                        aria-label={
                                            locked
                                                ? `${label}: locked by parent`
                                                : `${label}: ${granted ? 'granted' : 'not granted'}`
                                        }
                                        className={cn(
                                            'inline-flex h-[22px] min-w-[30px] cursor-default items-center justify-center rounded-full px-2 text-[11px] leading-none transition-colors',
                                            locked
                                                ? 'bg-muted/70 text-muted-foreground'
                                                : granted
                                                    ? cn(tierStyle.backgroundColor, tierStyle.colorClass, 'font-semibold')
                                                    : 'border border-dashed border-border bg-background text-muted-foreground'
                                        )}
                                    >
                                        {locked ? '⊘' : granted ? '✓' : '–'}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-[11px]">
                                    {locked
                                        ? `Locked: parent doesn't have ${label}`
                                        : granted
                                            ? `${label} granted`
                                            : `${label} not granted`}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )
            })}
        </div>
    )
}

export default PermissionButtons
