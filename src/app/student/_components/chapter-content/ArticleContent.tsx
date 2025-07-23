import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import RemirrorTextEditor from "@/components/remirror-editor/RemirrorTextEditor";
import Link from 'next/link';
import useWindowSize from '@/hooks/useHeightWidth';
import { getCleanFileName } from '@/utils/admin';
import useChapterCompletion from '@/hooks/useChapterCompletion';
import {ArticleContentProps,EditorDoc} from '@/app/student/_components/chapter-content/componentChapterStudentTypes.ts';


const ArticleContent: React.FC<ArticleContentProps> = ({ chapterDetails, onChapterComplete }) => {
  const { courseId: courseIdParam, moduleId: moduleIdParam } = useParams();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  // State management
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [pdfLink, setPdfLink] = useState('');
  const [fileName, setFileName] = useState('');
  const [viewPdf, setViewPdf] = useState(false);
  const [initialContent, setInitialContent] = useState<{ doc: EditorDoc } | undefined>(
    chapterDetails?.articleContent === null
      ? undefined
      : Array.isArray(chapterDetails?.articleContent) && chapterDetails.articleContent.length > 0
      ? typeof chapterDetails.articleContent[0] === 'string'
        ? JSON.parse(chapterDetails.articleContent[0])
        : { doc: chapterDetails.articleContent[0] }
      : undefined
  );

  // Chapter completion hook
  const { isCompleting, completeChapter } = useChapterCompletion({
    courseId: courseIdParam?.toString() || "502", // fallback courseId
    moduleId: moduleIdParam?.toString() || "",
    chapterId: chapterDetails.id.toString(),
    onSuccess: () => {
      setIsCompleted(true);
      onChapterComplete(); // Refetch the chapter list in the background
    }
  });

  // Update completion status
  useEffect(() => {
    setIsCompleted(chapterDetails.status === 'Completed');
  }, [chapterDetails.status]);

  // Process article content and links
  useEffect(() => {
    // Handle article content
    if (
      chapterDetails?.articleContent &&
      Array.isArray(chapterDetails.articleContent) &&
      chapterDetails.articleContent.length > 0
    ) {
      if (typeof chapterDetails.articleContent[0] === 'string') {
        setInitialContent(JSON.parse(chapterDetails.articleContent[0]));
      } else {
        const jsonData = { doc: chapterDetails.articleContent[0] };
        setInitialContent(jsonData);
      }
    }

    // Handle PDF links
    if (chapterDetails?.links && Array.isArray(chapterDetails.links) && chapterDetails.links.length > 0) {
      setPdfLink(chapterDetails.links[0]);
      setViewPdf(true);
      const cleanFileName = getCleanFileName(chapterDetails.links[0]);
      setFileName(cleanFileName);
    } else if (typeof chapterDetails?.links === 'string' && chapterDetails.links) {
      // Handle single link as string
      setPdfLink(chapterDetails.links);
      setViewPdf(true);
      const cleanFileName = getCleanFileName(chapterDetails.links);
      setFileName(cleanFileName);
    } else {
      setPdfLink('');
      setViewPdf(false);
    }
  }, [chapterDetails]);

  // Check if content is meaningful (matches reference logic)
  const action = initialContent && (
    initialContent?.doc.content?.length > 1 ||
    (initialContent?.doc.content?.[0]?.content?.[0]?.text &&
     initialContent.doc.content[0].content[0].text !== 'No content has been added yet')
  );

  return (
    <div className="h-full p-4">
      {/* Header with Badge */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-bold text-lg">{chapterDetails?.title}</h1>
        <Badge 
          variant="outline" 
          className={isCompleted ? "text-success border-success" : "text-muted-foreground"}
        >
          {isCompleted ? 'Read' : 'To be Read'}
        </Badge>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="text-left">
          {viewPdf ? (
            /* PDF Content */
            <div className="flex items-start h-[36rem] flex-col gap-2 justify-start">
              <h4 className=" text-black mb-2">
                Here is your learning material:
              </h4>
              {isMobile ? (
                <Link
                  target="_blank"
                  href={pdfLink}
                  download="coding_material.pdf"
                  className="text-blue-400"
                >
                  View Learning Material: {fileName}
                </Link>
              ) : (
                <>
                <iframe
                  src={pdfLink}
                  className="h-[100%] w-full border rounded"
                  title="Learning Material"
                />
                  {!isCompleted && (
                <div className="mt-6 flex justify-end w-full">
                  <Button
                    disabled={!pdfLink || isCompleting}
                    onClick={completeChapter}
                  >
                    {isCompleting ? 'Marking as Done...' : 'Mark as Done'}
                  </Button>
                </div>
              )}
                </>
              )}
            </div>
          ) : (
            /* Article Content */
            <div>
              <div className="text-start">
                <RemirrorTextEditor
                  initialContent={initialContent}
                  setInitialContent={setInitialContent}
                  preview={true}
                />
              </div>
              {!isCompleted && (
                <div className="mt-6 text-end">
                  <Button
                    disabled={!action || isCompleting}
                    onClick={completeChapter}
                  >
                    {isCompleting ? 'Marking as Done...' : 'Mark as Done'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
export default ArticleContent; 