import React from 'react';
import {
  User,
  Layout,
  Server,
  Database,
  Box,
  Layers,
  Globe,
  ArrowDown,
  CheckCircle2,
  FileCheck,
  Check
} from 'lucide-react';

export const ArchitectureWorkflow: React.FC = () => {
  const pipelineSteps = [
    {
      title: '1. User',
      desc: 'Interacts with the web browser, fills product forms, clicks buttons, and confirms actions.',
      icon: User,
      tech: 'Browser Client',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200'
    },
    {
      title: '2. HTML / CSS / JavaScript',
      desc: 'Frontend layer rendered with Jinja2 templates (index.html, add.html, edit.html), styled via style.css, and verified with script.js.',
      icon: Layout,
      tech: 'HTML5 + CSS3 + Vanilla JS',
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
    },
    {
      title: '3. Python Flask Backend',
      desc: 'Lightweight web framework running on port 5000 that handles HTTP routing, parses form requests, and manages responses.',
      icon: Server,
      tech: 'Python 3.10 + Flask',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200'
    },
    {
      title: '4. SQLite Database',
      desc: 'Embedded zero-configuration database (database.db) that stores products table with automatic creation on startup via python sqlite3.',
      icon: Database,
      tech: 'SQLite (sqlite3)',
      color: 'bg-amber-500/10 text-amber-600 border-amber-200'
    },
    {
      title: '5. Docker Container',
      desc: 'Packages the Flask application, dependencies (requirements.txt), and database into an isolated container image.',
      icon: Box,
      tech: 'Docker (Dockerfile)',
      color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200'
    },
    {
      title: '6. Kubernetes Deployment',
      desc: 'Manages the container lifecycle, ensuring 1 replica pod of the Flask app is running and healthy.',
      icon: Layers,
      tech: 'Kubernetes (deployment.yaml)',
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200'
    },
    {
      title: '7. Kubernetes Service',
      desc: 'Exposes container port 5000 using a NodePort to allow external traffic to reach the pod.',
      icon: Globe,
      tech: 'Kubernetes (service.yaml)',
      color: 'bg-pink-500/10 text-pink-600 border-pink-200'
    },
    {
      title: '8. Running Application',
      desc: 'Accessible via Minikube tunnel or host browser at http://localhost:5000 for seamless user operation.',
      icon: CheckCircle2,
      tech: 'Live Production URL',
      color: 'bg-green-500/10 text-green-600 border-green-200'
    }
  ];

  const crudTests = [
    {
      op: 'CREATE',
      badge: 'POST /add',
      title: 'Add a New Product',
      steps: [
        '1. Click the "+ Add Product" button on the home page.',
        '2. Fill in Product Name (e.g., "Gaming Monitor"), Category ("Electronics"), Price ("249.99"), Quantity ("15"), Description ("144Hz curved display").',
        '3. Click the "Add Product" button.'
      ],
      expected: 'The user is redirected to the home page (GET /), and the new product appears as the top row in the table, saved in SQLite database.db.'
    },
    {
      op: 'READ',
      badge: 'GET /',
      title: 'View All Available Products',
      steps: [
        '1. Open the homepage at http://localhost:5000.',
        '2. Observe the product catalog table.'
      ],
      expected: 'All products stored in database.db are retrieved via SQL query ("SELECT * FROM products ORDER BY id DESC") and displayed with ID, Name, Category, Price, Quantity, Description, and Actions.'
    },
    {
      op: 'UPDATE',
      badge: 'POST /edit/<id>',
      title: 'Edit an Existing Product',
      steps: [
        '1. Click the "Edit" button next to any product (e.g., Laptop).',
        '2. Modify the price from 75000.00 to 72000.00 and quantity from 10 to 12.',
        '3. Click "Update Product".'
      ],
      expected: 'The Flask backend runs "UPDATE products SET ... WHERE id = ?", redirects to the home page, and the table reflects the updated price and quantity immediately.'
    },
    {
      op: 'DELETE',
      badge: 'GET /delete/<id>',
      title: 'Delete a Product with Confirmation',
      steps: [
        '1. Click the "Delete" button next to a product (e.g., Mouse).',
        '2. Notice the browser confirmation popup: "Are you sure you want to delete this product?".',
        '3. Click "OK" in the popup dialog.'
      ],
      expected: 'Flask executes "DELETE FROM products WHERE id = ?", redirects to "/", and the product is permanently removed from the table and database.'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Visual Workflow Pipeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            System Architecture &amp; Execution Pipeline
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end data and execution flow demonstrating how HTML/CSS/JS, Python Flask, SQLite, Docker, and Kubernetes connect together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between ${step.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs uppercase tracking-wider">{step.title}</span>
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="text-[11px] font-mono font-semibold mb-2 bg-white/70 px-2 py-0.5 rounded inline-block">
                    {step.tech}
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CRUD Testing Verification Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            Complete CRUD Testing Procedure
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Follow this academic test matrix to verify each of the 4 CRUD operations locally or inside the Docker/Kubernetes container.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crudTests.map((test, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-900 text-white font-mono text-xs px-2 py-0.5 rounded font-bold">
                      {test.op}
                    </span>
                    <h4 className="font-bold text-sm text-slate-800">{test.title}</h4>
                  </div>
                  <span className="font-mono text-[11px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-semibold">
                    {test.badge}
                  </span>
                </div>

                <div className="space-y-1.5 mb-4 text-xs text-slate-600">
                  <p className="font-semibold text-slate-700">Test Procedure:</p>
                  {test.steps.map((step, sIdx) => (
                    <p key={sIdx} className="pl-2">{step}</p>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900">
                <span className="font-bold flex items-center gap-1 text-emerald-800 mb-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Expected Result:
                </span>
                <p>{test.expected}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
