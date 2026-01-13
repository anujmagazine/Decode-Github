
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, User, Bot, Sparkles } from 'lucide-react';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  suggestedQuestions?: string[];
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, isLoading, suggestedQuestions = [] }) => {
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
    <div className="w-full">
      <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-indigo-600" />
            <h2 className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Office Hours Assistant</h2>
          </div>
          {messages.length > 0 && (
            <span className="text-[8px] font-mono font-bold text-slate-300 uppercase tracking-widest">{messages.length} messages</span>
          )}
        </div>

        <div 
          ref={scrollRef}
          className="h-[200px] overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/20"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <p className="text-slate-400 text-[10px] font-medium mb-3 uppercase tracking-wider">Ask a code review or implementation question:</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {suggestedQuestions.slice(0, 3).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(q)}
                    className="text-[9px] font-bold px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded-full text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-xs"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center shadow-xs ${
                  msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-100 border border-slate-200'
                }`}>
                  {msg.role === 'user' ? <User size={12} className="text-white" /> : <Bot size={12} className="text-indigo-600" />}
                </div>
                <div className={`p-3 rounded-xl text-[12px] leading-relaxed shadow-xs ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                }`}>
                  {msg.content === '' ? (
                    <div className="flex gap-0.5 py-1">
                      <div className="w-1 h-1 bg-indigo-200 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-indigo-200 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-1 h-1 bg-indigo-200 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                  ) : (
                    <div className="prose prose-slate prose-xs max-w-none whitespace-pre-wrap font-medium">
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-2 bg-white border-t border-slate-100">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Deep dive into code logic..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-indigo-600/20 transition-all text-xs text-slate-700 placeholder:text-slate-400"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1 bottom-1 px-1.5 text-indigo-600 hover:text-indigo-800 disabled:text-slate-300 transition-all"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
