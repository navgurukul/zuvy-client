import { Question } from './types';

export function useQuestionBank() {
  return {
    questions: [
      {
        id: 'b1',
        qtype: 'mcq',
        topic: 'HTML & CSS',
        difficulty: 'easy',
        text: 'What does HTML stand for?',
        source: 'bank' as const,
        validated: true,
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 0,
        explanation: 'HyperText Markup Language',
      },
    ] as Question[],
  };
}
