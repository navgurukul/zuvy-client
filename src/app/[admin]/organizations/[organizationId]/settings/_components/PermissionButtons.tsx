"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { PERMISSION_TIERS } from '@/utils/types/rbac'
import type { PermissionTier } from '@/utils/types/rbac'

interface PermissionButtonsProps {
    resourceId: number
    isChild?: boolean
    moduleChildren?: any[]
    maxAllowedTier?: PermissionTier
    currentTier: number
    isAdminRole?: boolean
    hoveredRowId?: number | null
    onChange: (resourceId: number, tier: PermissionTier, isParent?: boolean) => void
}

const PermissionButtons: React.FC<PermissionButtonsProps> = ({ resourceId, isChild = false, moduleChildren, maxAllowedTier, currentTier, isAdminRole = false, hoveredRowId, onChange }) => {
    return (
        <div className="flex gap-8 flex-shrink-0" style={{ width: '620px' }}>
            {Object.values(PERMISSION_TIERS)
                .sort((a, b) => a.tier - b.tier)
                .map((tier) => {
                    const isActive = currentTier === tier.tier
                    const isDisabledByParent = isChild && typeof maxAllowedTier === 'number' && tier.tier > (maxAllowedTier as number)
                    const showLabel = !isChild || isActive || hoveredRowId === resourceId

                    return (
                        <button
                            key={tier.tier}
                            onClick={() => {
                                if (!isAdminRole) {
                                    if (!isDisabledByParent) {
                                        onChange(resourceId, tier.tier as PermissionTier, !isChild)
                                    }
                                }
                            }}
                            disabled={isAdminRole || isDisabledByParent}
                            className={cn(
                                'transition-all duration-200 rounded-md',
                                'h-10 flex items-center justify-center flex-1',
                                'text-xs font-semibold uppercase',
                                'min-w-0 relative group',
                                (isAdminRole || isDisabledByParent) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                                isActive
                                    ? cn('border-2', tier.borderColorClass, tier.backgroundColor, tier.textColorClass)
                                    : cn(isChild ? 'bg-white hover:bg-gray-100' : 'bg-muted-light hover:bg-gray-200', tier.textColorClass)
                            )}
                        >
                            {showLabel ? (
                                <span className="truncate px-2">{tier.label}</span>
                            ) : (
                                <span className="text-muted-foreground text-lg">•</span>
                            )}
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity delay-500 pointer-events-none z-50">
                                {tier.label} - {tier.description}
                            </span>
                        </button>
                    )
                })}
        </div>
    )
}

export default PermissionButtons
