'use client'
import { useRef } from 'react'

import MonacoEditor from '@monaco-editor/react'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/plugins/babel'
import estreePlugin from 'prettier/plugins/estree'
import codeShift from 'jscodeshift'
import Highlighter from 'monaco-jsx-highlighter'
import './syntax.css'
import { Button } from '@/components/ui/button'

interface CodeEditorProps {
    initialValue: string
    onChange(value: string | undefined): void
}
const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue, onChange }) => {
    const editorRef = useRef<any>()
    // const onEditorDidMount = (getValue: () => string, monacoEditor: any) => {
    //     console.log(
    //         monacoEditor.onDidChangeModelContent(() => {
    //             onChange(getValue())
    //         })
    //     )
    // }
    function handleEditorDidMount(editor: any, monaco: any) {
        editorRef.current = editor
        // here is the editor instance
        // you can store it in `useRef` for further usage
        // console.log(monaco)
        // monaco.getModel().updateOptions({ tabSize: 2 })
        const highlighter = new Highlighter(
            // @ts-ignore
            window.monaco,
            codeShift,
            editor
        )
        highlighter.highLightOnDidChangeModelContent(
            () => {},
            () => {},
            undefined,
            () => {}
        )
    }
    const onValueChange = (input: string) => {
        onChange(input)
    }
    function onFormatHandler() {
        const model = editorRef.current.getModel()
        const unformatted = model.getValue()
        prettier
            .format(unformatted, {
                parser: 'babel',
                plugins: [parserBabel, estreePlugin],
                semi: true,
                singleQuote: true,
                tabWidth: 2,
            })
            .then((formatted) => {
                model.setValue(formatted.replace(/\n$/, ''))
            })
            .catch((error) =>
                console.error('Prettier formatting error:', error)
            )
    }
    return (
        <div className="w-full h-full editor-wrapper relative group">
            <Button
                className="absolute text-white hover:text-white top-[5px] right-5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={onFormatHandler}
                variant={'ghost'}
            >
                Format
            </Button>
            <MonacoEditor
                onMount={handleEditorDidMount}
                onChange={(value) => onValueChange(value ?? '')}
                value={initialValue}
                height={'500px'}
                // width={'500px'}
                language="javascript"
                theme="vs-dark"
                options={{
                    wordWrap: 'on',
                    minimap: { enabled: false },
                    showUnused: false,
                    folding: false,
                    fontSize: 20,
                    lineNumbersMinChars: 3,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
            />
        </div>
    )
}

export default CodeEditor
