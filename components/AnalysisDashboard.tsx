
import React from 'react';
import { RepoAnalysis } from '../types';
import { Lightbulb, FolderTree, FileCode2, Info, Cpu, Network, Zap, Star } from 'lucide-react';

interface AnalysisDashboardProps {
  analysis: RepoAnalysis;
}

const Card: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; colorClass: string; className?: string }> = ({ icon, title, children, colorClass, className = "" }) => (
  <div className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full ${className}`}>
    <div className="flex items-center gap-2 mb-2">
      <div className={`p-1 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100 border border-current bg-transparent`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-3 h-3' })}
      </div>
      <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-400">{title}</h2>
    </div>
    <div className="text-slate-600 leading-relaxed text-xs flex-1">
      {children}
    </div>
  </div>
);

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis }) => {
  return (
    <div className="w-full space-y-3">
      {/* Header Card */}
      <header className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex flex-col gap-0.5 max-w-[85%]">
          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1 uppercase">
            {analysis.appName}
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-tight italic">
            {analysis.mission}
          </p>
        </div>
        <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
          <Zap size={24} className="text-indigo-600 opacity-80" />
        </div>
      </header>

      {/* Top 10 Features - Full Width Compact */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1 rounded-lg text-yellow-600 bg-yellow-50 border border-yellow-200">
            <Star className="w-3 h-3" />
          </div>
          <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Key Highlights & Capabilities</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-2">
          {analysis.topFeatures.slice(0, 10).map((feature, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-[10px] font-bold text-indigo-400 shrink-0 mt-0.5">{i + 1}.</span>
              <p className="text-[10px] text-slate-600 leading-tight font-medium">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* Core Logic & Architecture (Left Column) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <Card icon={<Cpu />} title="Core Logic Components" colorClass="text-indigo-600 border-indigo-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {analysis.coreLogic.components.map((comp, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                  <h3 className="font-bold text-indigo-700 text-[10px] mb-0.5 uppercase tracking-tighter">{comp.name}</h3>
                  <p className="text-[10px] text-slate-500 leading-snug">{comp.explanation}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card icon={<Network />} title="Technical Architecture" colorClass="text-cyan-600 border-cyan-200">
            <div className="text-slate-600 font-medium leading-relaxed text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-100">
              {analysis.technicalArchitecture}
            </div>
          </Card>
        </div>

        {/* Decisions & File Map (Right Column) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <Card icon={<Lightbulb />} title="Strategic Decisions" colorClass="text-amber-600 border-amber-200">
            <div className="space-y-2">
              {analysis.topTechnicalDecisions.map((item, i) => (
                <div key={i} className="bg-amber-50/20 border border-amber-100/30 p-2 rounded-lg">
                  <h3 className="font-bold text-slate-800 text-[10px] mb-0.5">{item.title}</h3>
                  <p className="text-[10px] text-slate-500 leading-tight">{item.rationale}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card icon={<FileCode2 />} title="The File Map" colorClass="text-emerald-600 border-emerald-200">
            <div className="grid grid-cols-1 gap-1.5">
              {analysis.importantFiles.slice(0, 5).map((file, i) => (
                <div key={i} className="flex gap-2 items-center px-2 py-1.5 rounded-md bg-slate-50 border border-slate-100">
                  <code className="text-emerald-700 text-[9px] font-mono font-bold shrink-0">
                    {file.path.split('/').pop()}
                  </code>
                  <p className="text-[9px] text-slate-500 leading-none truncate flex-1">{file.role}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card icon={<FolderTree />} title="Organization" colorClass="text-rose-600 border-rose-200">
            <div className="flex gap-2 items-start text-slate-500 text-[10px] italic leading-tight">
              <Info size={12} className="text-rose-400 shrink-0" />
              <p>{analysis.fileOrganizationLogic}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
