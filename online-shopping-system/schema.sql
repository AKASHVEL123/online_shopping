-- MySQL Database Schema for Online Shopping System
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

-- Initial seed data
INSERT INTO products (name, category, price, quantity, description) VALUES
('Laptop', 'Electronics', 75000.00, 10, 'High-performance laptop for coding and multitasking'),
('Mobile Phone', 'Electronics', 45000.00, 25, '5G smartphone with high-resolution camera'),
('Headphones', 'Accessories', 3500.00, 50, 'Wireless noise-canceling stereo headphones'),
('Keyboard', 'Accessories', 2200.00, 30, 'Mechanical gaming keyboard with backlight'),
('Mouse', 'Accessories', 1200.00, 40, 'Ergonomic optical wireless mouse');
