export interface RemirrorFormProps {
    description: any
    onChange?: (html: string) => void
    onValidationChange?: (isValid: boolean) => void 
    preview?: boolean
    bigScreen?: boolean
}



//  RemirrorTextEditor
export interface RemirrorTextEditorProps {
    initialContent: any
    setInitialContent: (content: any) => void
    preview?: boolean
    hideBorder?: boolean
    assignmentSide?: boolean
}

