
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
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <div className="mb-8 p-6 bg-indigo-600/5 rounded-3xl border border-indigo-600/10 shadow-sm">
              <BookText size={60} className="text-indigo-600" />
            </div>
            <h1 className="text-5xl font-black mb-4 tracking-tight text-slate-900">
              Repo<span className="text-indigo-600">Guide</span>
            </h1>
            <p className="text-slate-500 max-w-xl mb-10 text-lg font-light leading-relaxed">
              Understand the "how" and "why" behind any codebase. 
              Get mentor-level architectural insights in seconds.
            </p>
            
            <form onSubmit={handleStartAnalysis} className="w-full max-w-2xl relative">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Github size={22} className="text-slate-400" />
              </div>
              <input 
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a GitHub repository link..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-5 pl-16 pr-40 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all text-slate-900 text-lg shadow-sm"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-8 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md text-white"
              >
                Analyze <Search size={18} />
              </button>
            </form>

            {error && (
              <div className="mt-8 flex items-center gap-2 text-rose-600 bg-rose-50 px-6 py-3 rounded-xl border border-rose-100">
                <AlertCircle size={18} />
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>
        );

      case AppState.FETCHING:
      case AppState.ANALYZING:
        return (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="relative mb-8">
              <Loader2 size={64} className="text-indigo-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">
              {state === AppState.FETCHING ? "Exploring the repository..." : "Drafting your technical guide..."}
            </h2>
            <p className="text-slate-400 font-mono text-xs uppercase tracking-[0.2em]">Building context for {url.split('/').pop()}</p>
          </div>
        );

      case AppState.READY:
        return (
          <div className="animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto mb-4 flex items-center justify-between">
              <button 
                onClick={() => { setState(AppState.IDLE); setUrl(''); setAnalysis(null); setChatHistory([]); }}
                className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Back</span>
              </button>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                {url.split('/').slice(-2).join(' / ')}
              </div>
            </div>
            
            {analysis && (
              <div className="flex flex-col gap-6">
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
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => { setState(AppState.IDLE); setUrl(''); }}>
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform shadow-sm">
              <BookText className="text-white" size={18} />
            </div>
            <span className="font-extrabold text-xl tracking-tighter text-slate-900 uppercase">RepoGuide</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {renderContent()}
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white">
        <p className="text-[10px] text-slate-400 text-center uppercase tracking-[0.3em] font-bold">
          Technical Architecture Walkthrough & Logic Mapping
        </p>
      </footer>
    </div>
  );
};

export default App;
