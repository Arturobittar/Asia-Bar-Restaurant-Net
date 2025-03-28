import React, { Suspense } from "react";
import { AllRoles } from "../session/roles";
import { RestrictedPage } from "../session/permissions";
import { PagePaths } from "./paths";

import Home from "../pages/Inicio/Inicio";
import Login from "../pages/login";
import InformacionVenta from "../pages/InformacionDeVenta/informacionDeVenta";
import Pedido from "../pages/PatallaPedido/Pedido";
import ConfirmacionVenta from "../pages/ConfirmacionDeVenta/confirmacionVenta";
import Request from "../pages/request";
import Users from "../pages/users";
import Clients from "../pages/clients";
import TablaVentas from "../pages/tabla-ventas";
import FormularioProducto from "../pages/Formularios/formulario_producto";
import UserControl from "../pages/control/user-control";
import ClientControl from "../pages/control/client-control";
import { MainDishControl, ProductControl, SideDishControl,Deliverywork } from "../pages/control/dish-control";



// Cargamos el formulario de venta de forma lazy después de todas las importaciones estáticas:
const LazyFormularioVenta = React.lazy(() =>
    import("../pages/Formularios/Formulario_venta")
);

class Page {
    constructor(path, component, title = null, roles = AllRoles) {
        this.path = path;
        this.component = (
            <RestrictedPage page={component} permissions={roles} />
        );
        this.title = title;
        this.roles = roles;
    }
}


export const PageList = [
    new Page(PagePaths['Home'], <Home />, "Menú default"),
    new Page(PagePaths['Login'], <Login />, "Login"),
    new Page(PagePaths['InformacionVenta'], <InformacionVenta />, "informacion venta"),
    new Page(PagePaths['Pedido'], <Pedido />, "ventanaPedido"),
    new Page(PagePaths['ConfirmacionVenta'], <ConfirmacionVenta />, "Confirmacion Venta"),
    new Page(PagePaths['SignUp'], <Request title="Nuevo Ingreso" />, "Nuevo Ingreso"),
    new Page(PagePaths['PasswordChange'], <Request title="Nueva Contraseña" />, "Cambio de Contraseña"),
    new Page(PagePaths['AddUser'], <Users title="Agregar Usuario" />, "Agregar Usuario"),
    new Page(PagePaths['EditUser'], <Users title="Modificar Usuario" />, "Modificar Usuario"),
    new Page(PagePaths['AddClient'], <Clients title="Añadir Cliente" />, "Añadir Cliente"),
    new Page(PagePaths['EditClient'], <Clients title="Modificar Cliente" />, "Modificar Cliente"),
    new Page(PagePaths['TablaVentas'], <TablaVentas />, "Tabla de Ventas"),
    new Page(PagePaths['FormularioProducto'], <FormularioProducto title="Formulario de Producto" />, "Formulario de Producto"),
    new Page(
        PagePaths['FormularioVenta'],
        <Suspense fallback={<div>Cargando...</div>}>
            <LazyFormularioVenta isOpen={true} onClose={() => {}} onSubmit={() => {}} />
        </Suspense>,
        "Formulario de Venta"
    ),
    new Page(PagePaths['UserControl'], <UserControl />, "Tabla de Usuarios"),
    new Page(PagePaths['ClientControl'], <ClientControl />, "Tabla de Clientes"),
    new Page(PagePaths['MainDishControl'], <MainDishControl />, "Tabla de Menú"),
    new Page(PagePaths['SideDishControl'], <SideDishControl />, "Tabla de Contornos"),
    new Page(PagePaths['ProductControl'], <ProductControl />, "Tabla de Productos"),
    new Page(PagePaths['Deliverywork'], <Deliverywork />, "Control de Repartidores"),
];

export function GetPageFromPath(path) {
    return PageList.find(page => page.path === path);
}