
import React from 'react';
import { RepoAnalysis } from '../types';
import { Flag, Lightbulb, FolderTree, FileCode2, Info, Cpu, Network, Zap } from 'lucide-react';

interface AnalysisDashboardProps {
  analysis: RepoAnalysis;
}

const Card: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; colorClass: string; className?: string }> = ({ icon, title, children, colorClass, className = "" }) => (
  <div className={`bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full ${className}`}>
    <div className="flex items-center gap-2 mb-3">
      <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100 border border-current bg-transparent`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-3.5 h-3.5' })}
      </div>
      <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{title}</h2>
    </div>
    <div className="text-slate-600 leading-relaxed text-sm flex-1">
      {children}
    </div>
  </div>
);

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis }) => {
  return (
    <div className="w-full space-y-4">
      {/* Header Card - Very Compact */}
      <header className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm flex items-center justify-between">
        <div className="relative z-10 flex flex-col gap-1 max-w-[80%]">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {analysis.appName}
          </h1>
          <p className="text-sm text-slate-500 font-medium leading-snug italic">
            {analysis.mission}
          </p>
        </div>
        <div className="p-3 bg-indigo-50 rounded-2xl">
          <Zap size={32} className="text-indigo-600 opacity-80" />
        </div>
      </header>

      {/* Main Grid Layout - Balanced for one-view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Core Logic Section (7/12) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card icon={<Cpu />} title="App's Core Logic" colorClass="text-indigo-600 border-indigo-200">
            <p className="mb-4 text-xs font-medium text-slate-400">{analysis.coreLogic.overview}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.coreLogic.components.map((comp, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <h3 className="font-bold text-indigo-700 text-[11px] mb-1 uppercase tracking-tighter">{comp.name}</h3>
                  <p className="text-[11px] text-slate-500 leading-normal">{comp.explanation}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card icon={<Network />} title="Technical Architecture" colorClass="text-cyan-600 border-cyan-200">
            <div className="text-slate-600 whitespace-pre-wrap font-medium leading-relaxed text-[11px] bg-slate-50 p-4 rounded-xl border border-slate-100">
              {analysis.technicalArchitecture}
            </div>
          </Card>
        </div>

        {/* Decisions & File Map (5/12) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card icon={<Lightbulb />} title="Top 3 Decisions" colorClass="text-amber-600 border-amber-200">
            <div className="space-y-3">
              {analysis.topTechnicalDecisions.map((item, i) => (
                <div key={i} className="bg-amber-50/30 border border-amber-100/50 p-3 rounded-xl">
                  <h3 className="font-bold text-slate-800 text-[11px] mb-1">{item.title}</h3>
                  <p className="text-[10px] text-slate-500 leading-tight">{item.rationale}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card icon={<FileCode2 />} title="The File Map" colorClass="text-emerald-600 border-emerald-200">
            <div className="grid grid-cols-1 gap-2">
              {analysis.importantFiles.slice(0, 6).map((file, i) => (
                <div key={i} className="flex gap-2 items-start p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <code className="text-emerald-700 text-[10px] font-mono font-bold shrink-0 mt-0.5">
                    {file.path.split('/').pop()}
                  </code>
                  <p className="text-[10px] text-slate-500 leading-tight flex-1">{file.role}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card icon={<FolderTree />} title="Organization Anatomy" colorClass="text-rose-600 border-rose-200">
            <div className="flex gap-2 items-start text-slate-500 text-[10px] italic">
              <Info size={12} className="text-rose-400 shrink-0 mt-0.5" />
              <p>{analysis.fileOrganizationLogic}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
