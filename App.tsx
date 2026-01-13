
import React, { useState } from 'react';
import { parseGitHubUrl, fetchRepoContents } from './services/github';
import { geminiService } from './services/gemini';
import { AppState, RepoAnalysis, ChatMessage, FileContent } from './types';
import AnalysisDashboard from './components/AnalysisDashboard';
import ChatBox from './components/ChatBox';
import { Github, Search, AlertCircle, Loader2, BookText, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
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

      setState(AppState.ANALYZING);
      const result = await geminiService.analyzeRepo(files);
      setAnalysis(result);
      
      await geminiService.initChat(files, result);
      setState(AppState.READY);
    } catch (err: any) {
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
            <div className="mb-6 p-5 bg-indigo-600/5 rounded-2xl border border-indigo-600/10 shadow-sm">
              <BookText size={48} className="text-indigo-600" />
            </div>
            <h1 className="text-4xl font-black mb-3 tracking-tight text-slate-900">
              Repo<span className="text-indigo-600">Guide</span>
            </h1>
            <p className="text-slate-500 max-w-lg mb-8 text-base font-light leading-relaxed">
              Understand the "how" and "why" behind any codebase. 
              Get mentor-level architectural insights in seconds.
            </p>
            
            <form onSubmit={handleStartAnalysis} className="w-full max-w-xl relative">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Github size={20} className="text-slate-400" />
              </div>
              <input 
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste GitHub URL..."
                className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-14 pr-32 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all text-slate-900 text-base shadow-sm"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md text-white text-sm"
              >
                Analyze <Search size={16} />
              </button>
            </form>

            {error && (
              <div className="mt-6 flex items-center gap-2 text-rose-600 bg-rose-50 px-5 py-2.5 rounded-lg border border-rose-100 text-sm">
                <AlertCircle size={16} />
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>
        );

      case AppState.FETCHING:
      case AppState.ANALYZING:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative mb-6">
              <Loader2 size={48} className="text-indigo-600 animate-spin" />
            </div>
            <h2 className="text-xl font-bold mb-1 text-slate-900">
              {state === AppState.FETCHING ? "Exploring repository..." : "Mapping architecture..."}
            </h2>
            <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em]">Processing {url.split('/').pop()}</p>
          </div>
        );

      case AppState.READY:
        return (
          <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="mb-3 flex items-center justify-between">
              <button 
                onClick={() => { setState(AppState.IDLE); setUrl(''); setAnalysis(null); setChatHistory([]); }}
                className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-600 transition-colors group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">New Session</span>
              </button>
              <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2.5 py-0.5 bg-slate-100 rounded-full border border-slate-200">
                {url.split('/').slice(-2).join(' / ')}
              </div>
            </div>
            
            {analysis && (
              <div className="flex flex-col gap-3">
                <AnalysisDashboard analysis={analysis} />
                <ChatBox 
                  messages={chatHistory} 
                  onSendMessage={handleSendMessage} 
                  isLoading={false}
                  suggestedQuestions={analysis.suggestedQuestions}
                />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setState(AppState.IDLE); setUrl(''); }}>
            <div className="bg-indigo-600 p-1 rounded-md group-hover:scale-110 transition-transform">
              <BookText className="text-white" size={16} />
            </div>
            <span className="font-black text-lg tracking-tighter text-slate-900 uppercase">RepoGuide</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto p-4 md:p-6 overflow-x-hidden">
        {renderContent()}
      </main>

      <footer className="py-6 border-t border-slate-200 bg-white">
        <p className="text-[9px] text-slate-400 text-center uppercase tracking-[0.2em] font-bold">
          Code Intelligence & Logic Mapping • Powered by Gemini
        </p>
      </footer>
    </div>
  );
};

export default App;
