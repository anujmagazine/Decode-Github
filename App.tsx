
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { parseGitHubUrl, fetchRepoContents } from './services/github';
import { geminiService } from './services/gemini';
import { AppState, RepoAnalysis, ChatMessage, FileContent } from './types';
import AnalysisDashboard from './components/AnalysisDashboard';
import ChatBox from './components/ChatBox';
import { Github, Search, Code2, Sparkles, AlertCircle, Loader2, BookText } from 'lucide-react';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [repoFiles, setRepoFiles] = useState<FileContent[]>([]);
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const handleStartAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const info = parseGitHubUrl(url);
    if (!info) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    try {
      setState(AppState.FETCHING);
      const files = await fetchRepoContents(info);
      if (files.length === 0) throw new Error("No readable code files found.");
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
      setChatHistory(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: "Error: I encountered an issue responding." }
      ]);
    }
  };

  const renderContent = () => {
    switch (state) {
      case AppState.IDLE:
      case AppState.ERROR:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="mb-8 p-4 bg-indigo-500/10 rounded-full">
              <BookText size={64} className="text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Understand the "How" and "Why"
            </h1>
            <p className="text-slate-400 max-w-xl mb-8">
              Paste a GitHub URL to get a mentor-level walkthrough of its architecture, technical decisions, and organization logic.
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
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-32 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-100"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold flex items-center gap-2 transition-colors"
              >
                Start Tour <Search size={18} />
              </button>
            </form>

            {error && (
              <div className="mt-6 flex items-center gap-2 text-rose-400 bg-rose-400/10 px-4 py-2 rounded-lg border border-rose-400/20">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>
        );

      case AppState.FETCHING:
      case AppState.ANALYZING:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 size={48} className="text-indigo-400 animate-spin mb-6" />
            <h2 className="text-2xl font-bold mb-2">
              {state === AppState.FETCHING ? "Reading the repository..." : "Analyzing decisions & patterns..."}
            </h2>
            <p className="text-slate-500">Building a mentor-level guide for you.</p>
          </div>
        );

      case AppState.READY:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-160px)]">
            <div className="lg:col-span-6 h-full overflow-y-auto pr-4 custom-scrollbar">
              {analysis && (
                <AnalysisDashboard 
                  analysis={analysis} 
                  onAskQuestion={handleSendMessage}
                />
              )}
            </div>
            <div className="lg:col-span-6 h-full">
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
    <div className="min-h-screen flex flex-col bg-slate-950">
      <header className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => { setState(AppState.IDLE); setUrl(''); setAnalysis(null); setChatHistory([]); }}
          >
            <BookText className="text-indigo-500" size={24} />
            <span className="font-bold text-lg tracking-tight">CodeNexus</span>
          </div>
          {state === AppState.READY && (
            <div className="text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              {url.split('/').slice(-2).join('/')}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 overflow-hidden">
        {renderContent()}
      </main>

      <footer className="py-4 border-t border-slate-900 text-center text-[10px] text-slate-600 uppercase tracking-widest font-bold">
        A deep dive tool for curious developers
      </footer>
    </div>
  );
};

export default App;
