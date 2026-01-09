
import React from 'react';
import { RepoAnalysis } from '../types';
import { Flag, Lightbulb, FolderTree, Layers, FileCode2, Info, Cpu, Network, Zap } from 'lucide-react';

interface AnalysisDashboardProps {
  analysis: RepoAnalysis;
}

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; color: string }> = ({ icon, title, children, color }) => (
  <section className="mb-16 last:mb-0">
    <div className="flex items-center gap-4 mb-6">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100 shadow-sm border border-white/5`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
      </div>
      <div>
        <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500 mb-0.5">{title}</h2>
        <div className="h-0.5 w-12 bg-slate-800 rounded-full"></div>
      </div>
    </div>
    <div className="text-slate-300 leading-relaxed text-lg font-light">
      {children}
    </div>
  </section>
);

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis }) => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <header className="mb-20 text-center">
        <h1 className="text-5xl font-black text-white mb-6 tracking-tight leading-tight">
          {analysis.appName}
        </h1>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 font-mono text-xs mb-8">
          <Zap size={14} className="text-yellow-500" />
          Technical Deep Dive
        </div>
      </header>

      <Section icon={<Flag className="text-blue-400"/>} title="The Mission" color="bg-blue-500">
        <p className="text-xl text-slate-200 font-normal leading-relaxed">{analysis.mission}</p>
      </Section>

      <Section icon={<Cpu className="text-indigo-400"/>} title="App's Core Logic" color="bg-indigo-500">
        <p className="mb-8">{analysis.coreLogic.overview}</p>
        <div className="space-y-6">
          {analysis.coreLogic.components.map((comp, i) => (
            <div key={i} className="relative pl-6 border-l-2 border-indigo-500/20 py-2">
              <h3 className="font-bold text-slate-100 text-lg mb-2">{comp.name}</h3>
              <p className="text-slate-400 text-base leading-relaxed italic">"{comp.explanation}"</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Network className="text-cyan-400"/>} title="Technical Architecture" color="bg-cyan-500">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-inner">
          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{analysis.technicalArchitecture}</p>
        </div>
      </Section>

      <Section icon={<Lightbulb className="text-amber-400"/>} title="Top 3 Technical Decisions" color="bg-amber-500">
        <div className="grid grid-cols-1 gap-6">
          {analysis.topTechnicalDecisions.map((item, i) => (
            <div key={i} className="group bg-slate-900/30 p-6 rounded-2xl border border-slate-800/40 hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-amber-500/50 font-mono">0{i+1}</span>
                <h3 className="font-bold text-slate-100 text-lg">{item.title}</h3>
              </div>
              <p className="text-slate-400 text-base leading-relaxed">{item.rationale}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<FileCode2 className="text-emerald-400"/>} title="The File Map" color="bg-emerald-500">
        <div className="grid grid-cols-1 gap-3">
          {analysis.importantFiles.map((file, i) => (
            <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/20">
              <code className="text-emerald-400 text-sm font-mono bg-emerald-400/5 px-2 py-1 rounded w-fit">
                {file.path}
              </code>
              <p className="text-sm text-slate-400 leading-snug">{file.role}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<FolderTree className="text-rose-400"/>} title="The Anatomy" color="bg-rose-500">
        <div className="flex gap-4 items-start bg-rose-500/5 p-6 rounded-2xl border border-rose-500/10">
          <Info size={24} className="text-rose-500 shrink-0 opacity-50" />
          <p className="text-base text-slate-300 italic leading-relaxed">{analysis.fileOrganizationLogic}</p>
        </div>
      </Section>

      <Section icon={<Layers className="text-slate-400"/>} title="Tech Stack" color="bg-slate-500">
        <div className="flex flex-wrap gap-2">
          {analysis.techStack.map((tech, i) => (
            <span key={i} className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono rounded-lg shadow-sm">
              {tech}
            </span>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default AnalysisDashboard;
