
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';
import { RepoAnalysis } from '../types';
import { FileText, Copy, Check, Loader2, X, Download } from 'lucide-react';
import Markdown from 'react-markdown';

interface DocumentationGeneratorProps {
  analysis: RepoAnalysis;
}

const DocumentationGenerator: React.FC<DocumentationGeneratorProps> = ({ analysis }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [docType, setDocType] = useState<'README' | 'CONTRIBUTING' | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (type: 'README' | 'CONTRIBUTING') => {
    setIsGenerating(true);
    setDocType(type);
    setGeneratedContent(null);
    try {
      const content = await geminiService.generateDoc(type, analysis);
      setGeneratedContent(content);
    } catch (error) {
      console.error("Failed to generate documentation:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadFile = () => {
    if (generatedContent && docType) {
      const blob = new Blob([generatedContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docType}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg text-indigo-600 bg-indigo-50 border border-indigo-200">
            <FileText className="w-3 h-3" />
          </div>
          <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Documentation Generator</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleGenerate('README')}
            disabled={isGenerating}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            {isGenerating && docType === 'README' ? <Loader2 size={12} className="animate-spin" /> : null}
            Generate README
          </button>
          <button
            onClick={() => handleGenerate('CONTRIBUTING')}
            disabled={isGenerating}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            {isGenerating && docType === 'CONTRIBUTING' ? <Loader2 size={12} className="animate-spin" /> : null}
            Generate CONTRIBUTING
          </button>
        </div>
      </div>

      {generatedContent && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2 rounded-t-xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{docType}.md Preview</span>
            <div className="flex gap-2">
              <button 
                onClick={copyToClipboard}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"
                title="Copy to clipboard"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span className="text-[9px] font-bold uppercase">{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button 
                onClick={downloadFile}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"
                title="Download file"
              >
                <Download size={14} />
                <span className="text-[9px] font-bold uppercase">Download</span>
              </button>
              <button 
                onClick={() => setGeneratedContent(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Close preview"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="bg-slate-50 border-x border-b border-slate-200 p-6 rounded-b-xl max-h-[500px] overflow-y-auto custom-scrollbar">
            <Markdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-xl font-black text-slate-900 mt-6 mb-4 border-b border-slate-200 pb-2 uppercase tracking-tight" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold text-slate-800 mt-5 mb-3 border-b border-slate-100 pb-1" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-base font-bold text-slate-800 mt-4 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="text-sm text-slate-600 leading-relaxed mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 mb-4 space-y-1 text-sm text-slate-600" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 mb-4 space-y-1 text-sm text-slate-600" {...props} />,
                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                code: ({node, ...props}) => <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs" {...props} />,
                pre: ({node, ...props}) => <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto mb-4 text-xs font-mono" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-slate-500 mb-4" {...props} />,
                a: ({node, ...props}) => <a className="text-indigo-600 hover:underline font-medium" {...props} />,
              }}
            >
              {generatedContent}
            </Markdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentationGenerator;
