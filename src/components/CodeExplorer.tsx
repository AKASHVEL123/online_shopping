import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Folder,
  File,
  Layers,
  Terminal,
  Server,
  Database
} from 'lucide-react';
import JSZip from 'jszip';
import { PROJECT_FILES, ProjectFile } from '../data/projectFiles';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();
      const folder = zip.folder('online-shopping-system');

      if (folder) {
        // Add all project files
        PROJECT_FILES.forEach(file => {
          folder.file(file.path, file.content);
        });

        // Add a helpful README.txt for students
        folder.file(
          'README.txt',
          `ONLINE SHOPPING SYSTEM
======================
Academic CRUD Project Demonstration
Technologies: HTML5 + CSS3 + Vanilla JavaScript + Python Flask + SQLite + Docker + Kubernetes

HOW TO RUN LOCALLY (Windows PowerShell):
1. python -m venv venv
2. venv\\Scripts\\activate
3. pip install -r requirements.txt
4. python app.py
5. Open browser at http://localhost:5000

HOW TO RUN WITH DOCKER:
1. docker build -t online-shopping-system .
2. docker run -p 5000:5000 online-shopping-system
3. Open browser at http://localhost:5000

HOW TO RUN ON KUBERNETES / MINIKUBE:
1. minikube start
2. minikube image load online-shopping-system
3. kubectl apply -f deployment.yaml
4. kubectl apply -f service.yaml
5. minikube service online-shopping-service
`
        );

        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'online-shopping-system.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to create ZIP', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner with Download & Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-amber-400" />
            Project File Explorer &amp; Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse all 11 files required for the academic submission. Every file is complete and production-ready.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isZipping ? 'Generating ZIP...' : 'Download Project (.ZIP)'}
        </button>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: File Tree */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
            Project Tree (online-shopping-system/)
          </div>

          <div className="space-y-1">
            {PROJECT_FILES.map(file => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-blue-50 text-blue-800 border border-blue-200 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <File className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="truncate">{file.path}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-sans uppercase shrink-0 ${
                      file.category === 'backend'
                        ? 'bg-emerald-100 text-emerald-800'
                        : file.category === 'frontend'
                        ? 'bg-sky-100 text-sky-800'
                        : file.category === 'docker'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1.5">
            <p className="font-semibold text-slate-700">Strict Constraints Followed:</p>
            <p>✓ Python built-in sqlite3 (No SQLAlchemy)</p>
            <p>✓ Vanilla HTML + CSS + JS (No React/Bootstrap)</p>
            <p>✓ Lightweight Dockerfile (python:3.10-slim)</p>
            <p>✓ NodePort Kubernetes Service (No Ingress/Helm)</p>
          </div>
        </div>

        {/* Right Column: Code Viewer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          {/* Header */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-sm font-bold text-white">
                  {selectedFile.path}
                </span>
                <span className="text-[11px] font-sans bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {selectedFile.language}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {selectedFile.purpose}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy File</span>
                </>
              )}
            </button>
          </div>

          {/* Code content */}
          <div className="p-4 overflow-x-auto flex-1 max-h-[600px] overflow-y-auto">
            <pre className="font-mono text-xs text-slate-200 leading-relaxed">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
