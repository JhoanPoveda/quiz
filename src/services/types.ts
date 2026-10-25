export interface RawQuestion {
  question: string;
  correctAnswer: string;
}

export interface PreparedQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  distractors: string[]; // exactly 3 distractors
  options: string[]; // all 4 choices combined
  grammarNote?: string;
}

export interface FormCreationResult {
  formId: string;
  formTitle: string;
  editUrl: string;
  responderUrl: string;
  totalQuestions: number;
}

export interface SheetCreationResult {
  spreadsheetId: string;
  spreadsheetTitle: string;
  spreadsheetUrl: string;
}

export interface DeploymentSummary {
  form: FormCreationResult;
  sheet: SheetCreationResult;
  createdAt: string;
  questionsCount: number;
}
