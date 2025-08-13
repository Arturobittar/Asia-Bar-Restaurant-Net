import { DashboardSubItem } from "../utils/dashboard.js";

export const dashboardItems = [
    {
        title: "Control de Ventas",
        subItems: [ 
            new DashboardSubItem('Informacion de Venta', 'Ventas'), 
            new DashboardSubItem('Control', 'Ventas', 'Control de Ventas') 
        ] 
    },
    {
        title: "Control de Servicios",
        subItems: [ 
            new DashboardSubItem('Control', 'Menú', 'Control de Menú'), 
            new DashboardSubItem('Control', 'Contornos', 'Control de Contornos'),
            new DashboardSubItem('Control', 'Productos', 'Control de Productos'),
            /*new DashboardSubItem('Control', 'Repartidores', 'Control de Repartidores')},*/
        ] 
    },
    {
        title: "Control de Clientes",
        subItems: [ new DashboardSubItem('Control', 'Clientes', 'Control de Clientes') ] 
    },
    {
        title: "Control de Usuarios",
        subItems: [ new DashboardSubItem('Control', 'Usuarios', 'Control de Usuarios') ] 
    },
];
