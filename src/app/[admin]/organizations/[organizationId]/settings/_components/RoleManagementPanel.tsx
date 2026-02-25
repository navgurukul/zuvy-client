'use client'

import React, { useEffect, useMemo } from 'react'
import { Save, AlertTriangle, ChevronDown, Info, GraduationCap, BookOpen, Users, UserCheck, FileText, Settings, List, Code, MessageSquare } from 'lucide-react'
import useRoleManagement from '@/hooks/useRoleManagement'
import RoleList from './RoleList'
import PermissionLegend from './PermissionLegend'
import PermissionButtons from './PermissionButtons'
import UnsavedChangesDialog from './UnsavedChangesDialog'
import { cn } from '@/lib/utils'
import { permissionLevelToTier } from '@/utils/types/rbac'
import { Button } from '@/components/ui/button'

interface RoleManagementPanelProps {
    selectedRole: string | undefined
    onRoleChange: (role: string) => void
}

const RESOURCE_ICONS: Record<string, React.ReactNode> = {
    'general details': <Info className="h-4 w-4" />,
    'curriculum': <BookOpen className="h-4 w-4" />,
    'student': <Users className="h-4 w-4" />,
    'batch': <UserCheck className="h-4 w-4" />,
    'submission': <FileText className="h-4 w-4" />,
    'setting': <Settings className="h-4 w-4" />,
    'mcqs': <List className="h-4 w-4" />,
    'coding questions': <Code className="h-4 w-4" />,
    'open ended': <MessageSquare className="h-4 w-4" />,
}

const RoleManagementPanel: React.FC<RoleManagementPanelProps> = ({ selectedRole, onRoleChange }) => {
    const hook = useRoleManagement(selectedRole, onRoleChange)

    const {
        roles,
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

    const isAdminRole = selectedRole?.toLowerCase() === 'admin'

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

    const getLevelFromPerms = (view: boolean, create: boolean, edit: boolean, del: boolean) => {
        if (!view && !create && !edit && !del) return 'No access'
        if (view && !create && !edit && !del) return 'Viewer'
        if (view && !create && edit && !del) return 'Editor'
        if (view && create && edit && !del) return 'Creator'
        if (view && create && edit && del) return 'Manager'
        return 'No access'
    }

    return (
        <div className="space-y-6">
            <UnsavedChangesDialog open={showWarningModal} onOpenChange={setShowWarningModal} selectedRole={selectedRole} onDiscard={onDiscard} onKeep={() => setShowWarningModal(false)} />

            <div className="flex items-start justify-between gap-10">
                <div className="space-y-2 flex-1 mt-2">
                    <h2 className="text-2xl text-left font-semibold tracking-tight">Manage Role Functions</h2>
                    <p className="text-muted-foreground text-left">Configure role permissions and manage system actions</p>
                </div>
                <div className="flex-1">
                    <PermissionLegend />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div>
                    <RoleList roles={roles} selectedRole={selectedRole} onRoleChange={onRoleSelect} />
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="relative">
                        <div className="bg-card rounded-lg border border-border overflow-hidden">
                            <div className="bg-background px-6 py-4 border-b border-border">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-muted-foreground font-body">Feature Module</p>
                                    <p className="text-sm font-medium text-muted-foreground font-body">Permission Tier</p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="p-8 text-center text-muted-foreground">Loading resources...</div>
                            ) : roleActions.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">No resources found.</div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {Object.entries(groupedResources as Record<string, { id: string; children: any[] }>).map(([moduleName, module]) => {
                                        const mod = module as { id: string; children: any[] }
                                        const isExpanded = (expandedModules as Set<string>).has(mod.id)

                                        return (
                                            <React.Fragment key={mod.id}>
                                                <div className="flex gap-2 items-center justify-between px-6 py-3 border-b border-border bg-muted-light">
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <button onClick={() => toggleModuleExpansion(mod.id)} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                                                            <ChevronDown className={cn('h-5 w-5 transition-transform', !isExpanded && '-rotate-90')} />
                                                        </button>
                                                        <div className="flex-shrink-0 text-muted-foreground">
                                                            {moduleName === 'Course Studio' ? (
                                                                <GraduationCap className="h-5 w-5" />
                                                            ) : moduleName === 'Content Bank' ? (
                                                                <BookOpen className="h-5 w-5" />
                                                            ) : (
                                                                <Info className="h-5 w-5" />
                                                            )}
                                                        </div>
                                                        <span className="text-base font-semibold text-foreground truncate">{moduleName}</span>
                                                    </div>
                                                    <PermissionButtons resourceId={mod.children[0]?.id || 0} isChild={false} moduleChildren={mod.children} currentTier={permissionLevelToTier((permissionLevels as any)[mod.children[0]?.id] || 'No access')} onChange={handlePermissionChange} hoveredRowId={hoveredRowId} isAdminRole={isAdminRole} />
                                                </div>

                                                {(isExpanded) && (() => {
                                                    const parentLevel = (mod.children && mod.children.length) ? (Array.isArray(mod.children) ? mod.children.reduce((acc: any, child: any) => {
                                                        const lvl = (permissionLevels as any)[child.id] || 'No access'
                                                        const tier = permissionLevelToTier(lvl)
                                                        return Math.max(acc, tier)
                                                    }, 0) : 0) : 0

                                                    const parentLevelName = ['No access','Viewer','Editor','Creator','Manager'][parentLevel]
                                                    const isParentLocked = (parentLockedModules as Set<string>).has(mod.id)
                                                    const showDisabledMessage = isParentLocked && parentLevelName === 'No access'

                                                    return mod.children.map((child: any) => (
                                                        <div key={child.id} className="bg-white">
                                                            <div className="flex gap-2 items-center justify-between px-6 py-3 border-b border-border last:border-b-0" onMouseEnter={() => setHoveredRowId(child.id)} onMouseLeave={() => setHoveredRowId(null)}>
                                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                    <div className="w-5 flex-shrink-0" />
                                                                    <div className={cn('flex-shrink-0', showDisabledMessage ? 'text-muted-foreground/50' : 'text-muted-foreground')}>{RESOURCE_ICONS[child.title.toLowerCase()] || <Info className="h-4 w-4" />}</div>
                                                                    <span className={cn('text-sm font-normal truncate', showDisabledMessage ? 'text-muted-foreground' : 'text-foreground')}>{child.title}</span>
                                                                </div>

                                                                {showDisabledMessage ? (
                                                                    <div className="flex items-center justify-end text-sm text-muted-foreground italic" style={{ width: '620px' }}>Enable Parent Access to configure</div>
                                                                ) : (
                                                                    <PermissionButtons resourceId={child.id} isChild={true} currentTier={permissionLevelToTier((permissionLevels as any)[child.id] || 'No access')} maxAllowedTier={parentLevel as any} hoveredRowId={hoveredRowId} isAdminRole={isAdminRole} onChange={handlePermissionChange} />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                })()}
                                            </React.Fragment>
                                        )
                                    })}
                                </div>
                            )}

                            <div className="bg-background px-6 py-4 border-t border-border">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                                        <span>Permissions cascade down</span>
                                    </div>
                                    <Button onClick={() => handleSaveAllPermissions(resolveRoleId)} disabled={!hasUnsavedChanges || assigning || isAdminRole} size="lg">
                                        <Save className="h-4 w-4 mr-2" />
                                        {assigning ? 'Saving...' : 'Save Configuration'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoleManagementPanel