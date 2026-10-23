"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface RoleListProps {
    roles: any[]
    selectedRole?: string
    onRoleChange: (name: string, id: number) => void
}

const RoleList: React.FC<RoleListProps> = ({ roles, selectedRole, onRoleChange }) => (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Select role">
        {roles.map((role) => {
            const isSelected = selectedRole?.toLowerCase() === role.name?.toLowerCase()

            return (
                <button
                    key={role.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onRoleChange(role.name, role.id)}
                    className={cn(
                        'rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        isSelected
                            ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                            : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                >
                    {role.name}
                </button>
            )
        })}
    </div>
)

export default RoleList
