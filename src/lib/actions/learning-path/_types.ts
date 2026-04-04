export interface CreateLearningPathInput {
  title: string;
  description?: string;
  language?: string;
  departmentId?: string;
}

export interface CreateLevelInput {
  learningPathId: string;
  quizId: string;
  levelNumber: number;
  title: string;
  description?: string;
  minScore?: number;
  referenceUrls?: { url: string; title: string; type?: string }[];
}
