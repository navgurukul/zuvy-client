import React, { useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodingLanguage } from '@/utils/types/coding-challenge';
import { useThemeStore } from '@/store/store';
import{CodeEditorPanelProps} from '@/app/student/course/[courseId]/codingChallenge/components/courseCodingComponentType'

export function CodeEditorPanel({
    currentCode,
    language,
    isAlreadySubmitted,
    editorLanguages,
    onCodeChange,
    onLanguageChange,
}: CodeEditorPanelProps) {

    const isDarkMode = useThemeStore((state) => state.isDark)
    const theme = isDarkMode ? 'vs-dark' : 'vs'

    return (
        <div className="h-full ">
            {/* Editor Header */}
            <div className=" border-b border-border p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <h6 className="font-bold text-foreground">Code Editor</h6>
                    </div>

                    {/* Language Selector */}
                    <Select
                        value={language}
                        onValueChange={onLanguageChange}
                        disabled={isAlreadySubmitted}
                    >
                        <SelectTrigger className="w-48 border-border ">
                            <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent className=" border-border">
                            {editorLanguages.map((lang) => (
                                <SelectItem
                                    key={lang.id}
                                    value={lang.lang}
                                    className={`hover:bg-primary ${language === lang.lang ? 'text-white' : ''} focus:bg-primary cursor-pointer data-[highlighted]:bg-primary data-[state=checked]:bg-primary`}
                                >
                                    {lang.lang}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Monaco Editor */}
            <div style={{ height: 'calc(100% - 80px)' }}>
                <Editor
                    height="100%"
                    language={language}
                    theme={theme}
                    value={currentCode}
                    onChange={onCodeChange}
                    defaultValue={language || 'Please Select a language above!'}
                    options={{
                        wordWrap: 'on',
                        fontSize: 14,
                        lineHeight: 1.6,
                        minimap: { enabled: true },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        insertSpaces: true,
                        renderWhitespace: 'selection',
                        bracketPairColorization: { enabled: true },
                        readOnly: isAlreadySubmitted,
                        contextmenu: false,
                        suggestOnTriggerCharacters: false,
                        quickSuggestions: false,
                        parameterHints: { enabled: false },
   
    tabCompletion: 'off',
    acceptSuggestionOnEnter: 'off',
                    }}
                />
            </div>
        </div>
    );
} 