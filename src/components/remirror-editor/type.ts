// RemirrorForForm.tsx
export interface RemirrorFormProps {
    description: any
    onChange?: (html: string) => void
    preview?: boolean
    bigScreen?: boolean
}

//  RemirrorTextEditor
export interface RemirrorTextEditorProps {
    initialContent: any
    setInitialContent: (content: any) => void
    preview?: boolean
    hideBorder?: boolean
}