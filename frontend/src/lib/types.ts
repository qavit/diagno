export type Lang = "en" | "zh-TW";

export interface Concept {
  id: string;
  name: string;
  description: string;
}

export interface ErrorType {
  id: string;
  name: string;
  description: string;
  category: string;
  hint_levels: string[];
}

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  statement: string;
  options?: Option[];
  correct_answer: string;
  concepts: string[];
  error_map: Record<string, string[]>;
  difficulty: number;
  next_rules: Record<string, string>;
}

export interface Attempt {
  id: string;
  question_id: string;
  student_id: string;
  answer: string;
  is_correct: boolean;
  detected_errors: string[];
  timestamp: string;
}

export interface StudentModel {
  concept_mastery: Record<string, number>;
  recent_errors: Record<string, number>;
}

export interface AttemptResponse {
  attempt: Attempt;
  question: Question;
  errors: ErrorType[];
  hints: Record<string, string[]>;
  student_model: StudentModel;
  recommended_next_question_id: string | null;
}

export interface StatsResponse {
  total_attempts: number;
  error_distribution: Record<string, number>;
  concept_mastery_by_student: Record<string, StudentModel>;
  recent_attempts: Attempt[];
}

export interface MetadataResponse {
  concepts: Concept[];
  errors: ErrorType[];
  question_ids: string[];
  ui: Record<string, string>;
}
