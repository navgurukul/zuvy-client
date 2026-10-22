'use client'

import React, { useEffect, useState } from 'react'
import { Save, AlertTriangle, ChevronDown, Plus } from 'lucide-react'
import useRoleManagement from '@/app/[admin]/hooks/useRoleManagement'
import { useRouter } from 'next/navigation'
import RoleList from './RoleList'
import PermissionButtons from './PermissionButtons'
import UnsavedChangesDialog from './UnsavedChangesDialog'
import { cn } from '@/lib/utils'
import { permissionLevelToTier } from '@/utils/types/rbac'
import { Button } from '@/components/ui/button'
import { getUser } from '@/store/store'

interface RoleManagementPanelProps {
    selectedRole: string | undefined
    onRoleChange: (role: string) => void
    pendingTab?: string | null
    onTabSwitch?: (tab: string) => void
}

const RoleManagementPanel: React.FC<RoleManagementPanelProps> = ({ selectedRole, onRoleChange, pendingTab, onTabSwitch }) => {
    const hook = useRoleManagement(selectedRole, onRoleChange)
    const router = useRouter()

    const {
        roles,
        refetchRoles,
        resources,
        loading,
        assigning,
        roleId,
        setRoleId,
        resourcePermissions,
        originalResourcePermissions,
        permissionLevels,
        permissionsData,
        showWarningModal,
        setShowWarningModal,
        pendingAction,
        setPendingAction,
        pendingRoute,
        setPendingRoute,
        expandedModules,
        setExpandedModules,
        hoveredRowId,
        setHoveredRowId,
        parentLockedModules,
        groupedResources,
        roleActions,
        handlePermissionChange,
        hasUnsavedChanges,
        handleSaveAllPermissions,
        discardChanges,
    } = hook as any

    const { user } = getUser()
    const currentUserRole = user?.rolesList?.[0]?.toLowerCase()
    const isSuperAdmin = currentUserRole === 'super_admin'
    const isOwnRole = !isSuperAdmin && selectedRole?.toLowerCase() === currentUserRole
    const isAdminRole = !isSuperAdmin && selectedRole?.toLowerCase() === 'admin'

    const getModuleSummary = (children: any[]) => {
        const counts = new Map<string, number>()
        children.forEach((child) => {
            const level = (permissionLevels as any)[child.id] || 'No access'
            const label = level === 'Manager' ? 'Full access' : level === 'Viewer' ? 'View only' : level
            counts.set(label, (counts.get(label) || 0) + 1)
        })
        return `${children.length} items · ${Array.from(counts, ([label, count]) => `${count} ${label}`).join(', ')}`
    }

    const toggleModuleExpansion = (moduleId: string) => {
        setExpandedModules((prev: Set<string>) => {
            const next = new Set(prev)
            if (next.has(moduleId)) next.delete(moduleId)
            else next.add(moduleId)
            return next
        })
    }

    const resolveRoleId = (): number | undefined => {
        const match = roles.find((r: any) => r.name?.toLowerCase() === selectedRole?.toLowerCase())
        return match?.id
    }

    const onRoleSelect = (roleName: string, newRoleId: number) => {
        const isSameRoleById = newRoleId === roleId

        if (isSameRoleById) {
            return
        }

        const changeRole = () => {
            onRoleChange(roleName)
            setRoleId(newRoleId)
            const newParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
            newParams.set('role', roleName)
            if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', `?${newParams.toString()}`)
            }
        }

        if (hasUnsavedChanges) {
            setPendingAction(() => changeRole)
            setShowWarningModal(true)
        } else {
            changeRole()
        }
    }

    const onDiscard = () => {
        // recalc permission levels
        const recalc = () => {
            const newLevels: Record<number, any> = {}
            for (const resourceId of Object.keys(originalResourcePermissions).map(Number)) {
                const perms = originalResourcePermissions[resourceId] || {}
                const permissions = permissionsData[resourceId] || []
                let view = false
                let create = false
                let edit = false
                let deletePerm = false

                permissions.forEach((perm: any) => {
                    const granted = perms[perm.id] || false
                    const permName = (perm.name || '').toLowerCase()
                    if (permName.includes('view') || permName.includes('read')) {
                        view = granted
                    } else if (permName.includes('create') || permName.includes('add')) {
                        create = granted
                    } else if (permName.includes('edit') || permName.includes('update')) {
                        edit = granted
                    } else if (permName.includes('delete') || permName.includes('remove')) {
                        deletePerm = granted
                    }
                })

                newLevels[resourceId] = getLevelFromPerms(view, create, edit, deletePerm)
            }
            // setPermissionLevels would be inside hook; use discardChanges to reset state
        }

        discardChanges(recalc)
    }

    const onKeepAndContinue = async () => {
        const actionToRun = pendingAction
        const routeToGo = pendingRoute

        await handleSaveAllPermissions(resolveRoleId)

        setShowWarningModal(false)
        setPendingAction(null)
        setPendingRoute(null)

        if (actionToRun) {
            actionToRun()
            return
        }

        if (!routeToGo) return

        if (routeToGo === 'back') {
            window.history.back()
        } else if (routeToGo === 'forward') {
            window.history.forward()
        } else if (routeToGo.startsWith('http')) {
            window.location.href = routeToGo
        } else {
            router.push(routeToGo)
        }
    }

    const getLevelFromPerms = (view: boolean, create: boolean, edit: boolean, del: boolean) => {
        if (!view && !create && !edit && !del) return 'No access'
        if (view && !create && !edit && !del) return 'Viewer'
        if (view && !create && edit && !del) return 'Editor'
        if (view && create && edit && !del) return 'Creator'
        if (view && create && edit && del) return 'Manager'
        return 'No access'
    }

    useEffect(() => {
        if (pendingTab && pendingTab !== 'roles' && hasUnsavedChanges) {
            setPendingAction(() => () => {
                onTabSwitch?.(pendingTab)
            })
            setShowWarningModal(true)
        } else if (pendingTab && pendingTab !== 'roles' && !hasUnsavedChanges) {
            onTabSwitch?.(pendingTab)
        }
    }, [pendingTab, hasUnsavedChanges, onTabSwitch])

    return (
        <div className="space-y-6">
            <UnsavedChangesDialog
                open={showWarningModal}
                onOpenChange={setShowWarningModal}
                selectedRole={selectedRole}
                onDiscard={onDiscard}
                onKeep={onKeepAndContinue}
            />

            <div className="space-y-3">
                <div className="space-y-1">
                    <h2 className="text-base text-left font-semibold tracking-tight">Manage Role Functions</h2>
                    <p className="text-xs text-muted-foreground text-left">Configure role permissions and manage system actions</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <RoleList roles={roles} selectedRole={selectedRole} onRoleChange={onRoleSelect} />
                </div>
                {isAdminRole && (
                    <p className="text-[11px] text-muted-foreground"><span className="font-semibold">Admin</span> has full access by default and permissions cannot be modified.</p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <p className="font-medium text-foreground">An item can never have more access than the item above it.</p>
                        <div className="flex items-center gap-2">
                            <span aria-hidden="true" className="inline-flex h-[22px] min-w-[30px] items-center justify-center rounded-full bg-primary px-2 font-semibold text-white">✓</span>
                            <span>Granted</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span aria-hidden="true" className="inline-flex h-[22px] min-w-[30px] items-center justify-center rounded-full border border-dashed border-border bg-background px-2 text-muted-foreground">—</span>
                            <span>Not granted</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span aria-hidden="true" className="inline-flex h-[22px] min-w-[30px] items-center justify-center rounded-full bg-muted px-2 text-muted-foreground">⊘</span>
                            <span>Locked by parent</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                    {isOwnRole && !isAdminRole && (
                        <div className="flex items-center gap-3 px-2 py-1 text-sm text-secondary-dark">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                            <p>
                                You can't modify your own role's permissions. Switch to another role with sufficient privileges to make changes.
                            </p>
                        </div>
                    )}

                    <div className="relative">
                        <div className="space-y-3">
                            <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
                                <table className="w-full table-fixed border-collapse text-xs font-medium text-muted-foreground font-body">
                                    <colgroup>
                                        <col style={{ width: '46%' }} />
                                        <col style={{ width: '24%' }} />
                                        <col style={{ width: '7.5%' }} />
                                        <col style={{ width: '7.5%' }} />
                                        <col style={{ width: '7.5%' }} />
                                        <col style={{ width: '7.5%' }} />
                                    </colgroup>
                                    <thead>
                                        <tr className="h-9">
                                            <th className="border-r border-border px-2 text-left font-medium">Role Actions</th>
                                            <th className="border-r border-border px-2 text-left font-medium">Permission Level</th>
                                            {['View', 'Create', 'Edit', 'Delete'].map((label) => (
                                                <th key={label} className="px-1 text-center font-medium">{label}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                </table>
                            </div>

                            {loading ? (
                                <div className="p-8 text-center text-muted-foreground">Loading resources...</div>
                            ) : roleActions.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">No resources found.</div>
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(groupedResources as Record<string, { id: string; children: any[] }>).map(([moduleName, module]) => {
                                        const mod = module as { id: string; children: any[] }
                                        const isExpanded = (expandedModules as Set<string>).has(mod.id)

                                        return (
                                            <div key={mod.id} className={cn('overflow-hidden rounded-md border border-border bg-muted/40')}>
                                                <div className="grid min-h-[62px] grid-cols-[46%_54%] items-center">
                                                    <div className="flex h-full min-w-0 items-center gap-2 border-r border-border px-3">
                                                        <button type="button" aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${moduleName}`} onClick={() => toggleModuleExpansion(mod.id)} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                                                            <ChevronDown className={cn('h-4 w-4 transition-transform', !isExpanded && '-rotate-90')} />
                                                        </button>
                                                        <div className="min-w-0">
                                                            <span className="block truncate text-xs font-semibold text-foreground">{moduleName}</span>
                                                            <span className="block truncate text-[10px] text-muted-foreground">{getModuleSummary(mod.children)}</span>
                                                        </div>
                                                    </div>
                                                    <PermissionButtons resourceId={mod.children[0]?.id || 0} isChild={false} moduleChildren={mod.children} currentTier={permissionLevelToTier((permissionLevels as any)[mod.children[0]?.id] || 'No access')} onChange={handlePermissionChange} hoveredRowId={hoveredRowId} isAdminRole={isAdminRole} isOwnRole={isOwnRole} />
                                                </div>

                                                {(isExpanded) && (() => {
                                                    const parentLevel = (mod.children && mod.children.length) ? (Array.isArray(mod.children) ? mod.children.reduce((acc: any, child: any) => {
                                                        const lvl = (permissionLevels as any)[child.id] || 'No access'
                                                        const tier = permissionLevelToTier(lvl)
                                                        return Math.max(acc, tier)
                                                    }, 0) : 0) : 0

                                                    const parentLevelName = ['No access', 'Viewer', 'Editor', 'Creator', 'Manager'][parentLevel]
                                                    const isParentLocked = (parentLockedModules as Set<string>).has(mod.id)
                                                    const showDisabledMessage = isParentLocked && parentLevelName === 'No access'

                                                    return mod.children.map((child: any) => (
                                                        <div key={child.id} className="border-t border-border bg-background" onMouseEnter={() => setHoveredRowId(child.id)} onMouseLeave={() => setHoveredRowId(null)}>
                                                            <div className="grid min-h-11 grid-cols-[46%_54%] items-center">
                                                                <div className="flex h-full min-w-0 items-center gap-2 border-r border-border px-3 pl-8">
                                                                    <span className={cn('truncate text-xs', showDisabledMessage ? 'text-muted-foreground' : 'text-foreground')}>{child.title}</span>
                                                                </div>

                                                                {showDisabledMessage ? (
                                                                    <div className="px-3 text-right text-[11px] italic text-muted-foreground">Enable Parent Access to configure</div>
                                                                ) : (
                                                                    <PermissionButtons resourceId={child.id} isChild={true} currentTier={permissionLevelToTier((permissionLevels as any)[child.id] || 'No access')} maxAllowedTier={parentLevel as any} hoveredRowId={hoveredRowId} isAdminRole={isAdminRole} isOwnRole={isOwnRole} onChange={handlePermissionChange} />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                })()}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <Button onClick={() => handleSaveAllPermissions(resolveRoleId)} disabled={!hasUnsavedChanges || assigning || isOwnRole || (isAdminRole && currentUserRole !== "super_admin")} className="h-8 rounded-md bg-success px-4 text-xs font-semibold text-white hover:bg-success/90" size="sm">
                                    <Save className="mr-2 h-3.5 w-3.5" />
                                    {assigning ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    )
}

export default RoleManagementPanel
