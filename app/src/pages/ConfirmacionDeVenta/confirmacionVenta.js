import React, { useState, useEffect } from 'react';
import DashboardPage from "../../components/layout/dashboard-page.js";
import './confirmacionVenta.css';
import { TarjetaProductoInformacionVenta, TarjetaNota, TarjetaDelivery } from './widgetsConfirmacionVenta';
import { useNavigate, useLocation } from 'react-router-dom';
import { generarTicket } from '../../utils/ticketImpresion';

import { useOrder, useOrderClearer } from "../../hooks/order.js";

import { getLastSaleID, onNewSale } from "../../utils/api.js";

import { questionAlert, successAlert, infoAlert } from "../../utils/alerts.js";

import { printOrderTicket } from '../../utils/ticket.js';

function ContenidoConfirmacionVenta() {
    const order = useOrder();
    const orderClearer = useOrderClearer();

    const products = order.products;
        
    const total = products.reduce((sum, product) => sum + (product[3] * product[1]), 0);

    const afterPrintDialog = (id) => {

        const productsArray = [];
        products.map( (product) => productsArray.push({
            name: product[0],
            price: product[1],
            quantity: product[3],
        }));

        questionAlert(
            "Confirmación",
            "¿Se ha completado la venta e impreso el ticket correctamente?",
            () => {
                onNewSale({
                    id: id,
                    clientId: order.clientID,
                    clientName: order.clientName,
                    type: order.type,
                    deliverymanName: order.deliverymanName,
                    note: order.note,
                    products: productsArray
                }, () => {} ); 
                orderClearer();
                navegar('/Inicio');
                successAlert("Venta Registrada", "Su venta ha sido exitosamente registrada en el sistema");
            },
            () => {
                infoAlert("Información", "Si desea registrar la venta, imprima el ticket y confírmerla nuevamente");
            }
        ); 
    };

    const imprimirTicket = async () => {
        const ultimaVenta = await getLastSaleID();
        const id = ultimaVenta + 1;

        const now = new Date();
        const date = now.toLocaleDateString('es-MX');
        const time = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        
        const data = {
            id: id,
            type: order.type,
            address: order.address,
            deliverymanName: order.deliverymanName,
            note: order.note,
            client: {
                id: order.clientID,
                name: order.clientName,
            },
            clock: {
                date: date,
                time: time,
            },
            products: products.map(product => ({
                nombre: product[0], 
                cantidad: product[3],
                precio: product[1]  // Precio unitario, no total
            })),
        };

        await printOrderTicket(data, () => afterPrintDialog(id)); 
    };

    const navegar = useNavigate()
    const location = useLocation();
    
    return (
    
    <div className='mainConfirmacionVenta'>
        
        <h1 className='tituloConfirmacionVenta'>Confirmacion Venta</h1>
        
        <div className='contenedorResumenVenta'>

            <div className='frameResumenCliente' id='resumenCliente'>
                <div className='informacionCliente'>
                    {order.clientName && <span className='nombreApellido'>{order.clientName}</span>}
                    {order.clientID && <span className='datoCliente' id='ci'>{order.clientID}</span>}
                    {order.type === "Delivery" && order.address && (
                        <span className='datoCliente' id='informacionDireccion'>{order.address}</span>
                    )}
                </div>
            </div>

            <div className='frameResumenVenta' id='resumenVenta'>

                <div className='scrollResumenProductos'>

                    { products.map((product, index) => (
                        <TarjetaProductoInformacionVenta 
                            key={`producto-${index}`}
                            nombre={product[0]}
                            cantidad={product[3]}
                            precio={product[1]}
                        />
                    ))}
                    
                    {order.note && (
                        <TarjetaNota nota={ order.note } />
                    )}


                </div>

                <div className='totalVenta'>

                    <span className='totalTexto'>Total: ${total.toFixed(2)}</span>

                </div>

            </div>


        </div>


        <div className="frameBotones">

                        
            <button id="btnCancelar" className="btnPedido" onClick={() => navegar("/Pedido")}>Regresar</button>
            <button 
                id="btnContinuar" 
                className="btnPedido" 
                onClick={ () => imprimirTicket() }
            >
                Completar venta
            </button>

        </div>


    </div>
    
)

}


function ConfirmacionVenta(){
    return (
        <DashboardPage>
            <ContenidoConfirmacionVenta/> 
        </DashboardPage>
    );
}

export default ConfirmacionVenta
