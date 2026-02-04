"use client"

import React from 'react'
import { PERMISSION_TIERS } from '@/utils/types/rbac'
import { cn } from '@/lib/utils'

const PermissionLegend: React.FC = () => {
    return (
        <div className="bg-card rounded-lg border border-border px-8 py-5">
            <p className="text-sm font-medium text-left text-muted-foreground font-body mb-6">Access Levels Definition</p>
            <div className="flex flex-nowrap gap-12 pt-0 pl-0">
                {Object.values(PERMISSION_TIERS).map((item, index) => (
                    <React.Fragment key={item.tier}>
                        <div className={cn('flex items-start gap-3 flex-shrink-0', index === 0 ? 'pl-0' : (index === Object.values(PERMISSION_TIERS).length - 1 ? 'px-8' : 'px-3'))}>
                            <div className={cn('h-3 w-3 rounded-full flex-shrink-0 mt-1', item.dotColorClass)} />
                            <div className="flex flex-col gap-0.5">
                                <span className={cn('text-sm font-semibold whitespace-nowrap', item.colorClass)}>
                                    {item.label.charAt(0) + item.label.slice(1).toLowerCase()}
                                </span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.description}</span>
                            </div>
                        </div>
                        {index < Object.values(PERMISSION_TIERS).length - 1 && (
                            <div className="w-px h-6 bg-border flex-shrink-0" />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

export default PermissionLegend
