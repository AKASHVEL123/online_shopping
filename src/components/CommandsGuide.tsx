import React, { useState } from 'react';
import {
  Terminal,
  Server,
  Boxes,
  Layers,
  Copy,
  Check,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface CommandItem {
  cmd: string;
  explanation: string;
}

export const CommandsGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'local' | 'docker' | 'kubernetes' | 'troubleshoot'>('local');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const localCommands: CommandItem[] = [
    {
      cmd: 'python -m venv venv',
      explanation: 'Creates a dedicated, isolated Python virtual environment named "venv" so dependencies do not conflict with your global system Python.'
    },
    {
      cmd: 'venv\\Scripts\\activate',
      explanation: 'Activates the virtual environment in Windows PowerShell (or use "source venv/bin/activate" on macOS/Linux). Your terminal prompt will show (venv).'
    },
    {
      cmd: 'pip install -r requirements.txt',
      explanation: 'Installs Flask into the active virtual environment as defined in requirements.txt.'
    },
    {
      cmd: 'python app.py',
      explanation: 'Starts the Flask development server on host 0.0.0.0, port 5000 with debug mode enabled. It automatically creates database.db and seeds sample products if empty.'
    },
    {
      cmd: 'http://localhost:5000',
      explanation: 'Open this URL in any web browser (Chrome, Edge, Firefox) to view and test the ONLINE SHOPPING SYSTEM.'
    }
  ];

  const dockerCommands: CommandItem[] = [
    {
      cmd: 'docker build -t online-shopping-system .',
      explanation: 'Builds a Docker container image named "online-shopping-system" using the Dockerfile in the current directory (.).'
    },
    {
      cmd: 'docker run -p 5000:5000 online-shopping-system',
      explanation: 'Runs a container from the image and forwards port 5000 on your host machine to port 5000 inside the container.'
    },
    {
      cmd: 'docker ps',
      explanation: 'Lists all currently running Docker containers, showing Container ID, Image name, Status, and Port mappings.'
    },
    {
      cmd: 'docker stop <container-id>',
      explanation: 'Gracefully stops the specified running container (replace <container-id> with the ID from "docker ps").'
    },
    {
      cmd: 'docker rm <container-id>',
      explanation: 'Removes the stopped container from your system to free up resources.'
    }
  ];

  const k8sCommands: CommandItem[] = [
    {
      cmd: 'minikube start',
      explanation: 'Starts your local single-node Kubernetes cluster inside Minikube.'
    },
    {
      cmd: 'minikube image load online-shopping-system',
      explanation: 'Directly loads your locally built Docker image into the Minikube cluster VM so Kubernetes can find it without uploading to Docker Hub.'
    },
    {
      cmd: 'kubectl apply -f deployment.yaml',
      explanation: 'Creates the Kubernetes Deployment ("online-shopping-deployment") with 1 replica pod running the Flask container.'
    },
    {
      cmd: 'kubectl apply -f service.yaml',
      explanation: 'Creates the Kubernetes NodePort Service ("online-shopping-service") to expose container port 5000.'
    },
    {
      cmd: 'kubectl get pods',
      explanation: 'Displays the status of the pods. Verify that your pod shows STATUS: Running and READY: 1/1.'
    },
    {
      cmd: 'kubectl get deployments',
      explanation: 'Checks the deployment status to ensure 1/1 replicas are up to date and available.'
    },
    {
      cmd: 'kubectl get services',
      explanation: 'Lists services and shows the assigned NodePort (e.g., 5000:3xxxx/TCP).'
    },
    {
      cmd: 'minikube service online-shopping-service',
      explanation: 'Automatically creates a tunnel and opens the application in your default web browser.'
    }
  ];

  const cleanupCommands: CommandItem[] = [
    {
      cmd: 'kubectl delete -f service.yaml',
      explanation: 'Deletes the Kubernetes NodePort service.'
    },
    {
      cmd: 'kubectl delete -f deployment.yaml',
      explanation: 'Deletes the deployment and automatically terminates its associated pod.'
    },
    {
      cmd: 'minikube stop',
      explanation: 'Shuts down the Minikube virtual machine to release CPU and RAM.'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('local')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'local'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4 text-emerald-400" />
          1. Run Locally (PowerShell)
        </button>

        <button
          onClick={() => setActiveTab('docker')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'docker'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4 text-cyan-400" />
          2. Run Using Docker
        </button>

        <button
          onClick={() => setActiveTab('kubernetes')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'kubernetes'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-400" />
          3. Run on Kubernetes / Minikube
        </button>

        <button
          onClick={() => setActiveTab('troubleshoot')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'troubleshoot'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          4. Troubleshooting &amp; Teardown
        </button>
      </div>

      {/* Tab 1: Local Run */}
      {activeTab === 'local' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 text-xs">
            <span className="font-bold">Step-by-Step Local Execution:</span> Follow these Windows PowerShell commands from inside the <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-semibold">online-shopping-system</code> directory.
          </div>

          <div className="space-y-3">
            {localCommands.map((item, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-xs text-emerald-400 font-bold">
                      {item.cmd.startsWith('http') ? 'Browser URL' : 'PowerShell Command'}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.cmd)}
                    className="inline-flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 transition"
                  >
                    {copiedCmd === item.cmd ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded font-mono text-xs text-white mb-2 border border-slate-800">
                  {item.cmd}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Docker */}
      {activeTab === 'docker' && (
        <div className="space-y-4">
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-cyan-900 text-xs">
            <span className="font-bold">Docker Container Workflow:</span> Ensure Docker Desktop is running before issuing these commands in Windows PowerShell.
          </div>

          <div className="space-y-3">
            {dockerCommands.map((item, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-xs text-cyan-400 font-bold">Docker Command</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.cmd)}
                    className="inline-flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 transition"
                  >
                    {copiedCmd === item.cmd ? (
                      <>
                        <Check className="w-3 h-3 text-cyan-400" />
                        <span className="text-cyan-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded font-mono text-xs text-white mb-2 border border-slate-800">
                  {item.cmd}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Kubernetes / Minikube */}
      {activeTab === 'kubernetes' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-indigo-900 text-xs">
            <span className="font-bold">Exact Order of Kubernetes Execution:</span> Because the image is built locally, loading it via <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono font-semibold">minikube image load</code> is the simplest, most foolproof method.
          </div>

          <div className="space-y-3">
            {k8sCommands.map((item, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-xs text-indigo-400 font-bold">Kubernetes Step</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.cmd)}
                    className="inline-flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 transition"
                  >
                    {copiedCmd === item.cmd ? (
                      <>
                        <Check className="w-3 h-3 text-indigo-400" />
                        <span className="text-indigo-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded font-mono text-xs text-white mb-2 border border-slate-800">
                  {item.cmd}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Troubleshooting & Cleanup */}
      {activeTab === 'troubleshoot' && (
        <div className="space-y-6">
          {/* Troubleshooting Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Kubernetes Troubleshooting Commands
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-900 text-slate-200 p-3 rounded-lg">
                <div className="text-slate-400 mb-1"># 1. View all pod statuses</div>
                <div className="text-emerald-400 font-bold">kubectl get pods</div>
              </div>

              <div className="bg-slate-900 text-slate-200 p-3 rounded-lg">
                <div className="text-slate-400 mb-1"># 2. Inspect events &amp; detailed errors for a pod</div>
                <div className="text-emerald-400 font-bold">kubectl describe pod &lt;pod-name&gt;</div>
              </div>

              <div className="bg-slate-900 text-slate-200 p-3 rounded-lg">
                <div className="text-slate-400 mb-1"># 3. View console logs output by Python Flask inside the container</div>
                <div className="text-emerald-400 font-bold">kubectl logs &lt;pod-name&gt;</div>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="border-l-2 border-amber-500 pl-3">
                <span className="font-bold text-slate-800">If status is "Pending":</span> The cluster is provisioning resources or Minikube is still initializing. Wait a few moments or run <code className="font-mono bg-slate-100 px-1">kubectl describe pod &lt;pod-name&gt;</code> to verify node resource availability.
              </div>
              <div className="border-l-2 border-rose-500 pl-3">
                <span className="font-bold text-slate-800">If status is "ImagePullBackOff" or "ErrImagePull":</span> Kubernetes cannot find the image. Run <code className="font-mono bg-slate-100 px-1">minikube image load online-shopping-system</code> so Minikube loads your local image, and check that <code className="font-mono bg-slate-100 px-1">imagePullPolicy: IfNotPresent</code> is in deployment.yaml.
              </div>
              <div className="border-l-2 border-purple-500 pl-3">
                <span className="font-bold text-slate-800">If status is "CrashLoopBackOff":</span> The application crashed on startup. Run <code className="font-mono bg-slate-100 px-1">kubectl logs &lt;pod-name&gt;</code> to view the Python traceback error.
              </div>
            </div>
          </div>

          {/* Cleanup Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              Stopping and Deleting Kubernetes Resources
            </h3>

            <div className="space-y-3">
              {cleanupCommands.map((item, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-amber-400">{item.cmd}</span>
                    <button
                      onClick={() => copyToClipboard(item.cmd)}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Note */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-900">
            <h4 className="font-bold mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              IMPORTANT ACADEMIC NOTE (SQLite + Kubernetes Persistence)
            </h4>
            <p className="leading-relaxed">
              This is an academic demonstration project designed to teach foundational CRUD and deployment concepts. SQLite stores data in a local file (<code className="font-mono bg-amber-100 px-1">database.db</code>) inside the container. Because no PersistentVolumes or PersistentVolumeClaims are configured, any data created or edited inside the pod will be reset if the pod is deleted or recreated. In production applications, relational database engines like PostgreSQL or external managed databases are used.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
