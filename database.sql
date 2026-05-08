CREATE DATABASE IF NOT EXISTS armario CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE armario;

CREATE TABLE IF NOT EXISTS prendas (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    nombre   VARCHAR(100) NOT NULL,
    tipo     VARCHAR(50),
    color    VARCHAR(50),
    talla    VARCHAR(10),
    marca    VARCHAR(100),
    cajon    VARCHAR(100),
    imagen   VARCHAR(255),
    favorito TINYINT(1) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cajones (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS outfits (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS outfit_prendas (
    outfit_id INT NOT NULL,
    prenda_id INT NOT NULL,
    PRIMARY KEY (outfit_id, prenda_id),
    FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE,
    FOREIGN KEY (prenda_id) REFERENCES prendas(id) ON DELETE CASCADE
);
