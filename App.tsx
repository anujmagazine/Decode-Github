
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { parseGitHubUrl, fetchRepoContents } from './services/github';
import { geminiService } from './services/gemini';
import { AppState, RepoAnalysis, ChatMessage, FileContent } from './types';
import AnalysisDashboard from './components/AnalysisDashboard';
import ChatBox from './components/ChatBox';
import { Github, Search, Code2, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [repoFiles, setRepoFiles] = useState<FileContent[]>([]);
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleStartAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const info = parseGitHubUrl(url);
    if (!info) {
      setError("Please enter a valid GitHub repository URL (e.g., https://github.com/facebook/react)");
      return;
    }

    try {
      setState(AppState.FETCHING);
      const files = await fetchRepoContents(info);
      if (files.length === 0) {
        throw new Error("No readable code files found in the repository.");
      }
      setRepoFiles(files);

      setState(AppState.ANALYZING);
      const result = await geminiService.analyzeRepo(files);
      setAnalysis(result);
      
      await geminiService.initChat(files, result);
      setState(AppState.READY);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setState(AppState.ERROR);
    }
  };

  const handleSendMessage = async (msg: string) => {
    const userMsg: ChatMessage = { role: 'user', content: msg };
    setChatHistory(prev => [...prev, userMsg]);
    
    const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
    setChatHistory(prev => [...prev, assistantMsg]);

    try {
      let fullContent = "";
      await geminiService.sendMessageStream(msg, (chunk) => {
        fullContent += chunk;
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: 'assistant', content: fullContent };
          return newHistory;
        });
      });
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: "Error: I encountered an issue responding. Please try again." }
      ]);
    }
  };

  const handleSuggestedQuestion = (q: string) => {
    handleSendMessage(q);
  };

  const renderContent = () => {
    switch (state) {
      case AppState.IDLE:
      case AppState.ERROR:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="mb-8 p-4 bg-blue-500/10 rounded-full">
              <Code2 size={64} className="text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Deep Dive into Any Codebase
            </h1>
            <p className="text-slate-400 max-w-xl mb-8">
              Paste a public GitHub URL and let AI scan, analyze, and walk you through the logic, structure, and intent of the code.
            </p>
            
            <form onSubmit={handleStartAnalysis} className="w-full max-w-2xl relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Github size={20} className="text-slate-500" />
              </div>
              <input 
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-12 pr-32 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-100"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                Analyze <Search size={18} />
              </button>
            </form>

            {error && (
              <div className="mt-6 flex items-center gap-2 text-rose-400 bg-rose-400/10 px-4 py-2 rounded-lg border border-rose-400/20">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
              {[
                { icon: <Sparkles size={20} />, title: "Structural Insights", desc: "Understand how the pieces fit together instantly." },
                { icon: <Github size={20} />, title: "Direct GitHub Sync", desc: "No cloning needed. Scans directly from the source." },
                { icon: <Code2 size={20} />, title: "Ask Anything", desc: "From 'how is auth handled?' to 'is this performant?'" }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 text-left">
                  <div className="text-blue-400 mb-3">{item.icon}</div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case AppState.FETCHING:
      case AppState.ANALYZING:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="absolute inset-0 animate-ping bg-blue-500/20 rounded-full"></div>
              <div className="relative bg-slate-800 p-8 rounded-full border border-blue-500/50">
                <Loader2 size={48} className="text-blue-400 animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mt-8 mb-2">
              {state === AppState.FETCHING ? "Fetching Repository Data..." : "Deep-Scanning the Code..."}
            </h2>
            <p className="text-slate-400 animate-pulse">
              {state === AppState.FETCHING 
                ? "Indexing files and metadata from GitHub." 
                : "Gemini is reading the codebase to build context."}
            </p>
          </div>
        );

      case AppState.READY:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-160px)]">
            <div className="lg:col-span-7 h-full overflow-y-auto pr-2 custom-scrollbar">
              {analysis && (
                <AnalysisDashboard 
                  analysis={analysis} 
                  onAskQuestion={handleSuggestedQuestion}
                />
              )}
            </div>
            <div className="lg:col-span-5 h-full">
              <ChatBox 
                messages={chatHistory} 
                onSendMessage={handleSendMessage} 
                isLoading={false}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => { setState(AppState.IDLE); setUrl(''); setAnalysis(null); setChatHistory([]); }}
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <Code2 className="text-white" size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">CodeNexus</span>
          </div>
          {state === AppState.READY && (
            <div className="hidden md:flex items-center gap-4 text-sm bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
              <Github size={16} className="text-slate-400" />
              <span className="text-slate-300 font-mono truncate max-w-[300px]">{url}</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {renderContent()}
      </main>

      <footer className="py-6 border-t border-slate-800 text-center text-slate-500 text-sm">
        CodeNexus • Powered by Gemini 3 Pro & GitHub API • Created for Vibe Coders
      </footer>
    </div>
  );
};

export default App;
