DROP DATABASE IF EXISTS AsiaBarRestaurant;

-- Luego la creamos
CREATE DATABASE AsiaBarRestaurant;

-- Seleccionamos la base de datos
USE AsiaBarRestaurant;

CREATE TABLE Users (
    Username VARCHAR(25) PRIMARY KEY NOT NULL,
    Type VARCHAR(25) NOT NULL,
    Password VARCHAR(100) NOT NULL
);

CREATE TABLE Clients (
    IdDocument VARCHAR(20) PRIMARY KEY NOT NULL,
    Name VARCHAR(50) NOT NULL,
    Address VARCHAR(25) NOT NULL,
    Phone VARCHAR(20) NOT NULL
);

CREATE TABLE MainDish (
    Name VARCHAR(50) PRIMARY KEY NOT NULL,
    Availability INT DEFAULT TRUE NOT NULL,
    Price FLOAT NOT NULL,
    Description VARCHAR(100)
);

CREATE TABLE SideDish (
    Name VARCHAR(50) PRIMARY KEY NOT NULL,
    Availability INT DEFAULT TRUE NOT NULL,
    Price FLOAT NOT NULL,
    Description VARCHAR(100)
);

CREATE TABLE Product (
    Name VARCHAR(50) PRIMARY KEY NOT NULL,
    Availability INT DEFAULT TRUE NOT NULL,
    Price FLOAT NOT NULL,
    Description VARCHAR(100)
);

CREATE TABLE Sales (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    ClientIdDocument VARCHAR(20) NOT NULL,
    ClientName VARCHAR(50) NOT NULL,
    Type VARCHAR(20) NOT NULL,
    DeliverymanName VARCHAR(50),
    Note TEXT,
    Direction VARCHAR(100),
    TableNumber VARCHAR(20),
    PaymentMethod VARCHAR(200) NOT NULL,
    TotalBs DECIMAL(12, 2)
);

CREATE TABLE SaleDetails (
    ID INT NOT NULL,
    Name VARCHAR(50) NOT NULL,
    Price FLOAT NOT NULL,
    Quantity INT NOT NULL,
    FOREIGN KEY (ID) REFERENCES Sales(ID) ON DELETE CASCADE
);

CREATE TABLE Tables (
    Name VARCHAR(20) PRIMARY KEY,
    Status VARCHAR(20) NOT NULL DEFAULT 'desocupada',
    SaleID INT,
    TimerStart DATETIME,
    DeliveryTimeSeconds INT,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (SaleID) REFERENCES Sales(ID) ON DELETE SET NULL
);

INSERT INTO Tables (Name, Status)
VALUES
    ('mesa 1', 'desocupada'),
    ('mesa 2', 'desocupada'),
    ('mesa 3', 'desocupada'),
    ('mesa 4', 'desocupada'),
    ('mesa 5', 'desocupada'),
    ('mesa 6', 'desocupada'),
    ('mesa 7', 'desocupada'),
    ('mesa 8', 'desocupada'),
    ('mesa 9', 'desocupada'),
    ('mesa 10', 'desocupada'),
    ('mesa 11', 'desocupada'),
    ('mesa 12', 'desocupada'),
    ('mesa 13', 'desocupada'),
    ('mesa 14', 'desocupada'),
    ('mesa 15', 'desocupada'),
    ('mesa 16', 'desocupada'),
    ('mesa 17', 'desocupada'),
    ('mesa 18', 'desocupada'),
    ('mesa 19', 'desocupada'),
    ('mesa 20', 'desocupada');

CREATE TABLE Deliverymen (
    Name VARCHAR(50) PRIMARY KEY NOT NULL,
    Area VARCHAR(25) NOT NULL,
    Availability INT DEFAULT TRUE NOT NULL,
    Phone VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS TipoCambio (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Tasa DECIMAL(10, 4) NOT NULL,
    FechaActualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO TipoCambio (Tasa) VALUES (212.48);