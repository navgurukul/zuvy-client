'use client'

import {
    Code2,
    FileCode2,
    FileJson,
    FileText,
    Palette,
    X,
} from 'lucide-react'

interface EditorTabsProps {
    openTabs: string[]
    activeFile: string
    onSelectTab: (filename: string) => void
    onCloseTab: (filename: string) => void
    isDark: boolean
}

function getTabIcon(filename: string) {
    const ext = filename.split('.').pop()?.toLowerCase() ?? ''
    const base = 'h-3.5 w-3.5 shrink-0'
    switch (ext) {
        case 'jsx':
        case 'tsx':
            return <FileCode2 className={`${base} text-sky-400`} />
        case 'ts':
        case 'js':
            return <Code2 className={`${base} text-yellow-400`} />
        case 'css':
            return <Palette className={`${base} text-pink-400`} />
        case 'json':
            return <FileJson className={`${base} text-orange-400`} />
        default:
            return <FileText className={`${base} text-muted-foreground`} />
    }
}

export function EditorTabs({
    openTabs,
    activeFile,
    onSelectTab,
    onCloseTab,
    isDark,
}: EditorTabsProps) {
    if (openTabs.length === 0) return null

    return (
        <div
            className={`flex h-9 shrink-0 items-end overflow-x-auto border-b scrollbar-none
                ${isDark ? 'border-white/10 bg-[#1e1e1e]' : 'border-border bg-card'}`}
        >
            {openTabs.map((filename) => {
                const isActive = filename === activeFile
                return (
                    <div
                        key={filename}
                        onClick={() => onSelectTab(filename)}
                        className={`group relative flex h-8 min-w-0 max-w-[160px] shrink-0 cursor-pointer select-none items-center gap-1.5 border-r px-3 text-xs transition-colors
                            ${isDark ? 'border-white/10' : 'border-border'}
                            ${isActive
                                ? isDark
                                    ? 'bg-[#1f1f1f] text-white'
                                    : 'bg-background text-foreground'
                                : isDark
                                    ? 'bg-[#2d2d2d] text-gray-400 hover:bg-[#252525] hover:text-gray-200'
                                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                    >
                        {/* Active indicator */}
                        {isActive && (
                            <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
                        )}

                        {getTabIcon(filename)}

                        <span className="truncate font-medium">
                            {filename.split('/').pop()}
                        </span>

                        {/* Close button */}
                        <button
                            title={`Close ${filename}`}
                            onClick={(e) => {
                                e.stopPropagation()
                                onCloseTab(filename)
                            }}
                            className={`ml-auto shrink-0 rounded p-0.5 opacity-0 transition-opacity
                                group-hover:opacity-100
                                ${isActive ? 'opacity-60 hover:opacity-100' : ''}
                                hover:bg-destructive/20 hover:text-destructive`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
