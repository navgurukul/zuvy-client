"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface RoleListProps {
    roles: any[]
    selectedRole?: string
    onRoleChange: (name: string, id: number) => void
}

const RoleList: React.FC<RoleListProps> = ({ roles, selectedRole, onRoleChange }) => {
    return (
        <div>
            <div className="bg-card rounded-lg border border-border overflow-hidden sticky top-6">
                <div className="bg-background px-4 py-4 border-b border-border">
                    <p className="text-sm font-medium text-left text-muted-foreground font-body">Select Role</p>
                </div>

                <div className="divide-y divide-border">
                    {roles.map((role) => {
                        const isSelected = selectedRole === role.name
                        return (
                            <button
                                key={role.id}
                                onClick={() => onRoleChange(role.name, role.id)}
                                className={cn(
                                    'w-full text-left px-4 py-4 transition-all duration-200 flex items-center justify-between gap-2',
                                    isSelected
                                        ? 'bg-success-light border-l-4 border-l-success'
                                        : 'bg-white hover:bg-muted border-l-4 border-l-transparent'
                                )}
                            >
                                <div className={cn('text-sm font-medium truncate', isSelected ? 'text-success-dark' : 'text-foreground')}>
                                    {role.name}
                                </div>
                                {isSelected && (
                                    <svg className="h-4 w-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default RoleList
