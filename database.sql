CREATE DATABASE armario;

USE armario;

CREATE TABLE prendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    tipo VARCHAR(50),
    color VARCHAR(50),
    talla VARCHAR(10)
);