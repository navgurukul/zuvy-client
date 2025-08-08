import { useReducer, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/utils/axios.config';
import { b64EncodeUnicode, b64DecodeUnicode } from '@/utils/base64';
import{UseCodingChallengeProps} from '@/hooks/hookType'
import {
    CodingChallengeState,
    CodingChallengeAction,
    QuestionDetails,
    CodeResult,
    ApiResponse,
    SubmissionData,
    CodingLanguage,
    ApiError
} from '@/utils/types/coding-challenge';

const editorLanguages: CodingLanguage[] = [
    { lang: 'java', id: 96 },
    { lang: 'python', id: 100 },
    { lang: 'javascript', id: 102 },
];

const initialState: CodingChallengeState = {
    questionDetails: null,
    currentCode: '',
    language: 'python',
    languageId: 100,
    loading: false,
    isSubmitting: false,
    codeResult: [],
    codeError: '',
    isAlreadySubmitted: false,
    localIsCompleted: false,
    showConfirmModal: false,
    isSolutionModalOpen: false,
    modalType: 'success',
};

function codingChallengeReducer(
    state: CodingChallengeState,
    action: CodingChallengeAction
): CodingChallengeState {
    switch (action.type) {
        case 'SET_QUESTION_DETAILS':
            return { ...state, questionDetails: action.payload };
        case 'SET_CODE':
            return { ...state, currentCode: action.payload };
        case 'SET_LANGUAGE':
            return {
                ...state,
                language: action.payload.language,
                languageId: action.payload.languageId,
            };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_SUBMITTING':
            return { ...state, isSubmitting: action.payload };
        case 'SET_CODE_RESULT':
            return { ...state, codeResult: action.payload };
        case 'SET_CODE_ERROR':
            return { ...state, codeError: action.payload };
        case 'SET_ALREADY_SUBMITTED':
            return { ...state, isAlreadySubmitted: action.payload };
        case 'SET_COMPLETED':
            return { ...state, localIsCompleted: action.payload };
        case 'SET_CONFIRM_MODAL':
            return { ...state, showConfirmModal: action.payload };
        case 'SET_SOLUTION_MODAL':
            return { ...state, isSolutionModalOpen: action.payload };
        case 'SET_MODAL_TYPE':
            return { ...state, modalType: action.payload };
        case 'RESET_ERRORS':
            return { ...state, codeError: '', codeResult: [] };
        default:
            return state;
    }
}
export function useCodingChallenge({ questionId, onChapterComplete }: UseCodingChallengeProps) {
    const [state, dispatch] = useReducer(codingChallengeReducer, initialState);
    const { toast } = useToast();

    const fetchSubmissionDetails = useCallback(async () => {
        if (!questionId) return;
        
        try {
            const response = await api.get<ApiResponse<SubmissionData>>(
                `/codingPlatform/submissions/questionId=${questionId}`
            );
            
            if (response.data.isSuccess && response.data.data) {
                const submissionData = response.data.data;

                if (submissionData.action === 'submit') {
                    dispatch({ type: 'SET_ALREADY_SUBMITTED', payload: true });
                    dispatch({ type: 'SET_COMPLETED', payload: true });
                }

                if (submissionData.programLangId && submissionData.sourceCode) {
                    const langId = parseInt(submissionData.programLangId);
                    const selectedLang = editorLanguages.find(l => l.id === langId);
                    if (selectedLang) {
                        dispatch({
                            type: 'SET_LANGUAGE',
                            payload: { language: selectedLang.lang, languageId: langId }
                        });
                        dispatch({
                            type: 'SET_CODE',
                            payload: b64DecodeUnicode(submissionData.sourceCode)
                        });
                    }
                }
            }
        } catch (error) {
            // No previous submission found, this is fine
            console.log('No previous submission found');
        }
    }, [questionId]);

    const fetchQuestionDetails = useCallback(async () => {
        if (!questionId) return;
        
        try {
            const response = await api.get<ApiResponse<QuestionDetails>>(
                `/codingPlatform/get-coding-question/${questionId}`
            );
            
            dispatch({ type: 'SET_QUESTION_DETAILS', payload: response.data.data });
            
            const initialTemplate = response.data.data?.templates?.[state.language]?.template;
            if (initialTemplate && !state.isAlreadySubmitted) {
                dispatch({ type: 'SET_CODE', payload: b64DecodeUnicode(initialTemplate) });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch question details.',
                variant: 'destructive',
            });
        }
    }, [questionId, state.language, state.isAlreadySubmitted, toast]);

    const handleLanguageChange = useCallback((lang: string) => {
        const selectedLang = editorLanguages.find(l => l.lang === lang);
        if (selectedLang) {
            dispatch({
                type: 'SET_LANGUAGE',
                payload: { language: selectedLang.lang, languageId: selectedLang.id }
            });
        }
    }, []);

    const handleCodeChange = useCallback((value: string | undefined) => {
        dispatch({ type: 'SET_CODE', payload: value || '' });
    }, []);

    const submitCode = useCallback(async (action: 'run' | 'submit') => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'RESET_ERRORS' });

        try {
            const response = await api.post<ApiResponse<CodeResult[]>>(
                `codingPlatform/practicecode/questionId=${questionId}?action=${action}`,
                {
                    languageId: state.languageId,
                    sourceCode: b64EncodeUnicode(state.currentCode),
                }
            );

            dispatch({ type: 'SET_CODE_RESULT', payload: response.data.data });

            const allTestCasesPassed = response.data.data.every(
                (testCase: CodeResult) => testCase.status === 'Accepted'
            );

            if (action === 'submit') {
                dispatch({ type: 'SET_SUBMITTING', payload: true });
                dispatch({ type: 'SET_ALREADY_SUBMITTED', payload: true });
                dispatch({ type: 'SET_SOLUTION_MODAL', payload: true });
                dispatch({ type: 'SET_CONFIRM_MODAL', payload: false });

                if (allTestCasesPassed) {
                    dispatch({ type: 'SET_MODAL_TYPE', payload: 'success' });
                    toast({
                        title: 'Success!',
                        description: 'Test Cases Passed, Solution submitted',
                    });
                } else {
                    dispatch({ type: 'SET_MODAL_TYPE', payload: 'error' });
                    toast({
                        title: 'Submitted',
                        description: 'Solution submitted but some test cases failed',
                        variant: 'destructive',
                    });
                }

                if (onChapterComplete) {
                    onChapterComplete();
                }
            } else if (allTestCasesPassed && action === 'run') {
                toast({
                    title: 'Success',
                    description: 'Test Cases Passed'
                });
            } else {
                toast({
                    title: 'Failed',
                    description: 'Test Cases Failed',
                    variant: 'destructive'
                });
            }
        } catch (error: any) {
            const apiError = error as { response?: { data?: ApiError } };
            
            dispatch({ type: 'SET_CODE_RESULT', payload: apiError.response?.data?.data || [] });
            
            toast({
                title: 'Failed',
                description: apiError.response?.data?.message || 'Network connection lost.',
                variant: 'destructive',
            });
            
            const errorMessage = apiError.response?.data?.data?.[0]?.stderr || 
                                apiError.response?.data?.data?.[0]?.stdErr ||
                                'Error occurred during submission. Network connection lost.';
            dispatch({ type: 'SET_CODE_ERROR', payload: errorMessage });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
            if (action === 'submit') {
                dispatch({ type: 'SET_SUBMITTING', payload: false });
            }
        }
    }, [questionId, state.languageId, state.currentCode, toast, onChapterComplete]);

    const openConfirmModal = useCallback(() => {
        dispatch({ type: 'SET_CONFIRM_MODAL', payload: true });
    }, []);

    const closeConfirmModal = useCallback(() => {
        dispatch({ type: 'SET_CONFIRM_MODAL', payload: false });
    }, []);

    const closeSolutionModal = useCallback(() => {
        dispatch({ type: 'SET_SOLUTION_MODAL', payload: false });
        dispatch({ type: 'SET_SUBMITTING', payload: false });
        dispatch({ type: 'SET_CONFIRM_MODAL', payload: false });
    }, []);

    // Initialize data
    useEffect(() => {
        fetchSubmissionDetails();
    }, [fetchSubmissionDetails]);

    useEffect(() => {
        fetchQuestionDetails();
    }, [fetchQuestionDetails]);

    // Update code when language changes (only if not already submitted)
    useEffect(() => {
        if (state.questionDetails?.templates?.[state.language]?.template && !state.isAlreadySubmitted) {
            const template = state.questionDetails.templates[state.language].template;
            dispatch({ type: 'SET_CODE', payload: b64DecodeUnicode(template) });
        }
    }, [state.language, state.questionDetails, state.isAlreadySubmitted]);

    return {
        state,
        actions: {
            handleLanguageChange,
            handleCodeChange,
            submitCode,
            openConfirmModal,
            closeConfirmModal,
            closeSolutionModal,
        },
        constants: {
            editorLanguages,
        },
    };
} 