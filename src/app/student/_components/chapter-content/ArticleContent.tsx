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
import {EditorDoc,ArticleContentProps} from '@/app/student/_components/chapter-content/componentChapterType'
import {ArticleSkeleton} from "@/app/student/_components/Skeletons";


const ArticleContent: React.FC<ArticleContentProps> = ({ chapterDetails, onChapterComplete }) => {
  const { courseId: courseIdParam, moduleId: moduleIdParam } = useParams();
  const { width } = useWindowSize();
  const isMobile = width < 768;


  // State management
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [pdfLink, setPdfLink] = useState('');
  const [fileName, setFileName] = useState('');
  const [viewPdf, setViewPdf] = useState(false);
   const [loading, setLoading] = useState(true);
 

  const [initialContent, setInitialContent] = useState<{ doc: EditorDoc } | undefined>(
    chapterDetails?.articleContent === null
      ? undefined
      : Array.isArray(chapterDetails?.articleContent) && chapterDetails?.articleContent?.length > 0
      ? typeof chapterDetails?.articleContent[0] === 'string'
        ? JSON.parse(chapterDetails?.articleContent[0])
        : { doc: chapterDetails?.articleContent[0] }
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
      Array.isArray(chapterDetails?.articleContent) &&
      chapterDetails?.articleContent?.length > 0
    ) {
      if (typeof chapterDetails?.articleContent[0] === 'string') {
        setInitialContent(JSON.parse(chapterDetails?.articleContent[0]));
      } else {
        const jsonData = { doc: chapterDetails?.articleContent[0] };
        setInitialContent(jsonData);
      }
    }

    // Handle PDF links
    if (chapterDetails?.links && Array.isArray(chapterDetails?.links) && chapterDetails?.links.length > 0) {
      setPdfLink(chapterDetails?.links[0]);
      setViewPdf(true);
      const cleanFileName = getCleanFileName(chapterDetails?.links[0]);
      setFileName(cleanFileName);
    } else if (typeof chapterDetails?.links === 'string' && chapterDetails?.links) {
      // Handle single link as string
      setPdfLink(chapterDetails?.links);
      setViewPdf(true);
      const cleanFileName = getCleanFileName(chapterDetails?.links);
      setFileName(cleanFileName);
    } else {
      setPdfLink('');
      setViewPdf(false);
    }
  }, [chapterDetails]);

  // Check if content is meaningful (matches reference logic)
  const action = initialContent && (
    initialContent?.doc?.content?.length > 1 ||
    (initialContent?.doc?.content?.[0]?.content?.[0]?.text &&
     initialContent.doc?.content[0].content[0].text !== 'No content has been added yet')
  );


// useEffect(() => {
//   if (chapterDetails) {
//     setLoading(false)
//   }
// }, [chapterDetails])

    if (loading) {
    return <ArticleSkeleton/>;
  }

  return (
    <div className={` bg-gradient-to-br from-background via-card-light to-background py-8 px-2 sm:px-0`}>
       <ScrollArea className={`${isMobile ? 'h-[70vh]' : 'h-[80vh]'}`}  >

      <div className={`${isMobile ? 'max-w-xs' : 'max-w-4xl'} mx-auto`}>
        {/* Header with Badge */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-left">{chapterDetails?.title}</h1>
            {chapterDetails?.description && (
              <p className="text-muted-foreground text-base mt-6 text-start">
                {chapterDetails?.description}
              </p>
            )}
          </div>
          <Badge 
            variant="outline" 
            className={isCompleted ? "text-success border-success" : "text-muted-foreground"}
          >
            {isCompleted ? 'Read' : 'To be Read'}
          </Badge>
        </div>

        <div className="text-left">
          {viewPdf ? (
            /* PDF Content */
            <div className="flex items-start h-[36rem] flex-col gap-2 justify-start">
              <h4 className="text-black mb-2 dark:text-white text-[24px]">
                Here is your learning material:
              </h4>
              {isMobile ? (
                <>
               
                <Link
                  target="_blank"
                  href={pdfLink}
                  download="coding_material.pdf"
                  className="text-blue-400"
                >
                  View Learning Material: {fileName}
                </Link>
                 <div className="mt-6 flex justify-end w-full">
                 <Button
                   disabled={!pdfLink || isCompleting}
                   onClick={completeChapter}
                   className='bg-primary hover:bg-primary-dark text-primary-foreground shadow-hover px-8 py-2 rounded-lg'
                 >
                   {isCompleting ? 'Marking as Done...' : 'Mark as Done'}
                 </Button>
               </div>
               </>
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
                    className='bg-primary hover:bg-primary-dark text-primary-foreground shadow-hover px-8 py-2 rounded-lg'
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
              <div className={`${isMobile ? 'flex flex-col justify-center' : ''}`}>
                <RemirrorTextEditor
                  initialContent={initialContent}
                  setInitialContent={setInitialContent}
                  preview={true}
                />
              {!isCompleted && (
                <div className="mt-6 text-end">
                  <Button
                    disabled={!action || isCompleting}
                    onClick={completeChapter}
                    className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-hover px-8 py-2 rounded-lg"
                  >
                    {isCompleting ? 'Marking as Done...' : 'Mark as Done'}
                  </Button>
                </div>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
       </ScrollArea>
    </div>
  );
};
export default ArticleContent; 