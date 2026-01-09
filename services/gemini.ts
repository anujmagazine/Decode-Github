
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
    const prompt = `You are a technical mentor for "vibe coders" who want to understand code deeply but simply. 
    Analyze this repository and explain it as if you are talking to a curious developer. 
    Avoid heavy jargon where possible, or explain it if used.
    
    Structure your response into:
    1. The Mission: What is this project's core purpose?
    2. The Blueprint: How is it built at a high level? (Simple English)
    3. Technical Decisions: Identify 3-5 key choices (libs, patterns) and explain WHY they were likely chosen.
    4. The Anatomy: Explain the folder/file organization logic. Why is it structured this way?
    5. The Tech Stack: List the main tools used.
    6. Curiosity Points: 5 questions to help them dive deeper into the code.

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
            fileOrganization: { type: Type.STRING },
            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["mission", "architectureSimple", "technicalDecisions", "fileOrganization", "techStack", "suggestedQuestions"]
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
        systemInstruction: `You are an expert mentor for this codebase. 
        Your goal is to help a "vibe coder" understand the "how" and "why" of this specific repo.
        Always refer to specific files and folder structures in your explanations.
        Use simple, clear language but don't shy away from explaining the underlying engineering principles.
        
        CONTEXT FOR ANALYSIS:
        ${JSON.stringify(initialAnalysis, null, 2)}
        
        FULL CODE CONTEXT:
        ${context}`,
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
