import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Database,
  Search,
  RotateCcw,
  CheckCircle2,
  Download,
  Code2,
  X,
  Server,
  Layers,
  FileText,
  Copy,
  Check,
  ChevronDown
} from 'lucide-react';
import JSZip from 'jszip';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description: string;
}

interface SqlQueryLog {
  id: string;
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'SCHEMA';
  query: string;
  timestamp: string;
}

const DEFAULT_PRODUCTS: Product[] = [
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

export default function App() {
  // Load products from localStorage or default
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('shopping_products_mysql');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_PRODUCTS;
      }
    }
    return DEFAULT_PRODUCTS;
  });

  // Save changes
  useEffect(() => {
    localStorage.setItem('shopping_products_mysql', JSON.stringify(products));
  }, [products]);

  // View state: 'list' | 'add' | 'edit'
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals / Drawers for MySQL Inspector & Code Viewer
  const [showDbModal, setShowDbModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [activeCodeFile, setActiveCodeFile] = useState<'app.py' | 'schema.sql' | 'requirements.txt' | 'Dockerfile'>('app.py');
  const [copiedCode, setCopiedCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // MySQL Query Execution Log
  const [sqlLogs, setSqlLogs] = useState<SqlQueryLog[]>([
    {
      id: 'init-1',
      type: 'SCHEMA',
      query: 'CREATE DATABASE IF NOT EXISTS online_shopping_db;',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: 'init-2',
      type: 'SCHEMA',
      query: `CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    description TEXT
);`,
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: 'init-3',
      type: 'SELECT',
      query: 'SELECT * FROM products ORDER BY id DESC;',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const logSql = (type: SqlQueryLog['type'], query: string) => {
    const newLog: SqlQueryLog = {
      id: Math.random().toString(),
      type,
      query,
      timestamp: new Date().toLocaleTimeString()
    };
    setSqlLogs(prev => [newLog, ...prev.slice(0, 19)]);
  };

  // Open Add Form
  const handleOpenAdd = () => {
    setFormName('');
    setFormCategory('');
    setFormPrice('');
    setFormQuantity('');
    setFormDescription('');
    setCurrentView('add');
  };

  // Open Edit Form
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price.toString());
    setFormQuantity(p.quantity.toString());
    setFormDescription(p.description);
    setCurrentView('edit');
    logSql('SELECT', `SELECT * FROM products WHERE id = ${p.id};`);
  };

  // Handle Add Submit (CREATE)
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategory.trim() || !formPrice || !formQuantity) {
      alert('Please fill out all required fields.');
      return;
    }

    const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = {
      id: nextId,
      name: formName.trim(),
      category: formCategory.trim(),
      price: parseFloat(formPrice),
      quantity: parseInt(formQuantity, 10),
      description: formDescription.trim()
    };

    setProducts([newProduct, ...products]);
    logSql(
      'INSERT',
      `INSERT INTO products (name, category, price, quantity, description) VALUES ('${newProduct.name}', '${newProduct.category}', ${newProduct.price}, ${newProduct.quantity}, '${newProduct.description.replace(/'/g, "''")}');`
    );

    setCurrentView('list');
    showNotification(`Product "${newProduct.name}" added successfully.`);
  };

  // Handle Edit Submit (UPDATE)
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updated: Product = {
      ...editingProduct,
      name: formName.trim(),
      category: formCategory.trim(),
      price: parseFloat(formPrice),
      quantity: parseInt(formQuantity, 10),
      description: formDescription.trim()
    };

    setProducts(products.map(p => (p.id === updated.id ? updated : p)));
    logSql(
      'UPDATE',
      `UPDATE products SET name = '${updated.name}', category = '${updated.category}', price = ${updated.price}, quantity = ${updated.quantity}, description = '${updated.description.replace(/'/g, "''")}' WHERE id = ${updated.id};`
    );

    setCurrentView('list');
    setEditingProduct(null);
    showNotification(`Product #${updated.id} updated successfully.`);
  };

  // Handle Delete (DELETE)
  const handleDelete = (p: Product) => {
    const confirmed = window.confirm(`Are you sure you want to delete this product?`);
    if (confirmed) {
      setProducts(products.filter(item => item.id !== p.id));
      logSql('DELETE', `DELETE FROM products WHERE id = ${p.id};`);
      showNotification(`Product "${p.name}" deleted from database.`);
    }
  };

  // Reset to default
  const handleResetData = () => {
    if (window.confirm('Reset database to default sample products?')) {
      setProducts(DEFAULT_PRODUCTS);
      logSql('INSERT', 'INSERT INTO products (5 default sample records);');
      showNotification('Products reset to default.');
    }
  };

  // Categories list
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Download project files as ZIP
  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const folder = zip.folder('online-shopping-system');
    if (folder) {
      folder.file('app.py', pythonFlaskCode);
      folder.file('requirements.txt', requirementsCode);
      folder.file('schema.sql', mysqlSchemaCode);
      folder.file('Dockerfile', dockerfileCode);
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'online-shopping-system-mysql.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const pythonFlaskCode = `from flask import Flask, render_template, request, redirect, url_for
import mysql.connector
from mysql.connector import Error
import os

app = Flask(__name__)

# MySQL Database Configuration
MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'rootpassword')
MYSQL_DB = os.environ.get('MYSQL_DATABASE', 'online_shopping_db')
MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))

def get_db_connection():
    """Returns a connection to MySQL database."""
    return mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
        port=MYSQL_PORT
    )

def init_db():
    """Initializes MySQL database and products table."""
    conn = mysql.connector.connect(
        host=MYSQL_HOST, user=MYSQL_USER, password=MYSQL_PASSWORD, port=MYSQL_PORT
    )
    cursor = conn.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DB}")
    cursor.close()
    conn.close()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            quantity INT NOT NULL,
            description TEXT
        )
    ''')
    conn.commit()
    cursor.close()
    conn.close()

init_db()

@app.route('/')
def index():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM products ORDER BY id DESC')
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    return render_template('index.html', products=products)

@app.route('/add', methods=['GET', 'POST'])
def add():
    if request.method == 'POST':
        name = request.form['name']
        category = request.form['category']
        price = float(request.form['price'])
        quantity = int(request.form['quantity'])
        description = request.form['description']

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO products (name, category, price, quantity, description)
            VALUES (%s, %s, %s, %s, %s)
        ''', (name, category, price, quantity, description))
        conn.commit()
        cursor.close()
        conn.close()
        return redirect(url_for('index'))
    return render_template('add.html')

@app.route('/edit/<int:id>', methods=['GET', 'POST'])
def edit(id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    if request.method == 'POST':
        name = request.form['name']
        category = request.form['category']
        price = float(request.form['price'])
        quantity = int(request.form['quantity'])
        description = request.form['description']
        cursor.execute('''
            UPDATE products
            SET name = %s, category = %s, price = %s, quantity = %s, description = %s
            WHERE id = %s
        ''', (name, category, price, quantity, description, id))
        conn.commit()
        cursor.close()
        conn.close()
        return redirect(url_for('index'))

    cursor.execute('SELECT * FROM products WHERE id = %s', (id,))
    product = cursor.fetchone()
    cursor.close()
    conn.close()
    return render_template('edit.html', product=product)

@app.route('/delete/<int:id>')
def delete(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM products WHERE id = %s', (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)`;

  const mysqlSchemaCode = `-- MySQL Database Schema
CREATE DATABASE IF NOT EXISTS online_shopping_db;
USE online_shopping_db;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    description TEXT
);

INSERT INTO products (name, category, price, quantity, description) VALUES
('Laptop', 'Electronics', 75000.00, 10, 'High-performance laptop for coding and multitasking'),
('Mobile Phone', 'Electronics', 45000.00, 25, '5G smartphone with high-resolution camera'),
('Headphones', 'Accessories', 3500.00, 50, 'Wireless noise-canceling stereo headphones'),
('Keyboard', 'Accessories', 2200.00, 30, 'Mechanical gaming keyboard with backlight'),
('Mouse', 'Accessories', 1200.00, 40, 'Ergonomic optical wireless mouse');`;

  const requirementsCode = `Flask
mysql-connector-python`;

  const dockerfileCode = `FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
              ONLINE SHOPPING SYSTEM
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                MySQL Database: Connected (<code className="font-mono text-[11px]">online_shopping_db</code>)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDbModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
              title="View MySQL Table Schema and Executed Queries"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>MySQL Inspector</span>
            </button>

            <button
              onClick={() => setShowCodeModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
              title="View & Download Python Flask + MySQL Source Files"
            >
              <Code2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Backend Code</span>
            </button>

            {currentView === 'list' && (
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* VIEW 1: PRODUCT LIST (HOME) */}
        {currentView === 'list' && (
          <div className="space-y-5">
            {/* Action & Filter Toolbar */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name, category, details..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>
                      Category: {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
                <span>
                  Showing <strong className="text-slate-800">{filteredProducts.length}</strong> of{' '}
                  <strong className="text-slate-800">{products.length}</strong> products
                </span>
                <button
                  onClick={handleResetData}
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
                  title="Reset to default products"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price ($)</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(product => (
                        <tr key={product.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-mono text-slate-500 text-xs font-semibold">
                            {product.id}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{product.name}</td>
                          <td className="py-3 px-4">
                            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {product.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-medium ${
                                product.quantity < 15 ? 'text-amber-600' : 'text-slate-700'
                              }`}
                            >
                              {product.quantity}
                            </span>
                          </td>
                          <td
                            className="py-3 px-4 text-slate-500 max-w-xs truncate text-xs"
                            title={product.description}
                          >
                            {product.description || '—'}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handleOpenEdit(product)}
                                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-2.5 py-1 rounded transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product)}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-2.5 py-1 rounded transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                          No products found. Click "+ Add Product" to insert a new product into MySQL.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <span>MySQL Table: <code className="font-mono text-slate-700">products</code> (Engine: InnoDB)</span>
                <span className="font-mono text-[11px] text-slate-500">
                  SQL: SELECT * FROM products ORDER BY id DESC;
                </span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ADD PRODUCT */}
        {currentView === 'add' && (
          <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
            <div className="border-b border-slate-200 pb-3 mb-5">
              <h2 className="text-lg font-bold text-slate-900">Add New Product</h2>
              <p className="text-xs text-slate-500">
                Inserts a new product record into the MySQL database.
              </p>
            </div>

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
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
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
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
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
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
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
                    placeholder="e.g. 25"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
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
                  placeholder="Details and specifications..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2 rounded-md shadow-xs transition"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('list')}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-xs px-5 py-2 rounded-md transition"
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 3: EDIT PRODUCT */}
        {currentView === 'edit' && editingProduct && (
          <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
            <div className="border-b border-slate-200 pb-3 mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Edit Product (ID: {editingProduct.id})
              </h2>
              <p className="text-xs text-slate-500">
                Updates record in MySQL table <code className="font-mono">products</code>.
              </p>
            </div>

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
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
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
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
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
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
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
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
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
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2 rounded-md shadow-xs transition"
                >
                  Update Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('list');
                    setEditingProduct(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-xs px-5 py-2 rounded-md transition"
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MySQL Inspector Modal */}
      {showDbModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col text-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">
                  MySQL Database Details &amp; Executed Queries
                </h3>
              </div>
              <button
                onClick={() => setShowDbModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Database &amp; Table Schema
                </h4>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
{`CREATE DATABASE IF NOT EXISTS online_shopping_db;
USE online_shopping_db;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    description TEXT
);`}
                </pre>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Recent Executed MySQL Queries
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sqlLogs.map(log => (
                    <div
                      key={log.id}
                      className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-xs flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-emerald-400">{log.type}</span>
                        <span className="text-slate-500">{log.timestamp}</span>
                      </div>
                      <div className="text-slate-300">{log.query}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 text-right">
              <button
                onClick={() => setShowDbModal(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code & Files Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col text-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-sm">
                  Python Flask + MySQL Source Files
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadZip}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download ZIP
                </button>
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* File Switcher */}
            <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex gap-2">
              {(['app.py', 'schema.sql', 'requirements.txt', 'Dockerfile'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveCodeFile(f)}
                  className={`px-3 py-1 text-xs font-mono rounded transition ${
                    activeCodeFile === f
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Code Body */}
            <div className="p-4 overflow-y-auto flex-1 bg-slate-900">
              <pre className="font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
                <code>
                  {activeCodeFile === 'app.py' && pythonFlaskCode}
                  {activeCodeFile === 'schema.sql' && mysqlSchemaCode}
                  {activeCodeFile === 'requirements.txt' && requirementsCode}
                  {activeCodeFile === 'Dockerfile' && dockerfileCode}
                </code>
              </pre>
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-mono">{activeCodeFile}</span>
              <button
                onClick={() => {
                  const content =
                    activeCodeFile === 'app.py'
                      ? pythonFlaskCode
                      : activeCodeFile === 'schema.sql'
                      ? mysqlSchemaCode
                      : activeCodeFile === 'requirements.txt'
                      ? requirementsCode
                      : dockerfileCode;
                  navigator.clipboard.writeText(content);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium flex items-center gap-1.5 transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
