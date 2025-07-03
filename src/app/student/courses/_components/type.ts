export interface SidebarProps {
  Chapter1: string
  Chapter2: string
  article: string
  Quiz: string
  codingProject: string
}

export interface StudentChapterItemProps {
  title: string
  topicId: number
  chapterId: number
  activeChapter: number
  setActiveChapter: (id: number) => void
  status: string
  viewcourses: string | number
  moduleID: string | number
  activeChapterRef: React.RefObject<HTMLDivElement>
}