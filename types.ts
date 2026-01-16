
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

export interface TechnicalComponent {
  name: string;
  explanation: string;
}

export interface TechnicalDecision {
  title: string;
  rationale: string;
}

export interface RepoAnalysis {
  appName: string;
  mission: string;
  topFeatures: string[];
  coreLogic: {
    overview: string;
    components: TechnicalComponent[];
  };
  technicalArchitecture: string;
  topTechnicalDecisions: TechnicalDecision[];
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
