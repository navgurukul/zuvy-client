'use client'

import {
    ChevronDown,
    ChevronRight,
    Code2,
    FileCode2,
    FileJson,
    FilePlus2,
    FileText,
    FolderClosed,
    FolderOpen,
    Palette,
    Trash2,
    X,
} from 'lucide-react'
import { KeyboardEvent, useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FileTreeProps {
    files: Map<string, string>
    activeFile: string
    onSelectFile: (filename: string) => void
    onCreateFile: (filename: string) => void
    onDeleteFile: (filename: string) => void
    onRenameFile: (oldName: string, newName: string) => void
    isDark: boolean
}

interface TreeNode {
    name: string
    path: string
    isFolder: boolean
    children: TreeNode[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.json', '.html']
const PROTECTED_FILES = ['index.jsx', 'index.js']

function getFileIcon(filename: string) {
    const ext = filename.split('.').pop()?.toLowerCase() ?? ''
    const iconProps = { className: 'h-3.5 w-3.5 shrink-0' }

    switch (ext) {
        case 'jsx':
        case 'tsx':
            return <FileCode2 {...iconProps} className="h-3.5 w-3.5 shrink-0 text-sky-400" />
        case 'ts':
        case 'js':
            return <Code2 {...iconProps} className="h-3.5 w-3.5 shrink-0 text-yellow-400" />
        case 'css':
            return <Palette {...iconProps} className="h-3.5 w-3.5 shrink-0 text-pink-400" />
        case 'json':
            return <FileJson {...iconProps} className="h-3.5 w-3.5 shrink-0 text-orange-400" />
        default:
            return <FileText {...iconProps} className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    }
}

function buildTree(files: Map<string, string>): TreeNode[] {
    const root: TreeNode[] = []
    const folderMap = new Map<string, TreeNode>()

    const sortedFiles = Array.from(files.keys()).sort((a, b) => {
        // folders first, then files; alphabetical within each
        const aHasSlash = a.includes('/')
        const bHasSlash = b.includes('/')
        if (aHasSlash && !bHasSlash) return -1
        if (!aHasSlash && bHasSlash) return 1
        return a.localeCompare(b)
    })

    for (const filePath of sortedFiles) {
        const parts = filePath.split('/')
        if (parts.length === 1) {
            // Top-level file
            root.push({ name: parts[0], path: filePath, isFolder: false, children: [] })
        } else {
            // File inside folder(s)
            let currentLevel = root
            let currentPath = ''

            for (let i = 0; i < parts.length - 1; i++) {
                const folderName = parts[i]
                currentPath = currentPath ? `${currentPath}/${folderName}` : folderName

                let folder = folderMap.get(currentPath)
                if (!folder) {
                    folder = { name: folderName, path: currentPath, isFolder: true, children: [] }
                    folderMap.set(currentPath, folder)
                    currentLevel.push(folder)
                }
                currentLevel = folder.children
            }

            currentLevel.push({
                name: parts[parts.length - 1],
                path: filePath,
                isFolder: false,
                children: [],
            })
        }
    }

    return root
}

// ─── Inline Input Component ───────────────────────────────────────────────────

interface InlineInputProps {
    defaultValue?: string
    placeholder: string
    onCommit: (value: string) => void
    onCancel: () => void
}

function InlineInput({ defaultValue = '', placeholder, onCommit, onCancel }: InlineInputProps) {
    const [value, setValue] = useState(defaultValue)
    const [error, setError] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
    }, [])

    const validate = (v: string): string => {
        if (!v.trim()) return 'Name cannot be empty.'
        if (v.includes(' ')) return 'No spaces allowed.'
        if (!v.startsWith('/')) {
            const ext = '.' + (v.split('.').pop() ?? '')
            if (!VALID_EXTENSIONS.includes(ext) && !v.includes('/')) {
                return `Use one of: ${VALID_EXTENSIONS.join(', ')}`
            }
        }
        return ''
    }

    const commit = () => {
        const err = validate(value)
        if (err) { setError(err); return }
        onCommit(value.trim())
    }

    const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') onCancel()
    }

    return (
        <div className="px-2 py-1">
            <input
                ref={inputRef}
                value={value}
                onChange={(e) => { setValue(e.target.value); setError('') }}
                onKeyDown={onKey}
                onBlur={commit}
                placeholder={placeholder}
                className="w-full rounded border border-primary bg-background px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-primary"
            />
            {error && <p className="mt-0.5 text-[10px] text-destructive">{error}</p>}
        </div>
    )
}

// ─── Tree Node Row ────────────────────────────────────────────────────────────

interface TreeNodeRowProps {
    node: TreeNode
    depth: number
    activeFile: string
    renamingPath: string | null
    onSelectFile: (filename: string) => void
    onDeleteFile: (filename: string) => void
    onStartRename: (path: string) => void
    onCommitRename: (oldName: string, newName: string) => void
    onCancelRename: () => void
}

function TreeNodeRow({
    node,
    depth,
    activeFile,
    renamingPath,
    onSelectFile,
    onDeleteFile,
    onStartRename,
    onCommitRename,
    onCancelRename,
}: TreeNodeRowProps) {
    const [isOpen, setIsOpen] = useState(true)
    const [hovered, setHovered] = useState(false)
    const isActive = !node.isFolder && node.path === activeFile
    const isProtected = PROTECTED_FILES.includes(node.path)
    const isRenaming = renamingPath === node.path

    const indent = depth * 12

    return (
        <>
            {isRenaming ? (
                <InlineInput
                    defaultValue={node.name}
                    placeholder="New name…"
                    onCommit={(newName) => {
                        // Build full new path (preserve folder prefix)
                        const prefix = node.path.substring(0, node.path.lastIndexOf('/') + 1)
                        onCommitRename(node.path, prefix + newName)
                    }}
                    onCancel={onCancelRename}
                />
            ) : (
                <div
                    className={`group flex cursor-pointer items-center justify-between rounded-sm pr-1 transition-colors
                        ${isActive
                            ? 'bg-primary/15 text-primary'
                            : 'text-foreground hover:bg-muted/50'
                        }`}
                    style={{ paddingLeft: `${indent + 6}px` }}
                    onClick={() => {
                        if (node.isFolder) setIsOpen((o) => !o)
                        else onSelectFile(node.path)
                    }}
                    onDoubleClick={() => {
                        if (!isProtected) onStartRename(node.path)
                    }}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    {/* Icon + label */}
                    <div className="flex min-w-0 items-center gap-1.5 py-1">
                        {node.isFolder ? (
                            <>
                                <span className="text-muted-foreground">
                                    {isOpen
                                        ? <ChevronDown className="h-3 w-3" />
                                        : <ChevronRight className="h-3 w-3" />
                                    }
                                </span>
                                {isOpen
                                    ? <FolderOpen className="h-3.5 w-3.5 shrink-0 text-yellow-400" />
                                    : <FolderClosed className="h-3.5 w-3.5 shrink-0 text-yellow-400" />
                                }
                            </>
                        ) : (
                            <span className="ml-3">{getFileIcon(node.name)}</span>
                        )}
                        <span className="truncate text-xs">{node.name}</span>
                    </div>

                    {/* Action buttons (hover) */}
                    {/* {!node.isFolder && hovered && (
                        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            {!isProtected && (
                                <button
                                    title="Delete file"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDeleteFile(node.path)
                                    }}
                                    className="rounded p-0.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    )} */}
                </div>
            )}

            {/* Children */}
            {node.isFolder && isOpen && node.children.map((child) => (
                <TreeNodeRow
                    key={child.path}
                    node={child}
                    depth={depth + 1}
                    activeFile={activeFile}
                    renamingPath={renamingPath}
                    onSelectFile={onSelectFile}
                    onDeleteFile={onDeleteFile}
                    onStartRename={onStartRename}
                    onCommitRename={onCommitRename}
                    onCancelRename={onCancelRename}
                />
            ))}
        </>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FileTree({
    files,
    activeFile,
    onSelectFile,
    onCreateFile,
    onDeleteFile,
    onRenameFile,
    isDark,
}: FileTreeProps) {
    const [isAddingFile, setIsAddingFile] = useState(false)
    const [renamingPath, setRenamingPath] = useState<string | null>(null)
    const [createError, setCreateError] = useState('')

    const tree = buildTree(files)

    const handleCreateFile = (name: string) => {
        if (files.has(name)) {
            setCreateError(`"${name}" already exists.`)
            return
        }
        onCreateFile(name)
        setIsAddingFile(false)
        setCreateError('')
    }


    const handleRename = (oldPath: string, newPath: string) => {
        if (files.has(newPath)) {
            // Don't allow rename to existing file — just cancel
            setRenamingPath(null)
            return
        }
        onRenameFile(oldPath, newPath)
        setRenamingPath(null)
    }

    return (
        <div
            className={`flex h-full flex-col overflow-hidden text-sm
                ${isDark ? 'bg-[#1e1e1e]' : 'bg-card'}`}
        >
            {/* Header */}
            <div
                className={`flex h-10 shrink-0 items-center justify-between border-b px-3
                    ${isDark ? 'border-white/10 bg-[#252526]' : 'border-border bg-card'}`}
            >
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Explorer
                </span>
                {/* <div className="flex items-center gap-1">
                    <button
                        title="New file"
                        onClick={() => setIsAddingFile(true)}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <FilePlus2 className="h-3.5 w-3.5" />
                    </button>
                </div> */}
            </div>

            {/* Project label */}
            <div className="flex items-center gap-1 px-3 py-2">
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">REACT PROJECT</span>
            </div>

            {/* New file input */}
            {/* {isAddingFile && (
                <>
                    <InlineInput
                        placeholder="filename.jsx"
                        onCommit={handleCreateFile}
                        onCancel={() => { setIsAddingFile(false); setCreateError('') }}
                    />
                    {createError && (
                        <p className="px-3 text-[10px] text-destructive">{createError}</p>
                    )}
                </>
            )} */}


            {/* Tree nodes */}
            <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-4">
                {tree.map((node) => (
                    <TreeNodeRow
                        key={node.path}
                        node={node}
                        depth={0}
                        activeFile={activeFile}
                        renamingPath={renamingPath}
                        onSelectFile={onSelectFile}
                        onDeleteFile={onDeleteFile}
                        onStartRename={(path) => setRenamingPath(path)}
                        onCommitRename={handleRename}
                        onCancelRename={() => setRenamingPath(null)}
                    />
                ))}
            </div>
        </div>
    )
}
