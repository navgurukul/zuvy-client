'use client'

import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import {
    Save,
    AlertTriangle,
    ChevronDown,
    X,
} from 'lucide-react'
import useRoleManagement from '@/app/[admin]/hooks/useRoleManagement'
import { useRouter } from 'next/navigation'
import RoleList from './RoleList'
import PermissionButtons from './PermissionButtons'
import UnsavedChangesDialog from './UnsavedChangesDialog'
import { cn } from '@/lib/utils'
import { permissionLevelToTier, PERMISSION_TIERS, type PermissionTier } from '@/utils/types/rbac'
import { Button } from '@/components/ui/button'
import { getUser } from '@/store/store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoleManagementPanelProps {
    selectedRole: string | undefined
    onRoleChange: (role: string) => void
    pendingTab?: string | null
    onTabSwitch?: (tab: string) => void
}

// ─── LiftBox: the outline overlay drawn on a card ─────────────────────────────
// Absolutely positioned over the card, pointer-events:none.
// top/height animate via CSS transitions to track the focused row group.

interface LiftBoxProps {
    /** Refs to the DOM rows that are currently "in focus" inside this card */
    focusedRowEls: HTMLElement[]
    /** The card container element — used as the offset parent */
    cardEl: HTMLElement | null
    /** Override border-radius (default 8px for header, 0 for inner child rows) */
    borderRadius?: number | string
}

const LIFT_BOX_BASE: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    border: '2px solid #1F2937',
    zIndex: 5,
    transition: 'top 0.22s ease-in-out, height 0.22s ease-in-out, left 0.22s ease-in-out, width 0.22s ease-in-out, opacity 0.18s ease-in-out',
}

function LiftBox({ focusedRowEls, cardEl, borderRadius = 8 }: LiftBoxProps) {
    const boxRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const box = boxRef.current
        if (!box || !cardEl) return

        if (focusedRowEls.length === 0) {
            box.style.opacity = '0'
            return
        }

        const cardRect = cardEl.getBoundingClientRect()

        const firstRow = focusedRowEls[0]
        const lastRow = focusedRowEls[focusedRowEls.length - 1]

        const firstRect = firstRow.getBoundingClientRect()
        const lastRect = lastRow.getBoundingClientRect()

        box.style.top = `${firstRect.top - cardRect.top}px`
        box.style.left = '0px'
        box.style.width = `${cardEl.clientWidth}px`
        box.style.height = `${lastRect.bottom - firstRect.top}px`
        box.style.borderRadius =
            typeof borderRadius === 'number'
                ? `${borderRadius}px`
                : borderRadius
        box.style.opacity = '1'
    }, [focusedRowEls, cardEl, borderRadius])

    return (
        <div
            ref={boxRef}
            style={{ ...LIFT_BOX_BASE, opacity: 0, borderRadius }}
        />
    )
}

interface LowerToastProps {
    message: string
    onUndo: () => void
    onDismiss: () => void
}

const LowerToast: React.FC<LowerToastProps> = ({ message, onUndo, onDismiss }) => (
    <div
        className={cn(
            'fixed bottom-6 left-1/2 z-50 -translate-x-1/2',
            'flex items-center gap-3 rounded-xl px-4 py-3 shadow-2xl',
            'bg-foreground text-background text-[12px] max-w-[560px] w-max',
            'animate-fade-in',
        )}
    >
        <span className="leading-snug">{message}</span>
        <button
            onClick={onUndo}
            className="shrink-0 rounded-md border border-muted-foreground/40 px-3 py-1 text-[11px] hover:bg-muted-foreground/20 transition-colors"
        >
            Undo
        </button>
        <button
            onClick={onDismiss}
            className="shrink-0 text-muted-foreground hover:text-background transition-colors"
            aria-label="Dismiss"
        >
            <X className="h-3.5 w-3.5" />
        </button>
    </div>
)

// ─── CardSection: one collapsible module card with its own lift-box ───────────

interface CardSectionProps {
    moduleName: string
    mod: { id: string; children: any[] }
    isExpanded: boolean
    parentLevel: number
    showDisabledMessage: boolean
    permissionLevels: Record<number, any>
    permissionsData: Record<number, any>
    focusedId: number | null        // child row id that is hovered/focused; -1 = header hovered; null = not active
    focusLocked: boolean            // true when a dropdown is open
    isAdminRole: boolean
    isOwnRole: boolean
    isAnyFocused: boolean           // true when ANY card in the panel has focus
    onToggleExpand: () => void
    onChildMouseEnter: (id: number) => void
    onChildMouseLeave: () => void
    onHeaderMouseEnter: () => void
    onHeaderMouseLeave: () => void
    onPermissionChange: (resourceId: number, tier: PermissionTier, isParent?: boolean) => void
    onPermissionChangeParent: (resourceId: number, tier: PermissionTier, isParent?: boolean) => void
    getModuleSummary: (children: any[]) => string
}

const CardSection: React.FC<CardSectionProps> = ({
    moduleName,
    mod,
    isExpanded,
    parentLevel,
    showDisabledMessage,
    permissionLevels,
    focusedId,
    focusLocked,
    isAdminRole,
    isOwnRole,
    isAnyFocused,
    onToggleExpand,
    onChildMouseEnter,
    onChildMouseLeave,
    onHeaderMouseEnter,
    onHeaderMouseLeave,
    onPermissionChange,
    onPermissionChangeParent,
    getModuleSummary,
}) => {
    const cardRef = useRef<HTMLDivElement>(null)
    const headerRowRef = useRef<HTMLDivElement>(null)
    const childRowRefs = useRef<Map<number, HTMLDivElement>>(new Map())

    // focusedId:
    //   null   → this card is NOT active (another card or nothing is hovered)
    //   -1     → header of this card is hovered  → box covers whole card
    //   ≥ 0    → that child id is hovered         → box covers header + that child

    const thisCardActive = focusedId !== null

    const focusedEls: HTMLElement[] = []

    if (thisCardActive && cardRef.current) {
        if (focusedId === -1) {
            // Header hover: header + all expanded children
            if (headerRowRef.current) {
                focusedEls.push(headerRowRef.current)
            }

            if (isExpanded) {
                mod.children.forEach((child: any) => {
                    const el = childRowRefs.current.get(child.id)
                    if (el) focusedEls.push(el)
                })
            }
        } else if (focusedId !== null && focusedId >= 0) {
            const hoveredIndex = mod.children.findIndex(
                (child: any) => child.id === focusedId
            )

            if (hoveredIndex === 0) {
                // First child: header + first child
                if (headerRowRef.current) {
                    focusedEls.push(headerRowRef.current)
                }

                const childEl = childRowRefs.current.get(focusedId)
                if (childEl) focusedEls.push(childEl)
            } else if (hoveredIndex === 1) {
                // Second child: header + first child + second child
                if (headerRowRef.current) {
                    focusedEls.push(headerRowRef.current)
                }

                for (let i = 0; i <= hoveredIndex; i++) {
                    const childEl = childRowRefs.current.get(
                        mod.children[i].id
                    )
                    if (childEl) focusedEls.push(childEl)
                }
            } else {
                // Third child onward: only hovered child
                const childEl = childRowRefs.current.get(focusedId)
                if (childEl) focusedEls.push(childEl)
            }
        }
    }

    const isDimmed = isAnyFocused && !thisCardActive

    const liftBorderRadius = (() => {
        if (!thisCardActive) return 8

        // Header hover: full card outline
        if (focusedId === -1) return 8

        if (focusedId !== null && focusedId >= 0) {
            const idx = mod.children.findIndex(
                (child: any) => child.id === focusedId
            )

            // First/second child outline starts at header
            if (idx === 0 || idx === 1) {
                const reachesCardBottom =
                    isExpanded && idx === mod.children.length - 1

                return reachesCardBottom
                    ? 8
                    : '8px 8px 0 0'
            }

            // Third child onward: independent outline
            const isLast = idx === mod.children.length - 1

            return isLast
                ? '0 0 8px 8px'
                : 0
        }

        return 8
    })()


    return (
        // No overflow-hidden — the LiftBox must not be clipped by the card
        <div
            ref={cardRef}
            className={cn(
                'relative rounded-lg border border-border bg-card',
                'transition-opacity duration-[250ms] ease-in-out',
                isDimmed && 'opacity-40',
            )}
        >
            {/* LiftBox is always mounted so transitions animate smoothly */}
            <LiftBox
                focusedRowEls={focusedEls}
                cardEl={cardRef.current}
                borderRadius={liftBorderRadius}
            />

            {/* ── Module header row ── */}
            <div
                ref={headerRowRef}
                className="grid min-h-[62px] grid-cols-[46%_54%] items-center rounded-t-lg bg-muted/40"
                onMouseEnter={onHeaderMouseEnter}
                onMouseLeave={onHeaderMouseLeave}
            >
                <div className="flex h-full min-w-0 items-center gap-2 border-r border-border px-3">
                    <button
                        type="button"
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${moduleName}`}
                        onClick={onToggleExpand}
                        className="flex-shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
                    >
                        <ChevronDown
                            className={cn(
                                'h-4 w-4 transition-transform duration-200',
                                !isExpanded && '-rotate-90',
                            )}
                        />
                    </button>
                    <div className="min-w-0">
                        <span className="block truncate text-left text-sm font-semibold text-foreground">
                            {moduleName}
                        </span>
                        {/* <span className="block truncate text-left text-xs text-muted-foreground">
                            {getModuleSummary(mod.children)}
                        </span> */}
                    </div>
                </div>
                <PermissionButtons
                    resourceId={mod.children[0]?.id || 0}
                    isChild={false}
                    moduleChildren={mod.children}
                    currentTier={parentLevel as PermissionTier}
                    onChange={onPermissionChangeParent}
                    isAdminRole={isAdminRole}
                    isOwnRole={isOwnRole}
                />
            </div>

            {/* ── Child rows ── */}
            {isExpanded &&
                mod.children.map((child: any, idx: number) => {
                    const childTier = permissionLevelToTier(
                        (permissionLevels as any)[child.id] || 'No access',
                    )
                    const isAtLimit = childTier === parentLevel && parentLevel > 0
                    const isHovered = focusedId === child.id
                    const isLast = idx === mod.children.length - 1
                    // Dim siblings only when a specific child (not header) is hovered
                    const isChildDimmed = focusedId !== null && focusedId >= 0 && !isHovered

                    return (
                        <div
                            key={child.id}
                            ref={(el) => {
                                if (el) childRowRefs.current.set(child.id, el)
                                else childRowRefs.current.delete(child.id)
                            }}
                            className={cn(
                                'border-t border-border bg-background',
                                // Round bottom corners on last child so bg doesn't bleed outside card border
                                isLast && 'rounded-b-lg',
                                'transition-opacity duration-[250ms] ease-in-out',
                                isChildDimmed && 'opacity-40',
                                isHovered && 'bg-card',
                            )}
                            onMouseEnter={() => onChildMouseEnter(child.id)}
                            onMouseLeave={onChildMouseLeave}
                        >
                            <div className="grid min-h-11 grid-cols-[46%_54%] items-center">
                                <div className="flex h-full min-w-0 items-center gap-2 border-r border-border px-3 pl-8">
                                    <span
                                        aria-hidden="true"
                                        className="mr-1 shrink-0 self-stretch inline-flex items-center"
                                    >
                                        <svg
                                            width="14"
                                            style={{ minHeight: '44px', height: '100%' }}
                                            viewBox="0 0 14 44"
                                            preserveAspectRatio="none"
                                            fill="none"
                                        >
                                            <line x1="4" y1="0" x2="4" y2="22" stroke="hsl(var(--border))" strokeWidth="1.5" />
                                            <line x1="4" y1="22" x2="14" y2="22" stroke="hsl(var(--border))" strokeWidth="1.5" />
                                        </svg>
                                    </span>
                                    <span className="flex min-w-0 items-center gap-2 truncate text-xs text-foreground">
                                        {child.title}
                                        {isAtLimit && (
                                            <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                                                At limit
                                            </span>
                                        )}
                                    </span>
                                </div>

                                <PermissionButtons
                                    resourceId={child.id}
                                    isChild={true}
                                    currentTier={childTier}
                                    maxAllowedTier={parentLevel as PermissionTier}
                                    parentName={moduleName}
                                    isAdminRole={isAdminRole}
                                    isOwnRole={isOwnRole}
                                    onChange={onPermissionChange}
                                />
                            </div>
                        </div>
                    )
                })}
        </div>
    )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

const RoleManagementPanel: React.FC<RoleManagementPanelProps> = ({
    selectedRole,
    onRoleChange,
    pendingTab,
    onTabSwitch,
}) => {
    const hook = useRoleManagement(selectedRole, onRoleChange)
    const router = useRouter()

    const {
        roles,
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
    const [parentLevelOverrides, setParentLevelOverrides] = useState<Record<string, PermissionTier>>({})

    useEffect(() => {
        setParentLevelOverrides({})
    }, [roleId])

    // ── Per-card hover state: moduleId → hovered child id (null = header hovered, -1 = nothing) ─
    // We store which child row is hovered per card.
    // null means "header hovered" (whole card focused but no specific child)
    // undefined means "not hovered"
    const [hoveredState, setHoveredState] = useState<{
        moduleId: string
        childId: number | null   // null = header hovered
    } | null>(null)

    // Focus locked when a Select dropdown is open (prevents hover from clearing)
    const [focusLocked, setFocusLocked] = useState(false)

    const isAnyFocused = hoveredState !== null

    // ── Auto-lower toast state ───────────────────────────────────────────────
    const [toast, setToast] = useState<{ message: string; onUndo: () => void } | null>(null)
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const showLowerToast = useCallback((message: string, onUndo: () => void) => {
        if (toastTimer.current) clearTimeout(toastTimer.current)
        setToast({ message, onUndo })
        toastTimer.current = setTimeout(() => setToast(null), 9000)
    }, [])

    const dismissToast = useCallback(() => {
        if (toastTimer.current) clearTimeout(toastTimer.current)
        setToast(null)
    }, [])

    // ── Wrap handlePermissionChange to detect auto-lowered children ──────────
    const handlePermissionChangeWithToast = useCallback(
        (resourceId: number, tier: PermissionTier, isParent?: boolean) => {
            if (!isParent) {
                handlePermissionChange(resourceId, tier, false)
                return
            }

            const resourceGroupMatch = Object.entries(
                groupedResources as Record<string, { id: string; children: any[] }>,
            ).find(([, mod]) => mod.children.some((c: any) => c.id === resourceId))

            if (!resourceGroupMatch) {
                handlePermissionChange(resourceId, tier, true)
                return
            }

            const [, mod] = resourceGroupMatch
            setParentLevelOverrides((prev) => ({ ...prev, [mod.id]: tier }))
            const beforeSnapshot: Record<number, number> = {}
            mod.children.forEach((child: any) => {
                beforeSnapshot[child.id] = permissionLevelToTier(
                    (permissionLevels as any)[child.id] || 'No access',
                )
            })

            handlePermissionChange(resourceId, tier, true)

            setTimeout(() => {
                const lowered: string[] = []
                mod.children.forEach((child: any) => {
                    const afterTier = permissionLevelToTier(
                        (permissionLevels as any)[child.id] || 'No access',
                    )
                    if (afterTier < beforeSnapshot[child.id]) lowered.push(child.title)
                })

                if (lowered.length > 0) {
                    const tierLabel = PERMISSION_TIERS[tier]?.description || PERMISSION_TIERS[tier]?.label || String(tier)
                    showLowerToast(
                        `Set to ${tierLabel}. Auto-lowered: ${lowered.join(', ')}.`,
                        () => {
                            mod.children.forEach((child: any) => {
                                handlePermissionChange(child.id, beforeSnapshot[child.id] as PermissionTier, false)
                            })
                            handlePermissionChange(resourceId, beforeSnapshot[resourceId] ?? tier, true)
                        },
                    )
                } else {
                    dismissToast()
                }
            }, 0)
        },
        [handlePermissionChange, groupedResources, permissionLevels, showLowerToast, dismissToast],
    )

    // ── Module summary ───────────────────────────────────────────────────────
    const getModuleSummary = useCallback((children: any[]) => {
        const counts = new Map<string, number>()
        children.forEach((child) => {
            const level = (permissionLevels as any)[child.id] || 'No access'
            counts.set(level, (counts.get(level) || 0) + 1)
        })
        const parts = Array.from(counts, ([label, count]) => `${count} ${label}`)
        return `${children.length} items · ${parts.join(', ')}`
    }, [permissionLevels])

    // ── Collapse/expand ──────────────────────────────────────────────────────
    const toggleModuleExpansion = (moduleId: string) => {
        setExpandedModules((prev: Set<string>) => {
            const next = new Set(prev)
            if (next.has(moduleId)) next.delete(moduleId)
            else next.add(moduleId)
            return next
        })
    }

    // ── Role navigation helpers ──────────────────────────────────────────────
    const resolveRoleId = (): number | undefined => {
        const match = roles.find((r: any) => r.name?.toLowerCase() === selectedRole?.toLowerCase())
        return match?.id
    }

    const onRoleSelect = (roleName: string, newRoleId: number) => {
        if (newRoleId === roleId) return
        const changeRole = () => {
            onRoleChange(roleName)
            setRoleId(newRoleId)
            const newParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
            newParams.set('role', roleName)
            if (typeof window !== 'undefined') window.history.replaceState({}, '', `?${newParams.toString()}`)
        }
        if (hasUnsavedChanges) {
            setPendingAction(() => changeRole)
            setShowWarningModal(true)
        } else {
            changeRole()
        }
    }

    const onKeepAndContinue = async () => {
        const actionToRun = pendingAction
        const routeToGo = pendingRoute
        await handleSaveAllPermissions(resolveRoleId)
        setShowWarningModal(false)
        setPendingAction(null)
        setPendingRoute(null)
        if (actionToRun) { actionToRun(); return }
        if (!routeToGo) return
        if (routeToGo === 'back') window.history.back()
        else if (routeToGo === 'forward') window.history.forward()
        else if (routeToGo.startsWith('http')) window.location.href = routeToGo
        else router.push(routeToGo)
    }

    useEffect(() => {
        if (pendingTab && pendingTab !== 'roles' && hasUnsavedChanges) {
            setPendingAction(() => () => { onTabSwitch?.(pendingTab) })
            setShowWarningModal(true)
        } else if (pendingTab && pendingTab !== 'roles' && !hasUnsavedChanges) {
            onTabSwitch?.(pendingTab)
        }
    }, [pendingTab, hasUnsavedChanges, onTabSwitch, setPendingAction, setShowWarningModal])

    // ── Lock focus when any Select (dropdown) is open ────────────────────────
    useEffect(() => {
        const onPointerDown = (e: PointerEvent) => {
            // Radix Select portals to body; if click target is inside a [data-radix-select-content]
            // or [data-radix-popper-content-wrapper], lock focus
            const target = e.target as HTMLElement
            const isInsideDropdown = target.closest(
                '[data-radix-select-content],[data-radix-popper-content-wrapper]',
            )
            if (isInsideDropdown) {
                setFocusLocked(true)
            } else {
                setFocusLocked(false)
            }
        }
        document.addEventListener('pointerdown', onPointerDown)
        return () => document.removeEventListener('pointerdown', onPointerDown)
    }, [])

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4">
            <UnsavedChangesDialog
                open={showWarningModal}
                onOpenChange={setShowWarningModal}
                selectedRole={selectedRole}
                onDiscard={() => discardChanges()}
                onKeep={onKeepAndContinue}
            />

            {toast && (
                <LowerToast
                    message={toast.message}
                    onUndo={() => { toast.onUndo(); dismissToast() }}
                    onDismiss={dismissToast}
                />
            )}

            {/* Header */}
            <div className="space-y-1">
                <h2 className="text-base text-left font-semibold tracking-tight">Manage Role Functions</h2>
                <p className="text-xs text-muted-foreground text-left">Configure role permissions and manage system actions</p>
            </div>

            {/* Role selector row */}
            <div className="flex flex-wrap items-center gap-3">
                <RoleList roles={roles} selectedRole={selectedRole} onRoleChange={onRoleSelect} />
            </div>

            {isAdminRole && (
                <p className="text-[11px] text-muted-foreground">
                    <span className="font-semibold">Admin</span> has full access by default and permissions cannot be modified.
                </p>
            )}

            {isOwnRole && !isAdminRole && (
                <div className="flex items-center gap-3 rounded-md border border-warning/30 bg-warning-light px-3 py-2 text-xs text-warning-dark">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <p>You can&apos;t modify your own role&apos;s permissions. Switch to another role with sufficient privileges.</p>
                </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
                <p className="font-medium text-foreground">An item can never have more access than the item above it.</p>
                {[
                    { chip: <span className="inline-flex h-[22px] min-w-[30px] items-center justify-center rounded-full bg-primary px-2 font-semibold text-white">✓</span>, label: 'Granted' },
                    { chip: <span className="inline-flex h-[22px] min-w-[30px] items-center justify-center rounded-full border border-dashed border-border bg-background px-2 text-muted-foreground">–</span>, label: 'Not granted' },
                    { chip: <span className="inline-flex h-[22px] min-w-[30px] items-center justify-center rounded-full bg-muted px-2 text-muted-foreground">⊘</span>, label: 'Locked by parent' },
                ].map(({ chip, label }) => (
                    <div key={label} className="flex items-center gap-1.5">{chip}<span>{label}</span></div>
                ))}
            </div>

            {/* Sticky column header */}
            <div className="sticky top-0 z-20 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <table className="w-full table-fixed border-collapse text-[11px] font-medium text-muted-foreground">
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
                            <th className="border-r border-border px-3 text-left font-medium">Role Actions</th>
                            <th className="border-r border-border px-3 text-left font-medium">Permission Level</th>
                            {['View', 'Create', 'Edit', 'Manager'].map((label) => (
                                <th key={label} className="px-1 text-center font-medium">{label}</th>
                            ))}
                        </tr>
                    </thead>
                </table>
            </div>

            {/* Permission sections */}
            <div className="space-y-3">
                {loading ? (
                    <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">Loading resources…</div>
                ) : roleActions.length === 0 ? (
                    <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">No resources found.</div>
                ) : (
                    Object.entries(groupedResources as Record<string, { id: string; children: any[] }>).map(([moduleName, mod]) => {
                        const isExpanded = (expandedModules as Set<string>).has(mod.id)
                        const inheritedParentLevel = mod.children.length
                            ? mod.children.reduce((acc: number, child: any) => {
                                const lvl = (permissionLevels as any)[child.id] || 'No access'
                                return Math.max(acc, permissionLevelToTier(lvl))
                            }, 0)
                            : 0
                        const parentLevel = parentLevelOverrides[mod.id] ?? inheritedParentLevel
                        const isParentLocked = (parentLockedModules as Set<string>).has(mod.id)
                        const showDisabledMessage = isParentLocked && parentLevel === 0

                        // Which child (if any) is hovered inside this specific card
                        // -1 = header hovered, number = child hovered, null = not this card
                        const isThisCardActive = hoveredState?.moduleId === mod.id
                        const cardFocusedId: number | null = !isThisCardActive
                            ? null
                            : hoveredState!.childId === null
                                ? -1   // header hovered → sentinel
                                : hoveredState!.childId

                        return (
                            <CardSection
                                key={mod.id}
                                moduleName={moduleName}
                                mod={mod}
                                isExpanded={isExpanded}
                                parentLevel={parentLevel}
                                showDisabledMessage={showDisabledMessage}
                                permissionLevels={permissionLevels}
                                permissionsData={permissionsData}
                                // null = header hovered (whole card in focus, no specific child)
                                // number = specific child hovered
                                focusedId={cardFocusedId}
                                focusLocked={focusLocked}
                                isAdminRole={isAdminRole}
                                isOwnRole={isOwnRole}
                                isAnyFocused={isAnyFocused}
                                onToggleExpand={() => toggleModuleExpansion(mod.id)}
                                onChildMouseEnter={(childId) => {
                                    if (focusLocked) return
                                    setHoveredState({ moduleId: mod.id, childId })
                                }}
                                onChildMouseLeave={() => {
                                    if (focusLocked) return
                                    setHoveredState(null)
                                }}
                                onHeaderMouseEnter={() => {
                                    if (focusLocked) return
                                    // null childId = header hovered
                                    setHoveredState({ moduleId: mod.id, childId: null })
                                }}
                                onHeaderMouseLeave={() => {
                                    if (focusLocked) return
                                    setHoveredState(null)
                                }}
                                onPermissionChange={handlePermissionChange}
                                onPermissionChangeParent={handlePermissionChangeWithToast}
                                getModuleSummary={getModuleSummary}
                            />
                        )
                    })
                )}
            </div>

            {/* Save button */}
            <div className="flex justify-end pt-2">
                <Button
                    onClick={() => handleSaveAllPermissions(resolveRoleId)}
                    disabled={!hasUnsavedChanges || assigning || isOwnRole || (isAdminRole && currentUserRole !== 'super_admin')}
                    className="h-8 rounded-md bg-success px-4 text-xs font-semibold text-white hover:bg-success/90"
                    size="sm"
                >
                    <Save className="mr-2 h-3.5 w-3.5" />
                    {assigning ? 'Saving…' : 'Save Changes'}
                </Button>
            </div>
        </div>
    )
}

export default RoleManagementPanel
