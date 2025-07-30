import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Check,
  Video, 
  BookOpen, 
  FileText, 
  Play, 
  Circle,
  User
} from "lucide-react";
import{Topic,ModuleSidebarProps} from '@/app/student/_components/componentStudentType'

const ModuleSidebar = ({ courseId, moduleId, module, selectedItem, onItemSelect }: ModuleSidebarProps) => {
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);

  // Auto-expand the topic that contains the selected item
  useEffect(() => {
    if (selectedItem) {
      const topicWithSelectedItem = module.topics.find(topic => 
        topic.items.some(item => item.id === selectedItem)
      );
      if (topicWithSelectedItem && !expandedTopics.includes(topicWithSelectedItem.id)) {
        setExpandedTopics(prev => [...prev, topicWithSelectedItem.id]);
      }
    }
  }, [selectedItem, module.topics, expandedTopics]);

  const getItemIcon = (type: string, status: string) => {
    const getIconComponent = () => {
      switch (type) {
        case 'live-class':
          return <Video className="w-6 h-6" />;
        case 'video':
          return <Play className="w-6 h-6" />;
        case 'article':
          return <FileText className="w-6 h-6" />;
        case 'assignment':
          return <FileText className="w-6 h-6" />;
        case 'assessment':
          return <BookOpen className="w-6 h-6" />;
        case 'quiz':
          return <BookOpen className="w-6 h-6" />;
        case 'feedback-form':
          return <User className="w-6 h-6" />;
        case 'coding-challenge':
          return <BookOpen className="w-6 h-6" />;
        default:
          return <Circle className="w-6 h-6" />;
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
    if (item.type === 'live-class') {
      return item.duration || '45 mins';
    }
    if (item.type === 'video') {
      return item.duration || '45 mins';
    }
    if (item.type === 'article') {
      return item.duration || '5 mins read';
    }
    if (item.type === 'assignment') {
      return 'Due: Dec 15, 2024';
    }
    if (item.type === 'assessment') {
      return item.duration || '2 hours';
    }
    if (item.type === 'quiz') {
      return item.duration || '30 mins';
    }
    if (item.type === 'coding-challenge') {
      return 'Practice problem';
    }
    if (item.type === 'feedback-form') {
      return 'Share your feedback';
    }
    return '';
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  return (
    <div className="w-full lg:w-80 h-full bg-background border-r border-border shadow-4dp flex flex-col">
      <div className="p-4 lg:p-6 text-left border-b border-border">
        <Button variant="link" size="sm" asChild className="mb-4 font-semibold p-0 h-auto text-foreground hover:text-foreground hover:no-underline">
          <Link href={`/student/course/${courseId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Link>
        </Button>
        <h2 className="text-base lg:text-lg font-heading font-semibold">Module Content</h2>
        <p className="text-xs lg:text-sm text-muted-foreground mt-1 break-words"> {module.name}</p>
      </div>
      
      <div className="border-t border-border"></div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 lg:p-4 space-y-3 lg:space-y-4">
          {module.topics.map((topic: Topic) => (
            <div key={topic.id} className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-left h-auto p-2 lg:p-3 hover:bg-primary-light hover:text-charcoal"
                onClick={() => toggleTopic(topic.id)}
              >
                <div className="flex w-full justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs lg:text-sm break-words leading-relaxed whitespace-normal">
                      {topic.name}
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-0.5">
                    {expandedTopics.includes(topic.id) ? (
                      <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4" />
                    ) : (
                      <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
                    )}
                  </div>
                </div>
              </Button>
              
              {expandedTopics.includes(topic.id) && (
                <div className="space-y-1 pl-0">
                  {topic.items.map((item: any) => {
                    const isSecondTopicLiveClass = topic.id === module.topics[1]?.id && item.type === 'live-class';
                    const adjustedItem = isSecondTopicLiveClass ? {
                      ...item,
                      scheduledDateTime: new Date(Date.now() - 5 * 60 * 1000)
                    } : item;

                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start text-left h-auto p-2 lg:p-3 text-xs lg:text-sm break-words leading-relaxed whitespace-normal ${
                          selectedItem === item.id 
                            ? "bg-primary-light border-l-4 border-primary text-charcoal" 
                            : "hover:bg-primary-light hover:text-charcoal"
                        }`}
                        onClick={() => onItemSelect(item.id)}
                      >
                        <div className="flex items-start gap-2 lg:gap-3 w-full">
                          <div className="flex-shrink-0 mt-1">
                            {getItemIcon(item.type, item.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium break-words whitespace-normal text-left mb-1">
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
                            <div className="text-xs text-muted-foreground">
                              {getItemDetails(adjustedItem)}
                            </div>
                          </div>
                          {item.status === 'completed' && (
                            <div className="flex-shrink-0">
                              <Check className="w-3 h-3 lg:w-4 lg:h-4 text-success" />
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        <ScrollBar />
      </ScrollArea>
    </div>
  );
};

export default ModuleSidebar;