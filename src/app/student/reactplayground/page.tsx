'use client'

import Editor from '@monaco-editor/react'
import * as esbuild from 'esbuild-wasm'
import {
    AlertCircle,
    Braces,
    CheckCircle2,
    Circle,
    Code2,
    FileCode2,
    Loader2,
    MonitorPlay,
    Moon,
    Play,
    RefreshCw,
    Sparkles,
    Sun,
    Terminal,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable'
import { useThemeStore } from '@/store/store'

import { fetchPlugin } from './_components/plugins/fetchplugin'
import { unpkgPathPlugin } from './_components/plugins/unpkgPathPlugin'

type ConsoleEntry = {
    id: number
    type: 'info' | 'success' | 'error'
    title: string
    message: string
}

type PreviewMessage = {
    source?: 'react-playground-preview'
    type?: 'ready' | 'runtime-error' | 'console-error'
    message?: string
    stack?: string
}

const starterCode = `import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const skills = ['Components', 'Hooks', 'Modern UI'];

  return (
    <main style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: 32 }}>
      <section
        style={{
          maxWidth: 720,
          margin: '0 auto',
          border: '1px solid #e5e7eb',
          borderRadius: 16,
          padding: 28,
          boxShadow: '0 20px 55px rgba(15, 23, 42, 0.08)',
        }}
      >
        <p style={{ color: '#2563eb', fontWeight: 700, margin: 0 }}>
          React Playground
        </p>
        <h1 style={{ fontSize: 38, margin: '10px 0 12px' }}>
          Build something polished.
        </h1>
        <p style={{ color: '#4b5563', lineHeight: 1.7 }}>
          Edit this code, import packages from npm, and run the preview.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24 }}>
          {skills.map((skill) => (
            <span
              key={skill}
              style={{
                background: '#ecfeff',
                border: '1px solid #a5f3fc',
                borderRadius: 999,
                color: '#0f766e',
                padding: '8px 12px',
                fontWeight: 700,
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);`

const ReactPlayGround = () => {
    const { isDark, toggleTheme } = useThemeStore()
    const serviceRef = useRef<esbuild.Service | null>(null)
    const iframeRef = useRef<HTMLIFrameElement | null>(null)
    const consoleIdRef = useRef(0)
    const [input, setInput] = useState('')
    const [isServiceReady, setIsServiceReady] = useState(false)
    const [isBuilding, setIsBuilding] = useState(false)
    const [lastRunStatus, setLastRunStatus] = useState<
        'idle' | 'success' | 'error'
    >('idle')
    const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([
        {
            id: 0,
            type: 'info',
            title: 'Ready',
            message: 'Run your React code to see the preview.',
        },
    ])
    const editorTheme = isDark ? 'vs-dark' : 'vs'
    const editorShellClass = isDark
        ? 'bg-[#1f1f1f] text-white'
        : 'bg-card text-foreground'
    const editorHeaderClass = isDark
        ? 'border-white/10 bg-[#252526] text-white'
        : 'border-border bg-card text-foreground'

    const addConsoleEntry = (
        entry: Omit<ConsoleEntry, 'id'>,
        options?: { replace?: boolean }
    ) => {
        const nextEntry = {
            ...entry,
            id: consoleIdRef.current + 1,
        }
        consoleIdRef.current += 1
        setConsoleEntries((current) =>
            options?.replace ? [nextEntry] : [...current, nextEntry]
        )
    }

    const htmlDoc = useMemo(
        () => `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      html, body, #root {
        min-height: 100%;
        margin: 0;
      }
      body {
        background: ${isDark ? '#111827' : '#ffffff'};
        color: ${isDark ? '#e5e7eb' : '#111827'};
      }
      #root:empty::before {
        content: 'Run your code to render the preview.';
        display: grid;
        min-height: 100vh;
        place-items: center;
        color: ${isDark ? '#9ca3af' : '#6b7280'};
        font-family: Inter, system-ui, sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      const sendToParent = (payload) => {
        window.parent.postMessage({
          source: 'react-playground-preview',
          ...payload,
        }, '*');
      };

      const originalConsoleError = console.error;
      console.error = (...args) => {
        originalConsoleError(...args);
        sendToParent({
          type: 'console-error',
          message: args.map((item) => {
            if (item instanceof Error) {
              return item.stack || item.message;
            }
            if (typeof item === 'object') {
              try {
                return JSON.stringify(item, null, 2);
              } catch {
                return String(item);
              }
            }
            return String(item);
          }).join('\\n'),
        });
      };

      window.addEventListener('error', (event) => {
        sendToParent({
          type: 'runtime-error',
          message: event.message,
          stack: event.error?.stack,
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        sendToParent({
          type: 'runtime-error',
          message: reason?.message || String(reason),
          stack: reason?.stack,
        });
      });

      window.addEventListener('message', (event) => {
        try {
          document.getElementById('root').innerHTML = '';
          eval(event.data);
        } catch (error) {
          sendToParent({
            type: 'runtime-error',
            message: error?.message || String(error),
            stack: error?.stack,
          });
        }
      }, false);
    </script>
  </body>
</html>`,
        [isDark]
    )

    useEffect(() => {
        let isMounted = true

        const startService = async () => {
            try {
                serviceRef.current = await esbuild.startService({
                    worker: true,
                    wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
                })

                if (isMounted) {
                    setIsServiceReady(true)
                    addConsoleEntry(
                        {
                            type: 'success',
                            title: 'Bundler ready',
                            message: 'esbuild is ready to compile React JSX.',
                        },
                        { replace: true }
                    )
                }
            } catch (error) {
                if (isMounted) {
                    setLastRunStatus('error')
                    addConsoleEntry(
                        {
                            type: 'error',
                            title: 'Bundler failed to start',
                            message:
                                error instanceof Error
                                    ? error.message
                                    : 'Unable to load esbuild.',
                        },
                        { replace: true }
                    )
                }
            }
        }

        startService()

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        const handlePreviewMessage = (event: MessageEvent<PreviewMessage>) => {
            if (event.data?.source !== 'react-playground-preview') {
                return
            }

            if (event.data.type === 'runtime-error') {
                setLastRunStatus('error')
                addConsoleEntry({
                    type: 'error',
                    title: 'Runtime error',
                    message:
                        event.data.stack ||
                        event.data.message ||
                        'The preview crashed while running your code.',
                })
            }

            if (event.data.type === 'console-error') {
                setLastRunStatus('error')
                addConsoleEntry({
                    type: 'error',
                    title: 'Console error',
                    message: event.data.message || 'console.error was called.',
                })
            }
        }

        window.addEventListener('message', handlePreviewMessage)

        return () => {
            window.removeEventListener('message', handlePreviewMessage)
        }
    }, [])

    const runCode = async () => {
        if (!serviceRef.current || !iframeRef.current?.contentWindow) {
            addConsoleEntry(
                {
                    type: 'info',
                    title: 'Still loading',
                    message: 'The compiler is starting. Try running again in a moment.',
                },
                { replace: true }
            )
            return
        }

        setIsBuilding(true)
        setLastRunStatus('idle')
        addConsoleEntry(
            {
                type: 'info',
                title: 'Building',
                message: 'Bundling your React app and npm imports...',
            },
            { replace: true }
        )

        try {
            const result = await serviceRef.current.build({
                entryPoints: ['index.js'],
                bundle: true,
                write: false,
                plugins: [unpkgPathPlugin(), fetchPlugin(input)],
                define: {
                    'process.env.NODE_ENV': '"production"',
                    global: 'window',
                },
            })

            iframeRef.current.contentWindow.postMessage(
                result.outputFiles[0].text,
                '*'
            )
            setLastRunStatus('success')
            addConsoleEntry(
                {
                    type: 'success',
                    title: 'Compiled successfully',
                    message: `Preview updated at ${new Date().toLocaleTimeString()}.`,
                },
                { replace: true }
            )
        } catch (error) {
            setLastRunStatus('error')
            addConsoleEntry(
                {
                    type: 'error',
                    title: 'Build error',
                    message:
                        error instanceof Error
                            ? error.message
                            : 'The compiler could not bundle this code.',
                },
                { replace: true }
            )
        } finally {
            setIsBuilding(false)
        }
    }

    const resetCode = () => {
        setInput(starterCode)
        setLastRunStatus('idle')
        setConsoleEntries([
            {
                id: consoleIdRef.current + 1,
                type: 'info',
                title: 'Reset',
                message: 'Starter React code has been restored.',
            },
        ])
        consoleIdRef.current += 1
    }

    return (
        <main
            className={`${isDark ? 'dark' : ''} flex min-h-screen flex-col bg-background text-foreground`}
        >
            <header className="border-b border-border bg-card">
                <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="truncate text-lg font-semibold leading-none">
                                    React Studio
                                </h1>
                                <span className="inline-flex items-center gap-1 rounded-md border border-accent/30 bg-accent-light px-2 py-0.5 text-xs font-semibold text-accent-dark dark:bg-accent/15 dark:text-accent">
                                    <Sparkles className="h-3 w-3" />
                                    Playground
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Edit, run, preview, and debug React in one focused workspace.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground">
                            {lastRunStatus === 'success' && (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                            )}
                            {lastRunStatus === 'error' && (
                                <AlertCircle className="h-4 w-4 text-destructive" />
                            )}
                            {lastRunStatus === 'idle' && (
                                <Circle className="h-2.5 w-2.5 fill-muted-foreground text-muted-foreground" />
                            )}
                            {isServiceReady ? 'Compiler ready' : 'Starting compiler'}
                        </div>
                        <div className="hidden h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground md:flex">
                            <Braces className="h-4 w-4 text-primary" />
                            esbuild + unpkg
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={toggleTheme}
                            className="h-9 w-9 bg-background p-0"
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={resetCode}
                            className="h-9 gap-2 bg-background"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Reset
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={runCode}
                            disabled={!isServiceReady || isBuilding}
                            className="h-9 gap-2 bg-primary px-5 text-primary-foreground shadow-medium hover:bg-primary-dark"
                        >
                            {isBuilding ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Play className="h-4 w-4 fill-current" />
                            )}
                            Run
                        </Button>
                    </div>
                </div>
            </header>

            <section className="min-h-0 flex-1 bg-muted/40 p-3">
                <div className="flex h-[calc(100vh-86px)] min-h-[700px] flex-col overflow-hidden rounded-md border border-border bg-card shadow-strong">
                    <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-card px-3">
                        <div className="flex items-center gap-1">
                            <span className="flex h-8 items-center gap-2 rounded-md bg-primary/10 px-3 text-sm font-semibold text-primary">
                                <FileCode2 className="h-4 w-4" />
                                index.jsx
                            </span>
                            <span className="hidden h-8 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground md:flex">
                                <MonitorPlay className="h-4 w-4" />
                                Preview
                            </span>
                            <span className="hidden h-8 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground md:flex">
                                <Terminal className="h-4 w-4" />
                                Console
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-md border border-border bg-background px-2 py-1">
                                React 18
                            </span>
                            <span className="rounded-md border border-border bg-background px-2 py-1">
                                JSX
                            </span>
                        </div>
                    </div>

                    <ResizablePanelGroup direction="vertical" className="min-h-0 flex-1">
                        <ResizablePanel defaultSize={74} minSize={50}>
                            <ResizablePanelGroup direction="horizontal">
                                <ResizablePanel defaultSize={50} minSize={30}>
                                    <div className={`flex h-full flex-col ${editorShellClass}`}>
                                        <div
                                            className={`flex h-10 items-center justify-between border-b px-3 ${editorHeaderClass}`}
                                        >
                                            <div className="flex items-center gap-2 text-sm font-semibold">
                                                <FileCode2 className="h-4 w-4 text-accent" />
                                                Editor
                                            </div>
                                            <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                Monaco
                                            </span>
                                        </div>
                                        <div className="min-h-0 flex-1">
                                            <Editor
                                                height="100%"
                                                language="javascript"
                                                theme={editorTheme}
                                                value={input}
                                                onChange={(value) => setInput(value || '')}
                                                loading={
                                                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                                        Loading editor...
                                                    </div>
                                                }
                                                options={{
                                                    automaticLayout: true,
                                                    bracketPairColorization: { enabled: true },
                                                    fontSize: 14,
                                                    formatOnPaste: true,
                                                    formatOnType: true,
                                                    insertSpaces: true,
                                                    lineHeight: 22,
                                                    minimap: { enabled: false },
                                                    padding: { top: 16, bottom: 16 },
                                                    scrollBeyondLastLine: false,
                                                    tabSize: 2,
                                                    wordWrap: 'on',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </ResizablePanel>

                                <ResizableHandle
                                    withHandle
                                    className="bg-border/70 transition-colors hover:bg-primary/40"
                                />

                                <ResizablePanel defaultSize={50} minSize={30}>
                                    <div className="flex h-full flex-col bg-background">
                                        <div className="flex h-10 items-center justify-between border-b border-border bg-card px-3">
                                            <div className="flex items-center gap-2 text-sm font-semibold">
                                                <MonitorPlay className="h-4 w-4 text-primary" />
                                                Preview
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Circle className="h-2 w-2 fill-success text-success" />
                                                isolated iframe
                                            </div>
                                        </div>
                                        <div className="min-h-0 flex-1 bg-muted/30 p-3">
                                            <iframe
                                                ref={iframeRef}
                                                title="React playground preview"
                                                sandbox="allow-scripts"
                                                srcDoc={htmlDoc}
                                                className="h-full w-full rounded-md border border-border bg-background shadow-soft"
                                            />
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>

                        <ResizableHandle
                            withHandle
                            className="bg-border/70 transition-colors hover:bg-primary/40"
                        />

                        <ResizablePanel defaultSize={26} minSize={16}>
                            <div className="flex h-full flex-col bg-card">
                                <div className="flex h-10 items-center justify-between border-b border-border px-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <Terminal className="h-4 w-4 text-primary" />
                                        Console
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setConsoleEntries([])}
                                        className="h-8 px-2 text-xs"
                                    >
                                        Clear
                                    </Button>
                                </div>
                                <div className="min-h-0 flex-1 overflow-auto bg-background p-3 font-mono text-sm">
                                    {consoleEntries.length === 0 ? (
                                        <div className="flex h-full items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
                                            Console cleared.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {consoleEntries.map((entry) => (
                                                <div
                                                    key={entry.id}
                                                    className="rounded-md border border-border bg-card px-3 py-2"
                                                >
                                                    <div className="mb-1 flex items-center gap-2 font-semibold">
                                                        {entry.type === 'success' && (
                                                            <CheckCircle2 className="h-4 w-4 text-success" />
                                                        )}
                                                        {entry.type === 'error' && (
                                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                                        )}
                                                        {entry.type === 'info' && (
                                                            <Terminal className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                        <span
                                                            className={
                                                                entry.type === 'error'
                                                                    ? 'text-destructive'
                                                                    : entry.type === 'success'
                                                                      ? 'text-success'
                                                                      : ''
                                                            }
                                                        >
                                                            {entry.title}
                                                        </span>
                                                    </div>
                                                    <pre className="whitespace-pre-wrap break-words text-muted-foreground">
                                                        {entry.message}
                                                    </pre>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </section>
        </main>
    )
}

export default ReactPlayGround
