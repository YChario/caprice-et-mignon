-- Création de la base de données
CREATE DATABASE IF NOT EXISTS caprice_mignon_db;
USE caprice_mignon_db;

-- Table des restaurants
CREATE TABLE IF NOT EXISTS restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories (Menu)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_slug_per_resto (restaurant_id, slug)
);

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Insertion des restaurants
INSERT INTO restaurants (id, name, slug, description, image_url) VALUES 
(1, 'Caprice', 'caprice', 'Une expérience culinaire inoubliable.', '/images/caprice.jpg'),
(2, 'Mignon', 'mignon', 'Douceurs et délices pour les gourmands.', '/images/mignon.jpg');

-- Insertion des catégories
INSERT INTO categories (id, restaurant_id, name, slug, image_url) VALUES 
(1, 1, 'Pizzas', 'pizzas', '/images/pizzas.jpg'),
(2, 1, 'Pâtes', 'pates', '/images/pates.jpg'),
(3, 1, 'Boissons', 'boissons', '/images/boissons.jpg'),
(4, 2, 'Crêpes', 'crepes', '/images/crepes.jpg'),
(5, 2, 'Gaufres', 'gaufres', '/images/gaufres.jpg'),
(6, 2, 'Milkshakes', 'milkshakes', '/images/milkshakes.jpg');

-- Insertion des produits
INSERT INTO products (category_id, name, description, price, image_url) VALUES 
(1, 'Margherita', 'Tomate, mozzarella, basilic frais', 10.50, '/images/margherita.jpg'),
(1, 'Regina', 'Tomate, mozzarella, jambon, champignons', 12.00, '/images/regina.jpg'),
(1, 'Quatre Fromages', 'Mozzarella, chèvre, gorgonzola, emmental', 14.50, '/images/4fromages.jpg'),
(4, 'Sucre Beurre', 'La classique, fondante et sucrée', 3.50, '/images/crepe_sucre.jpg'),
(4, 'Nutella Banane', 'Pâte à tartiner noisette et rondelles de banane', 5.00, '/images/crepe_nutella.jpg'),
(4, 'Caramel Beurre Salé', 'Nappage maison onctueux', 4.50, '/images/crepe_caramel.jpg');
