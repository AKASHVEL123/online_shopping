export interface ProjectFile {
  name: string;
  path: string;
  language: string;
  category: 'backend' | 'frontend' | 'docker' | 'kubernetes' | 'database';
  purpose: string;
  content: string;
}

export const PROJECT_FILES: ProjectFile[] = [
  {
    name: 'app.py',
    path: 'app.py',
    language: 'python',
    category: 'backend',
    purpose: 'Main Flask backend application containing routing, SQLite database initialization, and CRUD endpoints (Home, Add, Edit, Delete).',
    content: `from flask import Flask, render_template, request, redirect, url_for
import sqlite3
import os

app = Flask(__name__)

# Database file name
DATABASE = 'database.db'

def get_db_connection():
    """Create and return a database connection with dictionary-like row access."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the SQLite database and create products table if it doesn't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            description TEXT
        )
    ''')
    
    # Check if table is empty, seed initial sample academic data
    cursor.execute('SELECT COUNT(*) FROM products')
    count = cursor.fetchone()[0]
    if count == 0:
        sample_products = [
            ('Laptop', 'Electronics', 75000.00, 10, 'High-performance laptop for coding and multitasking'),
            ('Mobile Phone', 'Electronics', 45000.00, 25, '5G smartphone with high-resolution camera'),
            ('Headphones', 'Accessories', 3500.00, 50, 'Wireless noise-canceling stereo headphones'),
            ('Keyboard', 'Accessories', 2200.00, 30, 'Mechanical gaming keyboard with backlight'),
            ('Mouse', 'Accessories', 1200.00, 40, 'Ergonomic optical wireless mouse')
        ]
        cursor.executemany('''
            INSERT INTO products (name, category, price, quantity, description)
            VALUES (?, ?, ?, ?, ?)
        ''', sample_products)
        conn.commit()

    conn.close()

# Initialize the database on startup
init_db()

# -------------------------------------------------------------
# 1. READ ALL PRODUCTS (HOME PAGE)
# -------------------------------------------------------------
@app.route('/')
def index():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM products ORDER BY id DESC')
    products = cursor.fetchall()
    conn.close()
    return render_template('index.html', products=products)

# -------------------------------------------------------------
# 2. CREATE PRODUCT (ADD)
# -------------------------------------------------------------
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
            VALUES (?, ?, ?, ?, ?)
        ''', (name, category, price, quantity, description))
        conn.commit()
        conn.close()

        return redirect(url_for('index'))

    return render_template('add.html')

# -------------------------------------------------------------
# 3. UPDATE PRODUCT (EDIT)
# -------------------------------------------------------------
@app.route('/edit/<int:id>', methods=['GET', 'POST'])
def edit(id):
    conn = get_db_connection()
    cursor = conn.cursor()

    if request.method == 'POST':
        name = request.form['name']
        category = request.form['category']
        price = float(request.form['price'])
        quantity = int(request.form['quantity'])
        description = request.form['description']

        cursor.execute('''
            UPDATE products
            SET name = ?, category = ?, price = ?, quantity = ?, description = ?
            WHERE id = ?
        ''', (name, category, price, quantity, description, id))
        conn.commit()
        conn.close()

        return redirect(url_for('index'))

    cursor.execute('SELECT * FROM products WHERE id = ?', (id,))
    product = cursor.fetchone()
    conn.close()

    if product is None:
        return redirect(url_for('index'))

    return render_template('edit.html', product=product)

# -------------------------------------------------------------
# 4. DELETE PRODUCT
# -------------------------------------------------------------
@app.route('/delete/<int:id>')
def delete(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM products WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return redirect(url_for('index'))

if __name__ == '__main__':
    # Run the Flask app on host 0.0.0.0 and port 5000 as requested
    app.run(host="0.0.0.0", port=5000, debug=True)`
  },
  {
    name: 'requirements.txt',
    path: 'requirements.txt',
    language: 'text',
    category: 'backend',
    purpose: 'Specifies the single required Python dependency (Flask) needed to run the application.',
    content: `Flask`
  },
  {
    name: 'index.html',
    path: 'templates/index.html',
    language: 'html',
    category: 'frontend',
    purpose: 'Jinja2 template for the Home page. Renders the product catalog table with columns (ID, Name, Category, Price, Quantity, Description, Actions) and Edit/Delete buttons.',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ONLINE SHOPPING SYSTEM</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <h1>ONLINE SHOPPING SYSTEM</h1>
            <p class="subtitle">Academic CRUD Project · Flask + SQLite</p>
        </header>

        <!-- Action Bar -->
        <div class="action-bar">
            <h2>Product Catalog</h2>
            <a href="{{ url_for('add') }}" class="btn btn-primary">+ Add Product</a>
        </div>

        <!-- Products Table -->
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Price ($)</th>
                        <th>Quantity</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {% if products %}
                        {% for product in products %}
                        <tr>
                            <td>{{ product['id'] }}</td>
                            <td class="font-bold">{{ product['name'] }}</td>
                            <td><span class="category-tag">{{ product['category'] }}</span></td>
                            <td>\${{ "%.2f"|format(product['price']) }}</td>
                            <td>{{ product['quantity'] }}</td>
                            <td class="desc-cell">{{ product['description'] }}</td>
                            <td class="actions">
                                <a href="{{ url_for('edit', id=product['id']) }}" class="btn btn-edit">Edit</a>
                                <a href="{{ url_for('delete', id=product['id']) }}" class="btn btn-delete" onclick="return confirmDelete('{{ product['name'] }}');">Delete</a>
                            </td>
                        </tr>
                        {% endfor %}
                    {% else %}
                        <tr>
                            <td colspan="7" class="text-center">No products found. Click "Add Product" to create one.</td>
                        </tr>
                    {% endif %}
                </tbody>
            </table>
        </div>
    </div>

    <script src="{{ url_for('static', filename='script.js') }}"></script>
</body>
</html>`
  },
  {
    name: 'add.html',
    path: 'templates/add.html',
    language: 'html',
    category: 'frontend',
    purpose: 'Jinja2 template for the Add Product form with validation for Name, Category, Price, Quantity, Description, and Back navigation.',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Product - ONLINE SHOPPING SYSTEM</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
</head>
<body>
    <div class="container form-container">
        <!-- Header -->
        <header class="header">
            <h1>ONLINE SHOPPING SYSTEM</h1>
            <p class="subtitle">Add New Product</p>
        </header>

        <!-- Form Card -->
        <div class="card">
            <h2>Add Product</h2>
            <form action="{{ url_for('add') }}" method="POST" id="productForm">
                <div class="form-group">
                    <label for="name">Product Name *</label>
                    <input type="text" id="name" name="name" placeholder="e.g. Mechanical Keyboard" required>
                </div>

                <div class="form-group">
                    <label for="category">Category *</label>
                    <input type="text" id="category" name="category" placeholder="e.g. Electronics, Accessories" required>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="price">Price ($) *</label>
                        <input type="number" id="price" name="price" step="0.01" min="0" placeholder="e.g. 49.99" required>
                    </div>

                    <div class="form-group">
                        <label for="quantity">Quantity *</label>
                        <input type="number" id="quantity" name="quantity" min="0" placeholder="e.g. 20" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" rows="3" placeholder="Brief details about the product"></textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Add Product</button>
                    <a href="{{ url_for('index') }}" class="btn btn-secondary">Back</a>
                </div>
            </form>
        </div>
    </div>

    <script src="{{ url_for('static', filename='script.js') }}"></script>
</body>
</html>`
  },
  {
    name: 'edit.html',
    path: 'templates/edit.html',
    language: 'html',
    category: 'frontend',
    purpose: 'Jinja2 template for the Edit Product form, pre-filled with the existing product values from SQLite for updating.',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Product - ONLINE SHOPPING SYSTEM</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
</head>
<body>
    <div class="container form-container">
        <!-- Header -->
        <header class="header">
            <h1>ONLINE SHOPPING SYSTEM</h1>
            <p class="subtitle">Edit Existing Product</p>
        </header>

        <!-- Form Card -->
        <div class="card">
            <h2>Edit Product (ID: {{ product['id'] }})</h2>
            <form action="{{ url_for('edit', id=product['id']) }}" method="POST" id="productForm">
                <div class="form-group">
                    <label for="name">Product Name *</label>
                    <input type="text" id="name" name="name" value="{{ product['name'] }}" required>
                </div>

                <div class="form-group">
                    <label for="category">Category *</label>
                    <input type="text" id="category" name="category" value="{{ product['category'] }}" required>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="price">Price ($) *</label>
                        <input type="number" id="price" name="price" step="0.01" min="0" value="{{ product['price'] }}" required>
                    </div>

                    <div class="form-group">
                        <label for="quantity">Quantity *</label>
                        <input type="number" id="quantity" name="quantity" min="0" value="{{ product['quantity'] }}" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" rows="3">{{ product['description'] }}</textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Update Product</button>
                    <a href="{{ url_for('index') }}" class="btn btn-secondary">Back</a>
                </div>
            </form>
        </div>
    </div>

    <script src="{{ url_for('static', filename='script.js') }}"></script>
</body>
</html>`
  },
  {
    name: 'style.css',
    path: 'static/style.css',
    language: 'css',
    category: 'frontend',
    purpose: 'Clean, lightweight, beginner-friendly CSS rules for layout, typography, buttons, tables, forms, and responsive design.',
    content: `/* Basic Reset & Typography */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

body {
    background-color: #ffffff;
    color: #2d3748;
    line-height: 1.6;
    padding: 24px 16px;
}

.container {
    max-width: 1000px;
    margin: 0 auto;
}

.form-container {
    max-width: 650px;
}

/* Header */
.header {
    border-bottom: 2px solid #edf2f7;
    padding-bottom: 16px;
    margin-bottom: 24px;
}

.header h1 {
    font-size: 26px;
    color: #1a202c;
    letter-spacing: -0.5px;
}

.header .subtitle {
    font-size: 14px;
    color: #718096;
    margin-top: 4px;
}

/* Action Bar */
.action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.action-bar h2 {
    font-size: 20px;
    color: #2d3748;
}

/* Card for Forms */
.card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card h2 {
    font-size: 20px;
    margin-bottom: 20px;
    color: #2d3748;
    border-bottom: 1px solid #edf2f7;
    padding-bottom: 8px;
}

/* Form Styles */
.form-group {
    margin-bottom: 16px;
}

.form-row {
    display: flex;
    gap: 16px;
}

.form-row .form-group {
    flex: 1;
}

label {
    display: block;
    margin-bottom: 6px;
    font-weight: 600;
    font-size: 14px;
    color: #4a5568;
}

input[type="text"],
input[type="number"],
textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #cbd5e0;
    border-radius: 6px;
    font-size: 15px;
    color: #2d3748;
    background-color: #ffffff;
    transition: border-color 0.2s ease;
}

input[type="text"]:focus,
input[type="number"]:focus,
textarea:focus {
    outline: none;
    border-color: #3182ce;
}

textarea {
    resize: vertical;
}

.form-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
}

/* Buttons */
.btn {
    display: inline-block;
    padding: 9px 18px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    text-align: center;
    transition: background-color 0.2s ease;
}

.btn-primary {
    background-color: #2b6cb0;
    color: #ffffff;
}

.btn-primary:hover {
    background-color: #2c5282;
}

.btn-secondary {
    background-color: #edf2f7;
    color: #4a5568;
    border: 1px solid #cbd5e0;
}

.btn-secondary:hover {
    background-color: #e2e8f0;
}

.btn-edit {
    background-color: #d69e2e;
    color: #ffffff;
    padding: 6px 12px;
    font-size: 13px;
}

.btn-edit:hover {
    background-color: #b7791f;
}

.btn-delete {
    background-color: #e53e3e;
    color: #ffffff;
    padding: 6px 12px;
    font-size: 13px;
}

.btn-delete:hover {
    background-color: #c53030;
}

/* Table Styles */
.table-container {
    overflow-x: auto;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
}

table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
}

thead th {
    background-color: #f7fafc;
    color: #4a5568;
    font-weight: 600;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 12px 16px;
    border-bottom: 2px solid #e2e8f0;
}

tbody td {
    padding: 12px 16px;
    border-bottom: 1px solid #edf2f7;
    font-size: 14px;
    vertical-align: middle;
}

tbody tr:hover {
    background-color: #f8fafc;
}

.font-bold {
    font-weight: 600;
}

.category-tag {
    color: #4a5568;
    font-size: 13px;
}

.desc-cell {
    max-width: 250px;
    color: #718096;
}

.actions {
    white-space: nowrap;
    display: flex;
    gap: 8px;
}

.text-center {
    text-align: center;
    color: #a0aec0;
    padding: 32px 16px;
}

/* Responsive */
@media (max-width: 640px) {
    .form-row {
        flex-direction: column;
        gap: 0;
    }

    .action-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
}`
  },
  {
    name: 'script.js',
    path: 'static/script.js',
    language: 'javascript',
    category: 'frontend',
    purpose: 'Simple Vanilla JavaScript handling the delete confirmation dialog and client-side form input validation.',
    content: `// static/script.js
// Simple Vanilla JavaScript for Online Shopping System

/**
 * Confirm before deleting a product
 * @param {string} productName - The name of the product to delete
 * @returns {boolean} - true if user confirms, false otherwise
 */
function confirmDelete(productName) {
    var message = "Are you sure you want to delete this product?";
    if (productName) {
        message = 'Are you sure you want to delete "' + productName + '"?';
    }
    return window.confirm(message);
}

// Client-side validation helper when form is submitted
document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("productForm");
    if (form) {
        form.addEventListener("submit", function (event) {
            var nameInput = document.getElementById("name");
            var priceInput = document.getElementById("price");
            var quantityInput = document.getElementById("quantity");

            if (nameInput && nameInput.value.trim() === "") {
                alert("Please enter a valid product name.");
                nameInput.focus();
                event.preventDefault();
                return false;
            }

            if (priceInput && parseFloat(priceInput.value) < 0) {
                alert("Price cannot be negative.");
                priceInput.focus();
                event.preventDefault();
                return false;
            }

            if (quantityInput && parseInt(quantityInput.value, 10) < 0) {
                alert("Quantity cannot be negative.");
                quantityInput.focus();
                event.preventDefault();
                return false;
            }
        });
    }
});`
  },
  {
    name: 'Dockerfile',
    path: 'Dockerfile',
    language: 'dockerfile',
    category: 'docker',
    purpose: 'Docker build file defining containerization steps with python:3.10-slim, copying requirements, installing Flask, and running app.py on port 5000.',
    content: `# Use official lightweight Python image
FROM python:3.10-slim

# Set working directory inside the container
WORKDIR /app

# Copy requirements file first for layer caching
COPY requirements.txt .

# Install Flask without caching to keep the image small
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files into the container
COPY . .

# Expose port 5000 where Flask is running
EXPOSE 5000

# Run the Flask application
CMD ["python", "app.py"]`
  },
  {
    name: '.dockerignore',
    path: '.dockerignore',
    language: 'text',
    category: 'docker',
    purpose: 'Excludes unnecessary virtual environments, pycache, and git artifacts from the Docker build context to optimize image build time and size.',
    content: `venv
__pycache__
*.pyc
.git`
  },
  {
    name: 'deployment.yaml',
    path: 'deployment.yaml',
    language: 'yaml',
    category: 'kubernetes',
    purpose: 'Kubernetes Deployment manifest configuring a single replica of the containerized Flask application running on port 5000.',
    content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: online-shopping-deployment
  labels:
    app: online-shopping
spec:
  replicas: 1
  selector:
    matchLabels:
      app: online-shopping
  template:
    metadata:
      labels:
        app: online-shopping
    spec:
      containers:
      - name: online-shopping-container
        image: online-shopping-system
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 5000`
  },
  {
    name: 'service.yaml',
    path: 'service.yaml',
    language: 'yaml',
    category: 'kubernetes',
    purpose: 'Kubernetes NodePort Service manifest exposing the Flask container port 5000 externally to allow browser access.',
    content: `apiVersion: v1
kind: Service
metadata:
  name: online-shopping-service
  labels:
    app: online-shopping
spec:
  type: NodePort
  selector:
    app: online-shopping
  ports:
  - port: 5000
    targetPort: 5000
    protocol: TCP`
  }
];
