
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

export interface RepoAnalysis {
  summary: string;
  architecture: string;
  techStack: string[];
  keyFeatures: string[];
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
