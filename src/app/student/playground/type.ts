export interface TestCase {
  input: unknown;          
  expectedOutput: unknown;
}
export interface Tag {
  id: number;           
  tagName: string;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: string;
  title: string;
  difficulty: Difficulty;
  tagId: number;         
  status: 'Accepted' | 'Needs to Attempt' | null;
  data: TestCase[];         
}
