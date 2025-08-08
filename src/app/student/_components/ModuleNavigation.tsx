import { Button } from "@/components/ui/button";
import { TopicItem } from "@/lib/mockData";
import{ModuleNavigationProps} from '@/app/student/_components/componentStudentType'

const ModuleNavigation = ({ prevItem, nextItem, onItemSelect }: ModuleNavigationProps) => {
  return (
    <div className="border-t border-border p-6">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Button
          variant="link"
          className="text-charcoal p-0 h-auto"
          disabled={!prevItem}
          onClick={() => prevItem && onItemSelect(prevItem.item.id)}
        >
          Back
        </Button>
        <Button
          variant="link"
          className="text-primary p-0 h-auto"
          disabled={!nextItem}
          onClick={() => nextItem && onItemSelect(nextItem.item.id)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ModuleNavigation;