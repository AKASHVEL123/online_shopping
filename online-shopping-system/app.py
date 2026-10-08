from flask import Flask, render_template, request, redirect, url_for
import mysql.connector
from mysql.connector import Error
import os

app = Flask(__name__)

# MySQL Database Configuration (overridable via Environment Variables)
MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'rootpassword')
MYSQL_DB = os.environ.get('MYSQL_DATABASE', 'online_shopping_db')
MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))

def get_db_connection():
    """Create and return a connection to the MySQL database."""
    return mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
        port=MYSQL_PORT
    )

def init_db():
    """Create the MySQL database and products table if they do not exist."""
    try:
        # First connect without specifying database to create it if needed
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            port=MYSQL_PORT
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DB}")
        conn.commit()
        cursor.close()
        conn.close()

        # Connect to the target database and create products table
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

        # Seed sample products if table is empty
        cursor.execute("SELECT COUNT(*) FROM products")
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
                VALUES (%s, %s, %s, %s, %s)
            ''', sample_products)
            conn.commit()

        cursor.close()
        conn.close()
        print("MySQL Database and products table initialized successfully.")
    except Error as e:
        print(f"MySQL Connection Warning: {e}")

# Initialize database on startup
try:
    init_db()
except Exception as e:
    print(f"Init DB skipped: {e}")

# -------------------------------------------------------------
# 1. READ ALL PRODUCTS (HOME PAGE)
# -------------------------------------------------------------
@app.route('/')
def index():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM products ORDER BY id DESC')
    products = cursor.fetchall()
    cursor.close()
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
            VALUES (%s, %s, %s, %s, %s)
        ''', (name, category, price, quantity, description))
        conn.commit()
        cursor.close()
        conn.close()

        return redirect(url_for('index'))

    return render_template('add.html')

# -------------------------------------------------------------
# 3. UPDATE PRODUCT (EDIT)
# -------------------------------------------------------------
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
    cursor.execute('DELETE FROM products WHERE id = %s', (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return redirect(url_for('index'))

if __name__ == '__main__':
    # Run the Flask app on host 0.0.0.0 and port 5000
    app.run(host="0.0.0.0", port=5000, debug=True)
