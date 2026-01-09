
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { FileContent, RepoAnalysis, ChatMessage } from '../types';

// We use gemini-3-pro-preview because reasoning over a full codebase is a complex task
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
    const prompt = `You are a world-class software architect. I am providing you with the contents of a GitHub repository. 
    Analyze the following files and provide a detailed report including:
    1. A summary of what this project is and what it does.
    2. An overview of the architecture and project structure.
    3. The main tech stack used.
    4. Key features found in the code.
    5. 5-7 suggested curious questions a developer might ask to understand the project better.

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
            summary: { type: Type.STRING },
            architecture: { type: Type.STRING },
            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "architecture", "techStack", "keyFeatures", "suggestedQuestions"]
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
        systemInstruction: `You are an expert guide for this specific codebase. 
        The user wants to "deep dive" into it to understand how things work.
        You have full access to the file contents provided. 
        Be technical, specific, and reference file paths when explaining.
        Keep your tone helpful, curious, and professional.
        
        CODEBASE ANALYSIS:
        ${JSON.stringify(initialAnalysis, null, 2)}
        
        CODEBASE CONTENT:
        ${context}`,
      }
    });
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.chatInstance) throw new Error("Chat not initialized");
    const result = await this.chatInstance.sendMessage({ message });
    return result.text || "I couldn't process that.";
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
