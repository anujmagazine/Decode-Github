
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
    <div className="w-full mt-2">
      <div className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <Sparkles size={14} className="text-indigo-600" />
            <h2 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Office Hours</h2>
          </div>
          {messages.length > 0 && (
            <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest">{messages.length} messages logged</span>
          )}
        </div>

        <div 
          ref={scrollRef}
          className="h-[300px] overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/30"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <p className="text-slate-400 text-[11px] font-medium mb-4 uppercase tracking-wider">Dive deeper into implementation details:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedQuestions.slice(0, 4).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(q)}
                    className="text-[10px] font-bold px-3 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 rounded-full text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-xs"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                  msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-100 border border-slate-200'
                }`}>
                  {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-indigo-600" />}
                </div>
                <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-xs ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                }`}>
                  {msg.content === '' ? (
                    <div className="flex gap-1 py-1">
                      <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                  ) : (
                    <div className="prose prose-slate prose-sm max-w-none whitespace-pre-wrap font-medium">
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for an implementation example or logic detail..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-indigo-600/20 transition-all text-xs text-slate-700 placeholder:text-slate-400"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 bottom-2 px-2 text-indigo-600 hover:text-indigo-800 disabled:text-slate-300 transition-all"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
