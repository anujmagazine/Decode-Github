
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, User, Bot, Loader2, Maximize2 } from 'lucide-react';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-semibold text-slate-200">Repo Guide AI</span>
        </div>
        <button className="text-slate-500 hover:text-slate-300">
          <Maximize2 size={16} />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center px-8">
            <Bot size={40} className="mb-4 opacity-20" />
            <p className="text-sm">I've digested the repository. Ask me anything about specific files, logic flow, or implementation details.</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-blue-400" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
              }`}>
                {msg.content === '' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                    {msg.content}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask about a specific function, class, or design pattern..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-200 resize-none overflow-hidden"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 px-3 text-blue-500 hover:text-blue-400 disabled:text-slate-600 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-slate-600 text-center uppercase tracking-widest font-bold">
          CodeNexus AI Assistant
        </p>
      </form>
    </div>
  );
};

export default ChatBox;
