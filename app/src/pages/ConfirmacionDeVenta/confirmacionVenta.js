import React, { useState, useEffect } from 'react';
import Dashboard from "../reusables/dashboard-page";
import Swal from 'sweetalert2'; 
import './confirmacionVenta.css';
import './ticket.css';
import { TarjetaProductoInformacionVenta, TarjetaNota, TarjetaDelivery } from './widgetsConfirmacionVenta';
import { useNavigate, useLocation } from 'react-router-dom';
import { generarTicket } from '../../utils/ticketImpresion';

import { useOrder, useOrderClearer } from "../../hooks/order.js";

import { getLastSaleID, onNewSale } from "../../utils/api.js";

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
        Swal.fire({
                title: "Confirmación",
                text: "¿Se ha completado la venta e impreso el ticket correctamente?",
                showDenyButton: true,
                icon: "question",
                confirmButtonText: "Sí",
                denyButtonText: "No"
            }).then( (result) => {
                if (result.isConfirmed) {
                    onNewSale({
                        id: id,
                        clientID: order.clientID,
                        type: order.type,
                        total: total
                    }, () => {} ); 
                    orderClearer();
                    navegar('/Inicio');
                }                       
            });
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
            subtotal: total,
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

        { 
            (order.type !== "Delivery") ? null :
                (<div className='frameResumenCliente' id='resumenCliente'>

                    <div className='informacionCliente'>
                            <span className='nombreApellido'>{ order.clientName }</span>
                            <span className='datoCliente' id='ci'>{ order.clientID }</span>

                            <span className='datoCliente' id='informacionDireccion'>{ order.address }</span>
                           
                    </div>

                </div>)
        }

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
    return (<Dashboard content={ <ContenidoConfirmacionVenta/> } />)
}

export default ConfirmacionVenta
