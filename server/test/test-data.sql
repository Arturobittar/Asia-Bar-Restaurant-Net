USE AsiaBarRestaurant;

INSERT INTO Users (Username, Type, Password) VALUES
('admin', 'Administrador', 'admin'),
('paulo', 'Administrador', 'paulo2'),
('anthony', 'Administrador', '4nTh0n1'),
('crodriguez', 'Usuario', 'CarlosR_123'),
('lopezj', 'Usuario', 'L0pezJ@lp'),
('ana_t', 'Usuario', 'AnaT3ch!'),
('sys_ro', 'Usuario', 'R0otTemp$'),
('mcontreras', 'Usuario', 'Mcont2024#'),
('ventas1', 'Usuario', 'Vta$2024'),
('sergio_a', 'Usuario', 'SergioA_789');

INSERT INTO Clients (IdDocument, Name, Address, Phone) VALUES
('V-12345678', 'Carlos Mendoza', 'Barcelona', '04125551234'),
('J-987654321', 'TecnoSoluciones CA', 'Puerto La Cruz', '04249876543'),
('V-98765432', 'María Rodríguez', 'Lechería', '04167894561'),
('G-123456789', 'Distribuidora Lider C.A', 'Guanta', '04141237890'),
('V-20345678', 'José Pereira', 'Anaco', '04123698741'),
('J-298765432', 'Farmacia Salud Total', 'Cantaura', '04266549873'),
('V-18234567', 'Laura Sánchez', 'El Tigre', '04142589637'),
('E-876543210', 'Constructora Horizonte', 'San Tomé', '04127418529'),
('V-22456189', 'Roberto Díaz', 'Aragua de Barcelona', '04247531598'),
('J-301234567', 'Inversiones Delta CA', 'Pariaguán', '04169517532');

INSERT INTO MainDish (Name, Availability, Price, Description) VALUES
('Pabellón Criollo', 1, 12.99, 'Carne mechada, caraotas negras, arroz y tajadas'),
('Pescado Frito al Limón', 1, 15.50, 'Pargo rojo frito con salsa de limón y ajo'),
('Asado Negro', 1, 14.25, 'Lomito de res guisado con papas y zanahorias'),
('Hervido de Gallina', 1, 11.75, 'Caldo espeso con gallina, verduras y tubérculos'),
('Cachapa con Queso', 1, 8.99, 'Cachapa de maíz con queso guayanés y mantequilla'),
('Carne en Vara', 1, 13.50, 'Brochetas de res con vegetales a la parrilla'),
('Pastel de Morrocoy', 0, 22.99, 'Tradicional de Oriente - Disponibilidad limitada'),
('Sancocho de Cangrejo', 1, 16.75, 'Cangrejos frescos de Guanta con aliños'),
('Hallaca Oriental', 1, 9.50, 'Variante anzoatiguense con pescado y ají dulce'),
('Parrilla Mixta', 1, 18.99, 'Res, pollo y chorizo con guarnición');

INSERT INTO SideDish (Name, Availability, Price, Description) VALUES
('Tostones', 1, 3.50, 'Plátanos verdes fritos y aplastados'),
('Arroz con Coco', 1, 4.25, 'Arroz con leche de coco y ají dulce'),
('Yuca Frita', 1, 2.99, 'Yuca fresca frita con salsa de ajo'),
('Ensalada de Aguacate', 1, 4.75, 'Aguacate con cebolla y tomate fresco'),
('Arepitas Dulces', 1, 3.25, 'Pequeñas arepas de maíz endulzado'),
('Papas Chorreadas', 1, 4.50, 'Papas con salsa de cebolla y queso'),
('Caraotas Negras', 1, 3.75, 'Frijoles negros guisados'),
('Tajadas de Maduro', 1, 2.50, 'Plátano maduro frito en láminas'),
('Arroz Blanco', 1, 2.25, 'Arroz blanco tradicional'),
('Verduras Salteadas', 1, 3.99, 'Mezcla de vegetales frescos al wok');

INSERT INTO Product (Name, Availability, Price, Description) VALUES
('Cerveza Polar', 1, 2.50, 'Cerveza lager venezolana'),
('Ron Santa Teresa', 1, 7.99, 'Ron añejo venezolano'),
('Jugo de Tamarindo', 1, 3.25, 'Refrescante jugo natural'),
('Queso Telita', 1, 6.75, 'Queso fresco típico'),
('Flan de Coco', 1, 4.50, 'Postre tradicional oriental'),
('Café Guayanés', 1, 2.25, 'Café de la región oriental'),
('Salsa Picante', 1, 1.99, 'Salsa de ají margariteño'),
('Pan de Jamón', 1, 8.50, 'Especialidad navideña'),
('Agua Mineral', 1, 1.50, 'Agua embotellada 500ml'),
('Tequila Líder', 1, 12.75, 'Tequila reposado mexicano');

INSERT INTO Deliverymen (Name, Area, Availability, Phone) VALUES
('Luis Martínez', 'Zona 1', 1, '04125551001'),
('Carlos Rojas', 'Zona 1', 1, '04141234567'),
('Pedro González', 'Zona 2', 1, '04167890123'),
('José Rodríguez', 'Zona 2', 0, '04245557890'),  -- No disponible
('Miguel Suárez', 'Zona 3', 1, '04263216549'),
('Juan Contreras', 'Zona 3', 1, '04129876543'),
('Ricardo Pérez', 'Zona 4', 1, '04145552468'),
('Francisco Díaz', 'Zona 4', 1, '04161357924'),
('Antonio Hernández', 'Zona 5', 1, '04248642097'),
('Roberto Sánchez', 'Zona 5', 1, '04265551357');

INSERT INTO Sales (ID, ClientIdDocument, ClientName, Type) VALUES
(1, 'V-12345678', 'Carlos Mendoza', 'Comer Aquí'),
(2, 'J-987654321', 'TecnoSoluciones CA', 'Delivery'),
(3, 'V-98765432', 'María Rodríguez', 'Delivery'),
(4, 'G-123456789', 'Distribuidora Lider C.A', 'Comer Aquí'),
(5, 'V-20345678', 'José Pereira', 'Por Aquí'),
(6, 'J-298765432', 'Farmacia Salud Total', 'Para llevar'),
(7, 'V-18234567', 'Laura Sánchez', 'Para llevar'),
(8, 'E-876543210', 'Constructora Horizonte', 'Delivery'),
(9, 'V-22456189', 'Roberto Díaz', 'Para llevar'),
(10, 'J-301234567', 'Inversiones Delta CA', 'Comer Aquí');

INSERT INTO SaleDetails (ID, Name, Price, Quantity) VALUES
(1, 'Pabellón Criollo', 12.99, 2),
(1, 'Cerveza Polar', 2.50, 3),
(2, 'Asado Negro', 14.25, 1),
(2, 'Yuca Frita', 2.99, 2),
(2, 'Ron Santa Teresa', 7.99, 1),
(3, 'Cachapa con Queso', 8.99, 3),
(3, 'Jugo de Tamarindo', 3.25, 2),
(4, 'Parrilla Mixta', 18.99, 2),
(4, 'Tostones', 3.50, 2),
(5, 'Pescado Frito al Limón', 15.50, 1),
(5, 'Arroz con Coco', 4.25, 1),
(6, 'Sancocho de Cangrejo', 16.75, 1),
(6, 'Verduras Salteadas', 3.99, 2),
(7, 'Hallaca Oriental', 9.50, 4),
(7, 'Agua Mineral', 1.50, 3),
(8, 'Carne en Vara', 13.50, 2),
(8, 'Papas Chorreadas', 4.50, 1),
(9, 'Hervido de Gallina', 11.75, 1),
(9, 'Arepitas Dulces', 3.25, 3),
(10, 'Flan de Coco', 4.50, 2),
(10, 'Café Guayanés', 2.25, 3);

