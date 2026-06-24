-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS perfume_db;
USE perfume_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  dob DATE DEFAULT NULL,
  gender VARCHAR(50) DEFAULT NULL,
  role VARCHAR(50) DEFAULT 'user',
  phone VARCHAR(50) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Brands Table
CREATE TABLE IF NOT EXISTS brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image VARCHAR(255) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Perfumes Table
CREATE TABLE IF NOT EXISTS perfumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  published TINYINT(1) DEFAULT 0,
  image VARCHAR(255) DEFAULT NULL,
  label VARCHAR(255) DEFAULT NULL,
  category VARCHAR(255) DEFAULT NULL,
  size VARCHAR(255) DEFAULT NULL,
  stock INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Perfume Brands Join Table
CREATE TABLE IF NOT EXISTS perfume_brands (
  brand_id INT NOT NULL,
  perfume_id INT NOT NULL,
  PRIMARY KEY (brand_id, perfume_id),
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
  FOREIGN KEY (perfume_id) REFERENCES perfumes(id) ON DELETE CASCADE
);

-- 5. Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(255) DEFAULT NULL,
  note_type VARCHAR(50) NOT NULL
);

-- 6. Perfume Notes Join Table
CREATE TABLE IF NOT EXISTS perfume_notes (
  perfume_id INT NOT NULL,
  note_id INT NOT NULL,
  PRIMARY KEY (perfume_id, note_id),
  FOREIGN KEY (perfume_id) REFERENCES perfumes(id) ON DELETE CASCADE,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);

-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  perfume_id INT NOT NULL,
  user_id INT NOT NULL,
  review_text TEXT,
  stars FLOAT NOT NULL DEFAULT 0.0,
  photo VARCHAR(255) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (perfume_id) REFERENCES perfumes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  payment_status VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  user_id INT NOT NULL,
  cart TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Perfume Orders Join Table
CREATE TABLE IF NOT EXISTS perfume_orders (
  perfume_id INT NOT NULL,
  order_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (perfume_id, order_id),
  FOREIGN KEY (perfume_id) REFERENCES perfumes(id) ON DELETE CASCADE
);

-- Seed Sample Data

-- Seed Users
INSERT INTO users (id, name, email, password, role, gender, dob, phone) VALUES
(1, 'Admin User', 'admin@essence.com', 'admin123', 'admin', 'Male', '1990-01-01', '1234567890'),
(2, 'Regular User', 'user@essence.com', 'user123', 'user', 'Female', '1995-05-15', '0987654321'),
(3, 'Jane Doe', 'jane@example.com', 'password123', 'user', 'Female', '1998-08-20', '1112223333'),
(4, 'Bob Smith', 'bob@example.com', 'password123', 'user', 'Male', '1988-12-12', '4445556666')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Brands
INSERT INTO brands (id, title, image) VALUES
(1, 'Dior', 'dior.png'),
(2, 'Chanel', 'chanel.jpg'),
(3, 'Gucci', 'gucci.jpg'),
(4, 'Versace', 'dior.png'),
(5, 'YSL', 'ysl.png'),
(6, 'Tom Ford', 'dior.png')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Perfumes
INSERT INTO perfumes (id, title, description, published, image, label, category, size, stock) VALUES
(1, 'Dior Sauvage', 'A radically fresh composition, dictated by a name that has the ring of a manifesto.', 1, 'dior_sauvage.png', 'best_seller', 'Men', '[{"size":"100ml","price":150.00}]', 50),
(2, 'Chanel No 5', 'An iconic, powdery floral bouquet that is the very essence of femininity.', 1, 'chanelno5.png', 'new_arrival', 'Women', '[{"size":"50ml","price":120.00}]', 30),
(3, 'Gucci Bloom', 'A fragrance that captures the spirit of the contemporary, diverse, and authentic women of Gucci.', 1, 'guccibloom.png', 'best_seller', 'Women', '[{"size":"100ml","price":100.00}]', 25),
(4, 'Versace Eros', 'Fresh, oriental, and woody fragrance featuring mint leaves, Italian lemon zest, and green apple.', 1, 'versaceeros.png', 'new_arrival', 'Men', '[{"size":"100ml","price":85.00}]', 40),
(5, 'YSL Black Opium', 'A highly addictive feminine fragrance. Fascinating and seductively intoxicating.', 1, 'yslblack.jpg', 'best_seller', 'Women', '[{"size":"90ml","price":130.00}]', 15),
(6, 'Tom Ford Oud Wood', 'One of the most rare, precious, and expensive ingredients in a perfumer’s arsenal.', 1, 'tfwood.png', 'new_arrival', 'Unisex', '[{"size":"50ml","price":250.00}]', 8)
ON DUPLICATE KEY UPDATE id=id;

-- Seed Perfume Brands
INSERT INTO perfume_brands (brand_id, perfume_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6)
ON DUPLICATE KEY UPDATE brand_id=brand_id, perfume_id=perfume_id;

-- Seed Notes
INSERT INTO notes (id, name, icon, note_type) VALUES
(1, 'Lime', 'lime.jpg', 'top_note'),
(2, 'Vanilla', 'vanilla.jpg', 'middle_note'),
(3, 'Sandalwood', 'sandalwood.jpg', 'low_note'),
(4, 'Mint', 'mint.jpg', 'top_note'),
(5, 'Rose', 'rose.jpg', 'middle_note'),
(6, 'Pineapple', 'pineapple.jpg', 'top_note')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Perfume Notes
INSERT INTO perfume_notes (perfume_id, note_id) VALUES
(1, 1),
(1, 3),
(2, 2),
(2, 5),
(3, 5),
(4, 4),
(4, 2),
(5, 2),
(6, 3)
ON DUPLICATE KEY UPDATE perfume_id=perfume_id, note_id=note_id;

-- Seed Reviews
INSERT INTO reviews (id, perfume_id, user_id, review_text, stars, photo) VALUES
(1, 1, 2, 'Absolutely love this fragrance! It lasts all day and gets lots of compliments.', 5.0, NULL),
(2, 1, 3, 'Smells great, but a bit too strong for daily office wear.', 4.0, NULL),
(3, 2, 4, 'Classic scent. Timeless, powdery, and extremely elegant.', 5.0, NULL),
(4, 3, 2, 'Very floral. If you love jasmine and white flowers, this is perfect.', 4.5, NULL),
(5, 5, 3, 'Nice sweet vanilla notes, but a bit too heavy for summer.', 3.5, NULL)
ON DUPLICATE KEY UPDATE id=id;

-- Seed Orders
INSERT INTO orders (id, order_id, payment_status, status, price, user_id, cart) VALUES
(1, 'ORD-1001', 'Paid', 'completed', 150.00, 2, '[{"id":1,"title":"Dior Sauvage","price":150.00,"quantity":1}]'),
(2, 'ORD-1002', 'Paid', 'pending', 240.00, 3, '[{"id":2,"title":"Chanel No 5","price":120.00,"quantity":2}]'),
(3, 'ORD-1003', 'Pending', 'placed', 100.00, 4, '[{"id":3,"title":"Gucci Bloom","price":100.00,"quantity":1}]')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Perfume Orders
INSERT INTO perfume_orders (perfume_id, order_id) VALUES
(1, 'ORD-1001'),
(2, 'ORD-1002'),
(3, 'ORD-1003')
ON DUPLICATE KEY UPDATE perfume_id=perfume_id, order_id=order_id;
