
import React, { useState } from 'react';
import { parseGitHubUrl, fetchRepoContents } from './services/github';
import { geminiService } from './services/gemini';
import { AppState, RepoAnalysis, ChatMessage, FileContent } from './types';
import AnalysisDashboard from './components/AnalysisDashboard';
import ChatBox from './components/ChatBox';
import { Github, Search, AlertCircle, Loader2, BookText } from 'lucide-react';

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
            <div className="mb-8 p-5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <BookText size={48} className="text-indigo-400" />
            </div>
            <h1 className="text-5xl font-black mb-4 tracking-tight text-white">
              Repo<span className="text-indigo-500">Guide</span>
            </h1>
            <p className="text-slate-400 max-w-xl mb-12 text-lg">
              Unlock the engineering secrets of any public codebase. From high-level architecture to the specific "why" behind every file.
            </p>
            
            <form onSubmit={handleStartAnalysis} className="w-full max-w-2xl relative">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Github size={20} className="text-slate-500" />
              </div>
              <input 
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste GitHub repository URL..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-5 pl-14 pr-40 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-slate-100 text-lg shadow-2xl"
              />
              <button 
                type="submit"
                className="absolute right-2.5 top-2.5 bottom-2.5 px-8 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg text-sm"
              >
                Analyze <Search size={18} />
              </button>
            </form>

            {error && (
              <div className="mt-8 flex items-center gap-3 text-rose-400 bg-rose-400/5 px-6 py-3 rounded-xl border border-rose-400/20">
                <AlertCircle size={18} />
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>
        );

      case AppState.FETCHING:
      case AppState.ANALYZING:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse"></div>
              <Loader2 size={64} className="text-indigo-400 animate-spin relative" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-100">
              {state === AppState.FETCHING ? "Fetching the source..." : "Building the narrative..."}
            </h2>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Processing {url.split('/').pop()} codebase</p>
          </div>
        );

      case AppState.READY:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-[calc(100vh-140px)]">
            <div className="lg:col-span-8 h-full overflow-y-auto pr-6 custom-scrollbar scroll-smooth">
              {analysis && (
                <AnalysisDashboard 
                  analysis={analysis} 
                  onAskQuestion={handleSendMessage}
                />
              )}
            </div>
            <div className="lg:col-span-4 h-full relative">
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
    <div className="min-h-screen flex flex-col bg-[#0a0c10]">
      <header className="border-b border-slate-900/80 bg-[#0a0c10]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => { setState(AppState.IDLE); setUrl(''); setAnalysis(null); setChatHistory([]); }}
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
              <BookText className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-100">RepoGuide</span>
          </div>
          {state === AppState.READY && (
            <div className="flex items-center gap-3">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
                {url.split('/').slice(-2).join(' / ')}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-8 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
