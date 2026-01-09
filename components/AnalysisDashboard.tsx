
import React from 'react';
import { RepoAnalysis } from '../types';
import { BookOpen, Box, Cpu, Lightbulb, CheckCircle2, Terminal } from 'lucide-react';

interface AnalysisDashboardProps {
  analysis: RepoAnalysis;
  onAskQuestion: (q: string) => void;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis, onAskQuestion }) => {
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <section className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4 text-blue-400">
          <BookOpen size={20} />
          <h2 className="text-lg font-semibold text-slate-100">Project Overview</h2>
        </div>
        <p className="text-slate-300 leading-relaxed">
          {analysis.summary}
        </p>
      </section>

      {/* Architecture & Tech Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4 text-indigo-400">
            <Cpu size={20} />
            <h2 className="text-lg font-semibold text-slate-100">Architecture</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
            {analysis.architecture}
          </p>
        </section>

        <section className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4 text-emerald-400">
            <Box size={20} />
            <h2 className="text-lg font-semibold text-slate-100">Tech Stack</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.techStack.map((tech, i) => (
              <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
                {tech}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* Key Features */}
      <section className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4 text-amber-400">
          <Lightbulb size={20} />
          <h2 className="text-lg font-semibold text-slate-100">Key Features</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.keyFeatures.map((feature, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700/30">
              <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <span className="text-sm text-slate-300">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Suggested Questions */}
      <section>
        <div className="flex items-center gap-3 mb-4 text-purple-400">
          <Terminal size={20} />
          <h2 className="text-lg font-semibold text-slate-100">Suggested Curiosity Points</h2>
        </div>
        <div className="space-y-2">
          {analysis.suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => onAskQuestion(q)}
              className="w-full text-left p-4 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-xl text-sm text-slate-300 transition-all hover:translate-x-1"
            >
              {q}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AnalysisDashboard;
