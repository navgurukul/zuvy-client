"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { List, ArrowLeft, ChevronDown, ChevronRight, Check, Video, Play, FileText, BookOpen, User, Circle } from "lucide-react";
import ModuleSidebar from "@/app/student/_components/MobileSideBar";
import ModuleContentRenderer from "@/app/student/_components/ModuleContentRenderer";
import ModuleContentSkeleton from "@/app/student/_components/ModuleContentSkeleton";
import useAllChaptersWithStatus from "@/hooks/useAllChaptersWithStatus";
import Header from "../_components/Header";



interface TopicItem {
  id: string;
  title: string;
  type: string;
  status: string;
  description?: string;
  duration?: string;
  scheduledDateTime?: Date;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  items: TopicItem[];
}

interface Module {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
}

interface Course {
  id: string;
  name: string;
  modules: Module[];
}

const ModuleContentPage = ({ courseId, moduleId }: { courseId: string, moduleId: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chapterId = searchParams.get('chapterId');

  // Move hooks before conditional return
  const { trackingData, moduleDetails, loading, error, refetch } = useAllChaptersWithStatus(moduleId);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (chapterId && !hasScrolledRef.current) {
      const targetEl = itemRefs.current[chapterId];
      if (targetEl) {
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        hasScrolledRef.current = true;  
      }
    }
  }, [chapterId, expandedTopics]);


  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get the module data early for use in effects
  const transformTrackingDataToModule = () => {
    if (!trackingData.length || !moduleDetails.length) return null;

    const moduleDetail = moduleDetails[0];

    const getContentType = (topicId: number): string => {
      switch (topicId) {
        case 1: return 'video';
        case 2: return 'article';
        case 3: return 'coding-challenge';
        case 4: return 'quiz';
        case 5: return 'assignment';
        case 6: return 'assessment';
        case 7: return 'feedback-form';
        case 8: return 'live-class';
        default: return 'video';
      }
    };

    const getContentTypeLabel = (topicId: number): string => {
      switch (topicId) {
        case 1: return 'Video';
        case 2: return 'Article';
        case 3: return 'Coding Challenge';
        case 4: return 'Quiz';
        case 5: return 'Assignment';
        case 6: return 'Assessment';
        case 7: return 'Feedback Form';
        case 8: return 'Live Class';
        default: return 'Video';
      }
    };

    const items: TopicItem[] = trackingData.map((item) => {
      const contentType = getContentType(item.topicId);
      const contentTypeLabel = getContentTypeLabel(item.topicId);

      return {
        id: item.id.toString(),
        title: item.title,
        type: contentType,
        status: item.status === 'Completed' ? 'completed' : 'not-started',
        description: `${contentTypeLabel}: ${item.title} - ${item.status}`,
        duration: contentType === 'video' || contentType === 'live-class' ? '45 mins' :
          contentType === 'article' ? '5 mins read' :
            contentType === 'assessment' ? '2 hours' :
              contentType === 'quiz' ? '30 mins' : undefined,
        scheduledDateTime: contentType === 'assessment' || contentType === 'live-class' ?
          new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
      };
    });

    const singleTopic: Topic = {
      id: 'all-chapters',
      name: 'Module Content',
      description: 'All chapters and content for this module',
      items: items
    };

    return {
      id: moduleDetail.id.toString(),
      name: moduleDetail.name,
      description: moduleDetail.description,
      topics: [singleTopic]
    };
  };

  const enhancedModule = transformTrackingDataToModule();

  // Set default chapter if none is in the URL
  useEffect(() => {
    if (!loading && !error && enhancedModule && !chapterId) {
      const firstChapterId = enhancedModule.topics?.[0]?.items?.[0]?.id;
      if (firstChapterId) {
        router.replace(`?chapterId=${firstChapterId}`);
      }
    }
  }, [loading, error, enhancedModule, chapterId, router]);

  // Auto-expand the topic that contains the selected item
  useEffect(() => {
    if (chapterId && enhancedModule) {
      const topicWithSelectedItem = enhancedModule.topics.find(topic =>
        topic.items.some(item => item.id === chapterId)
      );
      if (topicWithSelectedItem && !expandedTopics.includes(topicWithSelectedItem.id)) {
        setExpandedTopics(prev => [...prev, topicWithSelectedItem.id]);
      }
    }
  }, [chapterId, enhancedModule, expandedTopics]);

  // Add validation for moduleId after hooks
  if (!moduleId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold mb-2">Invalid Module</h1>
          <p className="text-muted-foreground mb-4">Module ID is missing</p>
          <Button asChild>
            <Link href={`/student/course/${courseId}`}>Back to Course</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getAllItems = () => {
    if (!enhancedModule) return [];
    const items: { item: any; topicId: string }[] = [];
    enhancedModule.topics.forEach(topic => {
      topic.items.forEach(item => {
        items.push({ item, topicId: topic.id });
      });
    });
    return items;
  };

  const allItems = getAllItems();
  const currentIndex = allItems.findIndex(({ item }) => item.id === chapterId);
  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  if (loading) {
    return <ModuleContentSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold mb-2">Error Loading Module</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link href={`/student/course/${courseId}`}>Back to Course</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!enhancedModule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-primary font-heading font-bold mb-2">Module Not Found</h1>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground"  asChild>
            <Link href={`/student/course/${courseId}`}>Back to Course</Link>
          </Button>
        </div>
      </div>
    );
  }

  // const getAssessmentData = (itemId: string) => {
  //   const assessmentMap: { [key: string]: any } = {
  //     'dom-concepts-assessment': {
  //       id: 'dom-concepts-assessment',
  //       title: 'DOM Concepts Assessment',
  //       description: 'This assessment covers DOM manipulation, event handling, and interactive web development concepts. Complete coding problems, MCQ quiz, and open-ended questions.',
  //       startDate: new Date(),
  //       endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  //       duration: '2 hours',
  //       totalMarks: 100,
  //       passScore: 60,
  //       state: 'scheduled',
  //       attemptStatus: 'Not Attempted'
  //     },
  //     'high-score-assessment': {
  //       id: 'high-score-assessment',
  //       title: 'JavaScript Fundamentals Assessment',
  //       description: 'Comprehensive assessment covering JavaScript basics, data types, functions, and control structures.',
  //       startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  //       endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  //       duration: '90 minutes',
  //       totalMarks: 100,
  //       passScore: 60,
  //       state: 'completed',
  //       score: 70,
  //       attemptStatus: 'Attempted'
  //     },
  //     'low-score-assessment': {
  //       id: 'low-score-assessment',
  //       title: 'Event Handling Assessment',
  //       description: 'Assessment focusing on event handling, user interactions, and dynamic content updates.',
  //       startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  //       endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  //       duration: '75 minutes',
  //       totalMarks: 100,
  //       passScore: 60,
  //       state: 'completed',
  //       score: 30,
  //       attemptStatus: 'Attempted'
  //     },
  //     'expired-assessment': {
  //       id: 'expired-assessment',
  //       title: 'DOM Manipulation Final Test',
  //       description: 'Final comprehensive assessment covering all DOM manipulation concepts and techniques.',
  //       startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  //       endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  //       duration: '3 hours',
  //       totalMarks: 150,
  //       passScore: 60,
  //       state: 'expired',
  //       attemptStatus: 'Not Attempted'
  //     }
  //   };

  //   return assessmentMap[itemId];
  // };

  const getSelectedItem = () => {
    if (!enhancedModule || !chapterId) return null;
    for (const topic of enhancedModule.topics) {
      const item = topic.items.find(item => item.id === chapterId);
      if (item) return { item, topicId: topic.id };
    }
    return null;
  };

  const selectedItemData = getSelectedItem();

  const handleItemSelect = (itemId: string) => {
    router.push(`?chapterId=${itemId}`);
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const getItemIcon = (type: string, status: string) => {
    const getIconComponent = () => {
      switch (type) {
        case 'live-class':
          return <Play className="w-4 h-4" />;
        case 'video':
          return <Video className="w-4 h-4" />;
        case 'article':
          return <FileText className="w-4 h-4" />;
        case 'assignment':
          return <FileText className="w-4 h-4" />;
        case 'assessment':
          return <BookOpen className="w-4 h-4" />;
        case 'quiz':
          return <BookOpen className="w-4 h-4" />;
        case 'feedback-form':
          return <User className="w-4 h-4" />;
        case 'coding-challenge':
          return <BookOpen className="w-4 h-4" />;
        default:
          return <Circle className="w-4 h-4" />;
      }
    };

    const getIconColor = () => {
      switch (type) {
        case 'live-class':
        case 'video':
          return status === 'completed' ? 'text-success' : 'text-primary';
        case 'article':
        case 'assessment':
          return status === 'completed' ? 'text-success' : 'text-accent';
        case 'assignment':
          return status === 'completed' ? 'text-success' : 'text-secondary';
        case 'quiz':
        case 'coding-challenge':
          return status === 'completed' ? 'text-success' : 'text-warning';
        case 'feedback-form':
          return status === 'completed' ? 'text-success' : 'text-info';
        default:
          return 'text-muted-foreground';
      }
    };

    return (
      <div className={getIconColor()}>
        {getIconComponent()}
      </div>
    );
  };

  const getItemDetails = (item: any) => {

    console.log(item.type)
    if (item.type === 'live-class') {
      return 'Live Class';
    }
    if (item.type === 'video') {
      return item.duration || 'Video Chapter';
    }
    if (item.type === 'article') {
      return 'Article to Read';
    }
    if (item.type === 'assignment') {
      return 'Assignment Chapter';
    }
    if (item.type === 'assessment') {
      return 'Assessment Chapter';
    }
    if (item.type === 'quiz') {
      return 'Quiz';
    }
    if (item.type === 'coding-challenge') {
      return '1 Coding Practice problem';
    }
    if (item.type === 'feedback-form') {
      return 'Share your feedback';
    }
    return '';
  };

  return (
    <div className="h-screen flex">

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div>

          <div className="w-80 h-screen bg-background border-r border-border flex flex-col">
            <Header />
            <div className="p-4 border-b text-left border-border flex-shrink-0">
              <Button variant="link" size="sm" asChild className="mb-4 p-0 h-auto font-semibold text-foreground hover:text-foreground hover:no-underline">
                <Link href={`/student/course/${courseId}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Course
                </Link>
              </Button>
              <h2 className="text-base font-heading font-semibold">{enhancedModule.name}</h2>
              {/* <p className="text-xs text-muted-foreground mt-1 break-words"></p> */}
            </div>

            <div className="border-t border-border flex-shrink-0"></div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                {enhancedModule.topics.map((topic) => (
                  <div key={topic.id} className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-2 hover:bg-primary-light hover:text-charcoal"
                      onClick={() => toggleTopic(topic.id)}
                    >
                      <div className="flex w-full justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs break-words leading-relaxed whitespace-normal">
                            {topic.name}
                          </div>
                        </div>
                        <div className="flex-shrink-0 mt-0.5">
                          {expandedTopics.includes(topic.id) ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </Button>

                    {expandedTopics.includes(topic.id) && (
                      <div className="space-y-1 pl-0">
                        {topic.items.map((item) => (
                          <Button
                            key={item.id}
                            variant="ghost"
                            size="sm"
                            className={`w-full justify-start text-left h-auto p-2 text-xs break-words leading-relaxed whitespace-normal ${chapterId === item.id
                              ? "bg-primary-light border-l-4 border-primary text-charcoal"
                              : "hover:bg-primary-light hover:text-charcoal"
                              }`}
                            onClick={() => handleItemSelect(item.id)}
                            ref={(el) => {
                              if (el) itemRefs.current[item.id] = el;
                            }}
                          >
                            <div className="flex items-start gap-2 w-full">
                              <div className="flex-shrink-0 mt-1">
                                {getItemIcon(item.type, item.status)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm break-words whitespace-normal text-left mb-1">
                                  {item.type === 'live-class' ? `Live Class: ${item.title}` :
                                    item.type === 'video' ? `Video: ${item.title}` :
                                      item.type === 'article' ? `Article: ${item.title}` :
                                        item.type === 'assignment' ? `Assignment: ${item.title}` :
                                          item.type === 'assessment' ? `Assessment: ${item.title}` :
                                            item.type === 'feedback-form' ? `Feedback Form: ${item.title}` :
                                              item.type === 'quiz' ? `Quiz: ${item.title}` :
                                                item.type === 'coding-challenge' ? `Coding Challenge: ${item.title}` :
                                                  item.title}
                                </div>
                                <div className="text-xs font-md text-muted-foreground">
                                  {getItemDetails(item)}  
                                </div>
                              </div>
                              {item.status === 'completed' && (
                                <div className="flex-shrink-0">
                                  <Check className="w-4 h-4 mt-1 text-success" />
                                </div>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <ScrollBar />
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 h-screen flex flex-col ${!isMobile ? '' : 'pb-20'}`}>
        {isMobile && <Header />}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-10">

            <ModuleContentRenderer
              selectedItemData={selectedItemData}
              onChapterComplete={refetch}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div>

          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex items-center justify-between">

            <Button
              variant="link"
              className="text-charcoal p-0 h-auto"
              disabled={!prevItem}
              onClick={() => prevItem && handleItemSelect(prevItem.item.id)}
            >
              Back
            </Button>

            <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="border-primary text-primary">
                  <List className="w-4 h-4 mr-2" />
                  Module Content
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Module Content</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                  <ScrollArea className="flex-1">
                    <ModuleSidebar
                      courseId={courseId}
                      moduleId={moduleId}
                      module={enhancedModule}
                      selectedItem={chapterId ?? ''}
                      onItemSelect={handleItemSelect}
                    />
                    <ScrollBar />
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant="link"
              className="text-primary p-0 h-auto"
              disabled={!nextItem}
              onClick={() => nextItem && handleItemSelect(nextItem.item.id)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleContentPage;