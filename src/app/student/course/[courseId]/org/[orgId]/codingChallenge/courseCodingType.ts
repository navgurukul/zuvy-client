export interface CodeEditorProps {
    questionId: string;
    chapterId?: number;
    onChapterComplete?: () => void;
    orgId?: number | null;
}