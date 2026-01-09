
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';

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
    <div className="max-w-3xl mx-auto mt-24 mb-20 px-4">
      <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800/50 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Sparkles size={18} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-slate-100 font-bold">Office Hours</h2>
              <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Ask anything about the code</p>
            </div>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="h-[500px] overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center px-8 space-y-8">
              <div className="space-y-4">
                <Bot size={48} className="mx-auto opacity-10" />
                <p className="text-lg font-light text-slate-400">The guide is complete. How can I help you explore further?</p>
              </div>
              
              <div className="grid grid-cols-1 gap-2 w-full">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(q)}
                    className="text-left p-4 bg-slate-800/40 hover:bg-indigo-500/10 border border-slate-800/60 hover:border-indigo-500/30 rounded-2xl text-sm text-slate-400 hover:text-indigo-300 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                  msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'
                }`}>
                  {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-indigo-400" />}
                </div>
                <div className={`p-5 rounded-2xl text-base leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none shadow-sm'
                }`}>
                  {msg.content === '' ? (
                    <div className="flex gap-1 py-1">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none whitespace-pre-wrap font-light">
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border-t border-slate-800/50">
          <div className="relative group">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask for an implementation example or logic walkthrough..."
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-slate-200 resize-none overflow-hidden placeholder:text-slate-600"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 bottom-3 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:bg-slate-700 transition-all shadow-lg"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
