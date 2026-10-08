import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  RotateCcw,
  Database,
  Terminal,
  Server,
  Globe,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export interface ProductItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description: string;
}

interface SqlLog {
  id: string;
  timestamp: string;
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'SCHEMA';
  query: string;
  params?: any[];
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 1,
    name: 'Laptop',
    category: 'Electronics',
    price: 75000.0,
    quantity: 10,
    description: 'High-performance laptop for coding and multitasking'
  },
  {
    id: 2,
    name: 'Mobile Phone',
    category: 'Electronics',
    price: 45000.0,
    quantity: 25,
    description: '5G smartphone with high-resolution camera'
  },
  {
    id: 3,
    name: 'Headphones',
    category: 'Accessories',
    price: 3500.0,
    quantity: 50,
    description: 'Wireless noise-canceling stereo headphones'
  },
  {
    id: 4,
    name: 'Keyboard',
    category: 'Accessories',
    price: 2200.0,
    quantity: 30,
    description: 'Mechanical gaming keyboard with backlight'
  },
  {
    id: 5,
    name: 'Mouse',
    category: 'Accessories',
    price: 1200.0,
    quantity: 40,
    description: 'Ergonomic optical wireless mouse'
  }
];

export const LiveAppSimulator: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [currentView, setCurrentView] = useState<'home' | 'add' | 'edit'>('home');
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'db' | 'logs'>('preview');

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // SQL Execution Logs
  const [sqlLogs, setSqlLogs] = useState<SqlLog[]>([
    {
      id: 'log-0',
      timestamp: new Date().toLocaleTimeString(),
      type: 'SCHEMA',
      query: `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    description TEXT
);`
    },
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'SELECT',
      query: 'SELECT * FROM products ORDER BY id DESC;'
    }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addSqlLog = (type: SqlLog['type'], query: string, params?: any[]) => {
    const newLog: SqlLog = {
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      query,
      params
    };
    setSqlLogs(prev => [newLog, ...prev.slice(0, 19)]);
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormCategory('');
    setFormPrice('');
    setFormQuantity('');
    setFormDescription('');
    setCurrentView('add');
  };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price.toString());
    setFormQuantity(p.quantity.toString());
    setFormDescription(p.description);
    setCurrentView('edit');
    addSqlLog('SELECT', `SELECT * FROM products WHERE id = ${p.id};`);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategory.trim() || !formPrice || !formQuantity) {
      alert('Please fill out all required fields.');
      return;
    }

    const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProd: ProductItem = {
      id: nextId,
      name: formName.trim(),
      category: formCategory.trim(),
      price: parseFloat(formPrice),
      quantity: parseInt(formQuantity, 10),
      description: formDescription.trim()
    };

    setProducts([newProd, ...products]);
    addSqlLog(
      'INSERT',
      `INSERT INTO products (name, category, price, quantity, description) VALUES (?, ?, ?, ?, ?);`,
      [newProd.name, newProd.category, newProd.price, newProd.quantity, newProd.description]
    );

    setCurrentView('home');
    showToast(`Product "${newProd.name}" successfully added!`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updatedProd: ProductItem = {
      ...editingProduct,
      name: formName.trim(),
      category: formCategory.trim(),
      price: parseFloat(formPrice),
      quantity: parseInt(formQuantity, 10),
      description: formDescription.trim()
    };

    setProducts(products.map(p => (p.id === updatedProd.id ? updatedProd : p)));
    addSqlLog(
      'UPDATE',
      `UPDATE products SET name = ?, category = ?, price = ?, quantity = ?, description = ? WHERE id = ?;`,
      [updatedProd.name, updatedProd.category, updatedProd.price, updatedProd.quantity, updatedProd.description, updatedProd.id]
    );

    setCurrentView('home');
    setEditingProduct(null);
    showToast(`Product #${updatedProd.id} successfully updated!`);
  };

  const handleDelete = (p: ProductItem) => {
    // Exact Javascript confirmation requested
    const confirmed = window.confirm(`Are you sure you want to delete "${p.name}"?`);
    if (confirmed) {
      setProducts(products.filter(item => item.id !== p.id));
      addSqlLog('DELETE', `DELETE FROM products WHERE id = ${p.id};`);
      showToast(`Product "${p.name}" deleted from database.`);
    }
  };

  const handleResetDb = () => {
    if (window.confirm('Reset SQLite database to the 5 initial sample products?')) {
      setProducts(INITIAL_PRODUCTS);
      addSqlLog('INSERT', `INSERT INTO products (name, category, price, quantity, description) VALUES (5 initial products);`);
      showToast('Database reset to initial sample products.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Simulation Control Bar */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-semibold border border-slate-700">
                0.0.0.0:5000
              </span>
              <span className="text-sm font-medium text-slate-200">
                Live Interactive Flask &amp; SQLite Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Current Route:{' '}
              <span className="font-mono text-cyan-300">
                {currentView === 'home' && 'GET /'}
                {currentView === 'add' && 'GET /add  (Form Submit: POST /add)'}
                {currentView === 'edit' && `GET /edit/${editingProduct?.id}  (Form Submit: POST /edit/${editingProduct?.id})`}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-lg flex border border-slate-700">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Flask Web UI
            </button>
            <button
              onClick={() => setActiveTab('db')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition ${
                activeTab === 'db'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              SQLite DB ({products.length} records)
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              SQL Log ({sqlLogs.length})
            </button>
          </div>

          <button
            onClick={handleResetDb}
            title="Reset database to default products"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset DB
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm px-4 py-2.5 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      {activeTab === 'preview' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
          {/* Browser-style address bar */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-3 text-xs text-slate-600 font-mono">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            </div>
            <div className="flex-1 bg-white border border-slate-300 rounded px-3 py-1 flex items-center gap-2 text-slate-700">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>
                http://localhost:5000
                {currentView === 'home' && '/'}
                {currentView === 'add' && '/add'}
                {currentView === 'edit' && `/edit/${editingProduct?.id}`}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">Flask Jinja2 Preview</span>
          </div>

          {/* Actual Rendered HTML as per requirements */}
          <div className="p-6 md:p-8 min-h-[500px]">
            {/* VIEW 1: HOME CATALOG (index.html) */}
            {currentView === 'home' && (
              <div className="max-w-4xl mx-auto">
                <header className="border-b-2 border-slate-100 pb-4 mb-6">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    ONLINE SHOPPING SYSTEM
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Academic CRUD Project · Flask + SQLite
                  </p>
                </header>

                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-semibold text-slate-800">
                    Product Catalog
                  </h2>
                  <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-1.5 bg-[#2b6cb0] hover:bg-[#2c5282] text-white font-semibold text-sm px-4 py-2 rounded-md shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" />
                    + Add Product
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b-2 border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price ($)</th>
                        <th className="py-3 px-4">Quantity</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {products.length > 0 ? (
                        products.map(product => (
                          <tr key={product.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-4 text-slate-500 font-mono text-xs">{product.id}</td>
                            <td className="py-3 px-4 font-semibold text-slate-900">{product.name}</td>
                            <td className="py-3 px-4 text-slate-600">{product.category}</td>
                            <td className="py-3 px-4 font-medium text-slate-900">
                              ${product.price.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-slate-700">{product.quantity}</td>
                            <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={product.description}>
                              {product.description || '—'}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleOpenEdit(product)}
                                  className="bg-[#d69e2e] hover:bg-[#b7791f] text-white text-xs font-semibold px-3 py-1.5 rounded transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(product)}
                                  className="bg-[#e53e3e] hover:bg-[#c53030] text-white text-xs font-semibold px-3 py-1.5 rounded transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No products found. Click "+ Add Product" to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>Displaying {products.length} products stored in SQLite database.</span>
                  <span className="font-mono">SQL: SELECT * FROM products ORDER BY id DESC;</span>
                </div>
              </div>
            )}

            {/* VIEW 2: ADD PRODUCT (add.html) */}
            {currentView === 'add' && (
              <div className="max-w-xl mx-auto">
                <header className="border-b-2 border-slate-100 pb-4 mb-6">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    ONLINE SHOPPING SYSTEM
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">Add New Product</p>
                </header>

                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
                  <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-5">
                    Add Product
                  </h2>

                  <form onSubmit={handleAddSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        placeholder="e.g. Mechanical Keyboard"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category *
                      </label>
                      <input
                        type="text"
                        required
                        value={formCategory}
                        onChange={e => setFormCategory(e.target.value)}
                        placeholder="e.g. Electronics, Accessories"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Price ($) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={formPrice}
                          onChange={e => setFormPrice(e.target.value)}
                          placeholder="e.g. 49.99"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={formQuantity}
                          onChange={e => setFormQuantity(e.target.value)}
                          placeholder="e.g. 20"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={formDescription}
                        onChange={e => setFormDescription(e.target.value)}
                        placeholder="Brief details about the product"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="bg-[#2b6cb0] hover:bg-[#2c5282] text-white font-semibold text-sm px-5 py-2 rounded-md transition"
                      >
                        Add Product
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentView('home')}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-sm px-5 py-2 rounded-md transition"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* VIEW 3: EDIT PRODUCT (edit.html) */}
            {currentView === 'edit' && editingProduct && (
              <div className="max-w-xl mx-auto">
                <header className="border-b-2 border-slate-100 pb-4 mb-6">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    ONLINE SHOPPING SYSTEM
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">Edit Existing Product</p>
                </header>

                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
                  <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-5">
                    Edit Product (ID: {editingProduct.id})
                  </h2>

                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category *
                      </label>
                      <input
                        type="text"
                        required
                        value={formCategory}
                        onChange={e => setFormCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Price ($) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={formPrice}
                          onChange={e => setFormPrice(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={formQuantity}
                          onChange={e => setFormQuantity(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={formDescription}
                        onChange={e => setFormDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="bg-[#2b6cb0] hover:bg-[#2c5282] text-white font-semibold text-sm px-5 py-2 rounded-md transition"
                      >
                        Update Product
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('home');
                          setEditingProduct(null);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-sm px-5 py-2 rounded-md transition"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Database Inspector Tab */}
      {activeTab === 'db' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-lg text-white">
                SQLite Database Inspector (<span className="text-cyan-400 font-mono">database.db</span>)
              </h3>
            </div>
            <span className="text-xs font-mono bg-slate-800 px-3 py-1 rounded border border-slate-700 text-slate-300">
              Table: products ({products.length} rows)
            </span>
          </div>

          <div className="mb-4 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">Schema: </span>
            <span>
              CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL, quantity INTEGER NOT NULL, description TEXT);
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-800 text-slate-300 uppercase">
                <tr>
                  <th className="p-3">id (PK)</th>
                  <th className="p-3">name</th>
                  <th className="p-3">category</th>
                  <th className="p-3">price</th>
                  <th className="p-3">quantity</th>
                  <th className="p-3">description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/50">
                    <td className="p-3 text-cyan-400 font-bold">{p.id}</td>
                    <td className="p-3 text-white">{p.name}</td>
                    <td className="p-3 text-slate-400">{p.category}</td>
                    <td className="p-3 text-emerald-400">{p.price}</td>
                    <td className="p-3 text-amber-300">{p.quantity}</td>
                    <td className="p-3 text-slate-400 max-w-xs truncate">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SQL Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-lg text-white">
                Live SQLite Query Execution Log
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Real-time queries executed by Python Flask Backend
            </span>
          </div>

          <div className="space-y-2">
            {sqlLogs.map(log => (
              <div
                key={log.id}
                className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-xs flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      log.type === 'SELECT'
                        ? 'bg-blue-900/60 text-blue-300'
                        : log.type === 'INSERT'
                        ? 'bg-emerald-900/60 text-emerald-300'
                        : log.type === 'UPDATE'
                        ? 'bg-amber-900/60 text-amber-300'
                        : log.type === 'DELETE'
                        ? 'bg-rose-900/60 text-rose-300'
                        : 'bg-purple-900/60 text-purple-300'
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="text-slate-500 text-[11px]">{log.timestamp}</span>
                </div>
                <div className="text-slate-300 break-all">{log.query}</div>
                {log.params && (
                  <div className="text-slate-500 text-[11px]">
                    Parameters: {JSON.stringify(log.params)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
