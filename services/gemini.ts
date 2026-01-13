
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
    const prompt = `You are a world-class technical mentor. Analyze this repository and produce a narrative guide. 
    Explain the codebase in simple, "easy language" for a junior developer, but retain and use the correct technical jargon (names of patterns, tools, architectural styles).
    
    Structure your response into these exact sections:
    1. App Name: A catchy or descriptive name for this project based on its code.
    2. The Mission: The core purpose and "why" behind the project.
    3. App's Core Logic: Break the app down into "Technical Components". For each component, give it its professional name (e.g., "State Orchestrator", "Persistent Storage Layer", "Middleware pipeline") but explain exactly what it does in very simple terms.
    4. Technical Architecture: Explain how the whole system fits together (e.g., Client-Server, MVC, Layered Architecture) and how data flows through it.
    5. Top 3 Technical Decisions: Identify exactly 3 major technical choices and explain the rationale for each.
    6. The File Map: List 6-8 specific files and explain their individual roles.
    7. The Anatomy Logic: Why is the folder structure organized the way it is?
    8. Tech Stack: Main libraries and tools.
    9. Curiosity Points: 5 questions to help the user dive deeper.

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
            appName: { type: Type.STRING },
            mission: { type: Type.STRING },
            coreLogic: {
              type: Type.OBJECT,
              properties: {
                overview: { type: Type.STRING },
                components: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      explanation: { type: Type.STRING }
                    },
                    required: ["name", "explanation"]
                  }
                }
              },
              required: ["overview", "components"]
            },
            technicalArchitecture: { type: Type.STRING },
            topTechnicalDecisions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  rationale: { type: Type.STRING }
                },
                required: ["title", "rationale"]
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
          required: ["appName", "mission", "coreLogic", "technicalArchitecture", "topTechnicalDecisions", "importantFiles", "fileOrganizationLogic", "techStack", "suggestedQuestions"]
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
        systemInstruction: `You are the primary technical mentor for "${initialAnalysis.appName}". 
        
        CRITICAL: You have FULL access to the repository's source code provided below. 
        You can perform code reviews, explain specific lines of logic, and suggest improvements based on the actual code content.
        
        When the user asks about the code, always refer to the specific files and logic you see in the source.
        Refer to the components you identified (like ${initialAnalysis.coreLogic.components.map(c => c.name).join(', ')}) to maintain consistency with the architectural guide.
        
        SOURCE CODE CONTEXT:
        ${context}
        
        ARCHITECTURAL ANALYSIS:
        ${JSON.stringify(initialAnalysis)}`,
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
