

export interface InProgressBootcamp {
  id: number;
  name: string;
  coverImage: string;
  bootcampTopic: string;
  progress: number;           
}

export interface Chapter {
  id: number;
  name: string;
  topicId: number; 
 chapterId :number
  title:string
   status?: 'Completed' | 'In‑Progress' | string;           
}

export interface ModuleData {
  id: number;
  title: string;
  moduleName: Chapter[];     
}


export interface User {
  id: number;
  rolesList: string[];
}
