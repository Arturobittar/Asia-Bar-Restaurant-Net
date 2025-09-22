import React, { useState, useEffect } from 'react';
import DashboardPage from "../../components/layout/dashboard-page.js";
import './confirmacionVenta.css';
import './ticket.css';
import { TarjetaProductoInformacionVenta, TarjetaNota, TarjetaDelivery } from './widgetsConfirmacionVenta';
import { useNavigate, useLocation } from 'react-router-dom';
import { generarTicket } from '../../utils/ticketImpresion';

import { useOrder, useOrderClearer } from "../../hooks/order.js";

import { getLastSaleID, onNewSale } from "../../utils/api.js";

import { questionAlert, successAlert, infoAlert } from "../../utils/alerts.js";

function printTicket(ticket, afterPrintDialog, id) {
    const printContent = `
        <div id="ticket-print-content">
            <div class="ticket-container">
                <pre>${ticket}</pre>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', printContent);
    
    let reallyPrinted = false;
    const printMediaQuery = window.matchMedia('print');
    
    const cleanup = () => {
        const printElement = document.getElementById('ticket-print-content');
        if (printElement) printElement.remove();
        window.removeEventListener('afterprint', afterPrint);
        printMediaQuery.removeEventListener('change', handlePrintChange);
    };

    const handlePrintChange = (mql) => {
        if (mql.matches) {
            reallyPrinted = true;
        } else if (reallyPrinted) {
            cleanup();
        }
    };

    const afterPrint = () => {
        afterPrintDialog(id);
        cleanup();
    };

    printMediaQuery.addEventListener('change', handlePrintChange);
    window.addEventListener('afterprint', afterPrint);
    
    const timeoutId = setTimeout(() => {
        if (!reallyPrinted) cleanup();
    }, 30000);
    
    try {
        window.print();
    } catch (error) {
        console.error('Print error:', error);
        cleanup();
        clearTimeout(timeoutId);
    }
}

function ContenidoConfirmacionVenta() {


    const order = useOrder();
    const orderClearer = useOrderClearer();

    const products = order.products;
        
    // Calcular el total directo sin IVA
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
                    products: productsArray
                }, () => {} ); 
                orderClearer();
                navegar('/Inicio');
                successAlert("Venta Registrada", "Su venta ha sido exitosamente registrada en el sistema");
            },
            () => {
                console.log(products);
                infoAlert("Información", "Si desea registrar la venta, imprima el ticket y confírmerla nuevamente");
            }
        ); 
    };

    const imprimirTicket = async () => {
        const ultimaVenta = await getLastSaleID();
        const id = ultimaVenta + 1;

        const ahora = new Date();
        const fecha = ahora.toLocaleDateString('es-MX');
        const hora = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        
        const datosTicket = {
            empresa: 'RESTAURANTE ASIA',
            direccion: order.type === 'Delivery' ? order.address : 'Av. Principal #123',
            telefono: '555-123-4567',
            fecha: fecha,
            hora: hora,
            numeroTicket: id,
            tipoVenta: order.type,
            clienteNombre: order.clientName,
            clienteId: order.clientID,
            items: products.map(product => ({
                nombre: product[0], 
                cantidad: product[3],
                precio: product[1] * product[3],
                precioUnitario: product[1] 
            })),
            total: total,
            mensaje: order.note || '¡Gracias por su preferencia!'
        };

        const ticket = generarTicket(datosTicket);
        
        printTicket(ticket, afterPrintDialog, id); 
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
