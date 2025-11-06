import Page from "../utils/page.js";

import Home from "../pages/Inicio/Inicio";
import Login from "../pages/login";

import Pedido from "../pages/PatallaPedido/Pedido";

import OrderDetails from "../pages/order-details.js";
import ConfirmacionVenta from "../pages/ConfirmacionDeVenta/confirmacionVenta";

import ControlPage from "../pages/control.js";
import ControlFormPage from '../pages/control-form.js';

import Sales from "../pages/sales.js";
import EditOrder from "../pages/edit-order.js";

import { names } from "./routes.js"

import { Roles, AllRoles } from "./roles.js";

const components = [
    Home,
    Login,
    Pedido,
    OrderDetails,
    ConfirmacionVenta,
    ControlPage,
    ControlFormPage,
    Sales,
    EditOrder
]

export const pages = components.map((Component, index) => 
  new Page(names[index], <Component />, (names[index] === "Inicio de Sesion") ? null : AllRoles )
);

export function getPageFromPath(path) {
    return pages.find((page) => page.path == path);
}
