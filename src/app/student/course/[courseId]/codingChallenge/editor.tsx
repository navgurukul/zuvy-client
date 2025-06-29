'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { ChevronLeft, Code, Play, Upload, X } from 'lucide-react'
import { api } from '@/utils/axios.config'
import Editor from '@monaco-editor/react'
import { toast } from '@/components/ui/use-toast'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { b64DecodeUnicode, b64EncodeUnicode } from '@/utils/base64'

interface Input {
  parameterName: string
  parameterType: string
  parameterValue: [] | {}
}

interface TestCase {
  inputs: Input[] | Record<string, unknown>
  expectedOutput: {
    parameterType: string
    parameterValue: [] | {}
  }
}

interface QuestionDetails {
  title: string
  description: string
  constraints?: string
  examples: { input: number[]; output: number }
  testCases?: TestCase[]
  templates?: any
}

interface IDEProps {
  params: { editor: string }
  onBack?: () => void
}

const CodingEditor: React.FC<IDEProps> = ({ params, onBack }) => {
  const router = useRouter()
  
  // State management
  const [questionDetails, setQuestionDetails] = useState<QuestionDetails>({
    title: '',
    description: '',
    examples: { input: [], output: 0 },
    constraints: '',
  })
  const [currentCode, setCurrentCode] = useState('')
  const [result, setResult] = useState('')
  const [languageId, setLanguageId] = useState(100) // Default to Python
  const [language, setLanguage] = useState('python')
  const [codeError, setCodeError] = useState('')
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [templates, setTemplates] = useState<any>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [codeResult, setCodeResult] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [questionLoading, setQuestionLoading] = useState(true)

  const editorLanguages = [
    { lang: 'java', id: 96 },
    { lang: 'python', id: 100 },
    { lang: 'javascript', id: 102 },
  ]

  // Helper functions
  const getDataFromField = useCallback((
    array: any[],
    searchValue: any,
    searchField: string | number,
    targetField: string | number
  ) => {
    const found = array.find(obj => obj[searchField] === searchValue)
    return found ? found[targetField] : languageId
  }, [languageId])

  const formatValue = (value: any, type: string): string => {
    if (type === 'jsonType') {
      return JSON.stringify(value, null, 2)
    }

    if (Array.isArray(value)) {
      if (type === 'arrayOfNum') {
        return `[${value.join(', ')}]`
      }
      if (type === 'arrayOfStr') {
        return `[${value.map((v) => `"${v}"`).join(', ')}]`
      }
      return `[${value.join(', ')}]`
    }

    switch (type) {
      case 'int':
      case 'float':
        return value.toString()
      case 'str':
        return `"${value}"`
      default:
        return JSON.stringify(value)
    }
  }

  // Language change handler
  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang)
    const langID = getDataFromField(editorLanguages, lang, 'lang', 'id')
    setLanguageId(langID)
  }, [getDataFromField])

  // Code submission handler
  const handleSubmit = async (
    e: React.FormEvent,
    action: 'run' | 'submit'
  ) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post(
        `/codingPlatform/practicecode/questionId=${params.editor}?action=${action}`,
        {
          languageId: Number(getDataFromField(editorLanguages, language, 'lang', 'id')),
          sourceCode: b64EncodeUnicode(currentCode),
        }
      )

      setCodeResult(response.data.data)
      
      const allTestCasesPassed = response.data.data.every(
        (testCase: any) => testCase.status === 'Accepted'
      )

      if (action === 'submit') {
        setIsSubmitted(true)
        setIsOpen(true)
        setModalType(allTestCasesPassed ? 'success' : 'error')
        
        setTimeout(() => setIsOpen(false), 7000)
      } else if (allTestCasesPassed && action === 'run') {
        toast({
          title: 'Success',
          description: 'All test cases passed!'
        })
      } else {
        toast({
          title: 'Failed',
          description: 'Some test cases failed',
          variant: 'destructive'
        })
      }

      setCodeError('')
      setResult(
        response.data.data[0]?.stdOut ||
        response.data.data[0]?.stdout ||
        'No Output Available'
      )
    } catch (error: any) {
      setCodeResult(error.response?.data?.data || [])
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Submission failed',
        variant: 'destructive'
      })
      setCodeError(
        error.response?.data?.data?.[0]?.stderr ||
        'Error occurred during submission'
      )
    } finally {
      setLoading(false)
    }
  }

  // Editor change handler
  const handleEditorChange = (value: string | undefined) => {
    setCurrentCode(value || '')
  }

  // Fetch question details
  const getQuestionDetails = useCallback(async () => {
    try {
      setQuestionLoading(true)
      const response = await api.get(`/codingPlatform/get-coding-question/${params.editor}`)
      const data = response.data.data
      
      setQuestionDetails(data)
      setTestCases(data?.testCases || [])
      setTemplates(data?.templates || {})
    } catch (error) {
      console.error('Error fetching question details:', error)
      toast({
        title: 'Error',
        description: 'Failed to load question details',
        variant: 'destructive'
      })
    } finally {
      setQuestionLoading(false)
    }
  }, [params.editor])

  // Check for existing submission
  const getSubmissionDetails = useCallback(async () => {
    try {
      const response = await api.get(`/codingPlatform/submissions/questionId=${params.editor}`)
      const data = response.data.data
      
      if (data) {
        setLanguageId(data.languageId)
        setCurrentCode(b64DecodeUnicode(data.sourceCode))
        const foundLang = editorLanguages.find(lang => lang.id === data.languageId)
        if (foundLang) {
          setLanguage(foundLang.lang)
        }
      }
    } catch (error) {
      // No existing submission, that's fine
      console.log('No existing submission found')
    }
  }, [params.editor])

  // Effects
  useEffect(() => {
    getQuestionDetails()
    getSubmissionDetails()
  }, [getQuestionDetails, getSubmissionDetails])

  useEffect(() => {
    if (templates?.[language]?.template) {
      setCurrentCode(b64DecodeUnicode(templates[language].template))
    }
  }, [language, templates])

  if (questionLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Spinner className="w-8 h-8 mb-4" />
          <p className="text-muted-foreground">Loading coding challenge...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-border">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Your progress will be lost if you haven't submitted your solution.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive-dark"
                onClick={onBack}
              >
                Go Back
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex gap-2">
          <Button
            onClick={(e) => handleSubmit(e, 'run')}
            size="sm"
            variant="outline"
            disabled={loading || isSubmitted}
            className="bg-primary-light hover:bg-primary text-primary-dark border-primary"
          >
            {loading ? <Spinner className="w-4 h-4" /> : <Play size={16} />}
            <span className="ml-2">Run</span>
          </Button>
          <Button
            onClick={(e) => handleSubmit(e, 'submit')}
            size="sm"
            disabled={loading || isSubmitted}
            className="bg-primary hover:bg-primary-dark"
          >
            {loading ? <Spinner className="w-4 h-4" /> : <Upload size={16} />}
            <span className="ml-2">Submit</span>
          </Button>
        </div>
      </div>

      {/* Submission Modal */}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-sm">
          <button
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(false)}
          >
            <X size={18} />
          </button>
          <AlertDialogHeader>
            {modalType === 'success' ? (
              <>
                <AlertDialogTitle className="text-success">
                  🎉 All Test Cases Passed!
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Your solution has been submitted successfully.
                </AlertDialogDescription>
              </>
            ) : (
              <>
                <AlertDialogTitle className="text-destructive">
                  ❌ Some Test Cases Failed
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Your solution has been submitted but some test cases failed.
                </AlertDialogDescription>
              </>
            )}
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-73px)]">
        {/* Problem Description Panel */}
        <ResizablePanel defaultSize={50} className="min-w-[300px]">
          <div className="h-full bg-card border-r border-border">
            <div className="p-6 h-full overflow-y-auto">
              <h1 className="text-2xl font-bold mb-4">{questionDetails.title}</h1>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground mb-4">{questionDetails.description}</p>
                
                {questionDetails.constraints && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Constraints:</h3>
                    <p className="text-sm text-muted-foreground">{questionDetails.constraints}</p>
                  </div>
                )}

                {/* Test Cases */}
                <div className="space-y-4">
                  {testCases.slice(0, 2).map((testCase, index) => (
                    <div key={index} className="bg-muted rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Example {index + 1}</h4>
                      
                      {Array.isArray(testCase.inputs) ? (
                        testCase.inputs.map((input: Input, idx: number) => (
                          <p key={idx} className="text-sm mb-1">
                            <span className="font-medium">Input {idx + 1}:</span>{' '}
                            {formatValue(input.parameterValue, input.parameterType)}
                          </p>
                        ))
                      ) : (
                        Object.entries(testCase.inputs).map(([key, value], idx) => (
                          <p key={key} className="text-sm mb-1">
                            <span className="font-medium">Input {idx + 1}:</span>{' '}
                            {key} = {formatValue(value, typeof value === 'number' ? 'int' : 'str')}
                          </p>
                        ))
                      )}
                      
                      <p className="text-sm mt-2">
                        <span className="font-medium">Expected Output:</span>{' '}
                        {formatValue(
                          testCase.expectedOutput.parameterValue,
                          testCase.expectedOutput.parameterType
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Code Editor & Output Panel */}
        <ResizablePanel defaultSize={50} className="min-w-[400px]">
          <ResizablePanelGroup direction="vertical">
            {/* Code Editor Panel */}
            <ResizablePanel defaultSize={70} className="min-h-[300px]">
              <div className="h-full bg-card">
                <div className="flex justify-between items-center p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Code size={20} />
                    <span className="font-medium">Code Editor</span>
                  </div>
                  
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {editorLanguages.map((lang) => (
                        <SelectItem key={lang.id} value={lang.lang}>
                          {lang.lang.charAt(0).toUpperCase() + lang.lang.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Editor
                  height="calc(100% - 65px)"
                  language={language}
                  theme="vs-dark"
                  value={currentCode}
                  onChange={handleEditorChange}
                  options={{
                    wordWrap: 'on',
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Output Panel */}
            <ResizablePanel defaultSize={30} className="min-h-[200px]">
              <div className="h-full bg-gray-900 text-gray-100">
                <div className="p-3 border-b border-gray-700 bg-gray-800">
                  <span className="font-medium text-gray-300">Output</span>
                </div>
                
                <div className="p-4 h-[calc(100%-49px)] overflow-y-auto font-mono text-sm">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                      <span className="text-gray-400">Processing...</span>
                    </div>
                  ) : codeResult.length > 0 ? (
                    <div className="space-y-4">
                      {codeResult.map((testCase: any, index: number) => (
                        <div key={index} className="bg-gray-800 rounded p-3 border border-gray-700">
                          <h4 className="text-yellow-300 font-medium mb-2">
                            Test Case {index + 1}
                          </h4>
                          
                          <div className="space-y-1 text-xs">
                            <p>
                              <span className="text-yellow-200">Status:</span>{' '}
                              <span className={testCase.status === 'Accepted' ? 'text-green-400' : 'text-red-400'}>
                                {testCase.status}
                              </span>
                            </p>
                            
                            {testCase.stdOut && (
                              <p>
                                <span className="text-yellow-200">Output:</span> {testCase.stdOut}
                              </p>
                            )}
                            
                            {testCase.stdErr && (
                              <p>
                                <span className="text-yellow-200">Error:</span>{' '}
                                <span className="text-red-400">{testCase.stdErr}</span>
                              </p>
                            )}
                            
                            {testCase.expectedOutput && (
                              <p>
                                <span className="text-yellow-200">Expected:</span> {testCase.expectedOutput}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Run your code to see the output here...</p>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default CodingEditor
