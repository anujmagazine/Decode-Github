
import React from 'react';
import { RepoAnalysis } from '../types';
import { Flag, Map, Lightbulb, FolderTree, Layers, MessageSquareText } from 'lucide-react';

interface AnalysisDashboardProps {
  analysis: RepoAnalysis;
  onAskQuestion: (q: string) => void;
}

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; color: string }> = ({ icon, title, children, color }) => (
  <section className="relative pl-8 pb-10 border-l border-slate-700/50 last:pb-0">
    <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full ${color} flex items-center justify-center border-4 border-slate-900 shadow-xl`}>
      {icon}
    </div>
    <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-6 transition-all hover:bg-slate-800/30">
      <h2 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2 uppercase tracking-wider text-sm opacity-80">
        {title}
      </h2>
      <div className="text-slate-300 leading-relaxed text-base space-y-4">
        {children}
      </div>
    </div>
  </section>
);

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis, onAskQuestion }) => {
  return (
    <div className="max-w-3xl mx-auto py-4 space-y-2">
      <Section icon={<Flag size={12} className="text-white"/>} title="The Mission" color="bg-blue-600">
        <p>{analysis.mission}</p>
      </Section>

      <Section icon={<Layers size={12} className="text-white"/>} title="The Blueprint" color="bg-indigo-600">
        <p>{analysis.architectureSimple}</p>
        <div className="pt-2 flex flex-wrap gap-2">
          {analysis.techStack.map((tech, i) => (
            <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-slate-700 rounded uppercase tracking-tighter opacity-70">
              {tech}
            </span>
          ))}
        </div>
      </Section>

      <Section icon={<Lightbulb size={12} className="text-white"/>} title="Technical Decisions" color="bg-amber-600">
        <div className="space-y-4">
          {analysis.technicalDecisions.map((item, i) => (
            <div key={i} className="border-l-2 border-amber-600/30 pl-4 py-1">
              <h3 className="font-bold text-amber-400 text-sm mb-1">{item.decision}</h3>
              <p className="text-sm text-slate-400">{item.rationale}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<FolderTree size={12} className="text-white"/>} title="The Anatomy" color="bg-emerald-600">
        <p className="whitespace-pre-line text-sm">{analysis.fileOrganization}</p>
      </Section>

      <Section icon={<MessageSquareText size={12} className="text-white"/>} title="Deeper Dives" color="bg-purple-600">
        <p className="text-xs text-slate-500 mb-4 italic">Choose a path to explore the code further:</p>
        <div className="flex flex-col gap-2">
          {analysis.suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => onAskQuestion(q)}
              className="text-left p-3 bg-slate-700/20 hover:bg-purple-600/20 border border-slate-700/50 rounded-xl text-sm text-slate-300 transition-all hover:translate-x-1"
            >
              {q}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default AnalysisDashboard;
