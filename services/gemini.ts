
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { FileContent, RepoAnalysis, ChatMessage } from '../types';

const MODEL_NAME = 'gemini-3-pro-preview';

export class GeminiService {
  private ai: GoogleGenAI;
  private chatInstance: Chat | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  private constructCodeContext(files: FileContent[]): string {
    return files.map(f => `FILE: ${f.path}\nCONTENT:\n${f.content}\n---`).join('\n');
  }

  async analyzeRepo(files: FileContent[]): Promise<RepoAnalysis> {
    const context = this.constructCodeContext(files);
    const prompt = `You are a technical mentor for developers who want to understand code deeply but simply. 
    Analyze this repository and explain it as a narrative guide.
    
    Structure your response into:
    1. The Mission: The project's "why" and core purpose.
    2. The Blueprint: High-level system design in plain English.
    3. Technical Decisions: 3-5 key choices (patterns/libs) and their rationale.
    4. The File Map: Identify 6-8 most important files/folders and explain exactly what role each plays in the system.
    5. The Anatomy Logic: Why is the folder structure organized this way? (e.g., modular vs layered).
    6. The Tech Stack: Main tools used.
    7. Curiosity Points: 5 questions to help them dive deeper.

    Repository Context:
    ${context}`;

    const response = await this.ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mission: { type: Type.STRING },
            architectureSimple: { type: Type.STRING },
            technicalDecisions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  decision: { type: Type.STRING },
                  rationale: { type: Type.STRING }
                },
                required: ["decision", "rationale"]
              }
            },
            importantFiles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  path: { type: Type.STRING },
                  role: { type: Type.STRING }
                },
                required: ["path", "role"]
              }
            },
            fileOrganizationLogic: { type: Type.STRING },
            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["mission", "architectureSimple", "technicalDecisions", "importantFiles", "fileOrganizationLogic", "techStack", "suggestedQuestions"]
        }
      }
    });

    return JSON.parse(response.text);
  }

  async initChat(files: FileContent[], initialAnalysis: RepoAnalysis) {
    const context = this.constructCodeContext(files);
    this.chatInstance = this.ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: `You are a mentor helping a developer understand this codebase. 
        Refer to specific files like ${initialAnalysis.importantFiles.map(f => f.path).join(', ')} when explaining.
        Focus on the "why" behind the code, not just the "what".
        
        ANALYSIS: ${JSON.stringify(initialAnalysis)}
        CODE: ${context}`,
      }
    });
  }

  async sendMessageStream(message: string, onChunk: (chunk: string) => void) {
    if (!this.chatInstance) throw new Error("Chat not initialized");
    const streamResponse = await this.chatInstance.sendMessageStream({ message });
    for await (const chunk of streamResponse) {
      const c = chunk as GenerateContentResponse;
      onChunk(c.text || "");
    }
  }
}

export const geminiService = new GeminiService();
