
export interface RepoInfo {
  owner: string;
  repo: string;
  branch?: string;
}

export interface FileContent {
  path: string;
  content: string;
  size: number;
}

export interface ImportantFile {
  path: string;
  role: string;
}

export interface RepoAnalysis {
  mission: string;
  architectureSimple: string;
  technicalDecisions: {
    decision: string;
    rationale: string;
  }[];
  importantFiles: ImportantFile[];
  fileOrganizationLogic: string;
  techStack: string[];
  suggestedQuestions: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export enum AppState {
  IDLE = 'IDLE',
  FETCHING = 'FETCHING',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
  ERROR = 'ERROR'
}
