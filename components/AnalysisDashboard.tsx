
import React from 'react';
import { RepoAnalysis } from '../types';
import { Flag, Lightbulb, FolderTree, Layers, FileCode2, Info } from 'lucide-react';

interface AnalysisDashboardProps {
  analysis: RepoAnalysis;
  onAskQuestion: (q: string) => void;
}

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; color: string }> = ({ icon, title, children, color }) => (
  <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-lg ${color} bg-opacity-20 text-opacity-100`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
      </div>
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">{title}</h2>
    </div>
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 shadow-sm">
      <div className="text-slate-300 leading-relaxed text-base">
        {children}
      </div>
    </div>
  </section>
);

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis, onAskQuestion }) => {
  return (
    <div className="max-w-4xl mx-auto py-2">
      <Section icon={<Flag className="text-blue-400"/>} title="The Mission" color="bg-blue-500">
        <p className="text-lg font-medium text-slate-200">{analysis.mission}</p>
      </Section>

      <Section icon={<Layers className="text-indigo-400"/>} title="The Blueprint" color="bg-indigo-500">
        <p>{analysis.architectureSimple}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {analysis.techStack.map((tech, i) => (
            <span key={i} className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[11px] font-mono rounded">
              {tech}
            </span>
          ))}
        </div>
      </Section>

      <Section icon={<Lightbulb className="text-amber-400"/>} title="Technical Decisions" color="bg-amber-500">
        <div className="grid grid-cols-1 gap-4">
          {analysis.technicalDecisions.map((item, i) => (
            <div key={i} className="group bg-slate-900/50 p-4 rounded-xl border border-slate-800/40 hover:border-amber-500/30 transition-colors">
              <h3 className="font-bold text-amber-500 text-sm mb-1">{item.decision}</h3>
              <p className="text-sm text-slate-400 leading-normal">{item.rationale}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<FileCode2 className="text-emerald-400"/>} title="The File Map" color="bg-emerald-500">
        <div className="space-y-3">
          {analysis.importantFiles.map((file, i) => (
            <div key={i} className="flex gap-4 p-3 rounded-xl bg-slate-900/30 border border-slate-800/20 items-start">
              <code className="text-emerald-400 text-xs font-mono bg-emerald-400/5 px-2 py-1 rounded shrink-0">
                {file.path}
              </code>
              <p className="text-sm text-slate-400 leading-snug">{file.role}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<FolderTree className="text-cyan-400"/>} title="The Anatomy" color="bg-cyan-500">
        <div className="flex gap-3 items-start text-slate-400">
          <Info size={18} className="text-cyan-500 mt-1 shrink-0 opacity-50" />
          <p className="text-sm italic leading-relaxed">{analysis.fileOrganizationLogic}</p>
        </div>
      </Section>

      <div className="mt-12 pt-8 border-t border-slate-800/50">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Explore the details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => onAskQuestion(q)}
              className="text-left p-4 bg-slate-900/60 hover:bg-indigo-600/10 border border-slate-800/60 hover:border-indigo-500/30 rounded-xl text-xs text-slate-400 hover:text-indigo-300 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
