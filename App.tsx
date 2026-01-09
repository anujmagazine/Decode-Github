
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
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="mb-12 p-8 bg-indigo-600/5 rounded-[2.5rem] border border-indigo-600/10 shadow-2xl">
              <BookText size={80} className="text-indigo-500" />
            </div>
            <h1 className="text-6xl font-black mb-6 tracking-tight text-white">
              Repo<span className="text-indigo-600">Guide</span>
            </h1>
            <p className="text-slate-400 max-w-xl mb-12 text-xl font-light leading-relaxed">
              Understand the "how" and "why" behind any codebase. 
              Get mentor-level architectural insights in seconds.
            </p>
            
            <form onSubmit={handleStartAnalysis} className="w-full max-w-2xl relative">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Github size={24} className="text-slate-600" />
              </div>
              <input 
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a GitHub repository link..."
                className="w-full bg-slate-900 border border-slate-800 rounded-3xl py-6 pl-16 pr-44 focus:outline-none focus:ring-2 focus:ring-indigo-600/40 transition-all text-slate-100 text-xl shadow-inner"
              />
              <button 
                type="submit"
                className="absolute right-3 top-3 bottom-3 px-10 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl text-white"
              >
                Analyze <Search size={20} />
              </button>
            </form>

            {error && (
              <div className="mt-10 flex items-center gap-3 text-rose-400 bg-rose-400/5 px-8 py-4 rounded-2xl border border-rose-400/10">
                <AlertCircle size={20} />
                <span className="font-medium text-lg">{error}</span>
              </div>
            )}
          </div>
        );

      case AppState.FETCHING:
      case AppState.ANALYZING:
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] rounded-full animate-pulse"></div>
              <Loader2 size={80} className="text-indigo-500 animate-spin relative" />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-white">
              {state === AppState.FETCHING ? "Exploring the repository..." : "Drafting your technical guide..."}
            </h2>
            <p className="text-slate-500 font-mono text-sm uppercase tracking-[0.3em]">Building context for {url.split('/').pop()}</p>
          </div>
        );

      case AppState.READY:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="max-w-4xl mx-auto mb-10">
              <button 
                onClick={() => { setState(AppState.IDLE); setUrl(''); setAnalysis(null); setChatHistory([]); }}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors mb-8 group"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-widest">Start New Analysis</span>
              </button>
            </div>
            
            {analysis && (
              <>
                <AnalysisDashboard analysis={analysis} />
                <ChatBox 
                  messages={chatHistory} 
                  onSendMessage={handleSendMessage} 
                  isLoading={false}
                  suggestedQuestions={analysis.suggestedQuestions}
                />
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a]">
      <header className="border-b border-white/5 bg-[#05070a]/80 backdrop-blur-3xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-600/20">
              <BookText className="text-white" size={20} />
            </div>
            <span className="font-black text-2xl tracking-tighter text-white">RepoGuide</span>
          </div>
          {state === AppState.READY && (
            <div className="hidden md:block">
              <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] px-4 py-1.5 bg-slate-900/50 rounded-full border border-white/5">
                {url.split('/').slice(-2).join(' / ')}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto p-8">
        {renderContent()}
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.4em] font-black">
          A Narrative Tool for Modern Engineers
        </p>
      </footer>
    </div>
  );
};

export default App;
