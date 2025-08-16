export type QuizResult = {
  mark: number | string;
  submissionsData?: {
    status: "passed" | "failed" | "pending";
  };
};

