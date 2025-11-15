import React, { useState, useEffect, useRef } from 'react';
import DashboardPage from "../../components/layout/dashboard-page.js";
import './confirmacionVenta.css';
import { TarjetaProductoInformacionVenta, TarjetaNota, TarjetaDelivery } from './widgetsConfirmacionVenta';
import { useNavigate } from 'react-router-dom';
import { generarTicket } from '../../utils/ticketImpresion';
import { printOrderTicket } from '../../utils/ticket.js';
import { obtenerTipoCambio } from '../../config/tipoCambio';

import { useOrder, useOrderClearer } from "../../hooks/order.js";

import { getLastSaleID, onNewSale, updateTableStatus } from "../../utils/api.js";
import { saleOptions } from "../../config/tables.js";

import { questionAlert, successAlert, infoAlert, errorAlert } from "../../utils/alerts.js";



function ContenidoConfirmacionVenta() {
    const order = useOrder();
    const orderClearer = useOrderClearer();
    const [tipoCambio, setTipoCambio] = useState(0);
    const ticketTotalsRef = useRef({ totalBs: null, exchangeRate: null });

    const products = order.products;
        
    const total = products.reduce((sum, product) => sum + (product[3] * product[1]), 0);
    const totalBs = total * tipoCambio;

    const navegar = useNavigate();
    const pressTimerRef = useRef(null);
    const longPressTriggeredRef = useRef(false);

    const clearLongPressTimer = () => {
        if (pressTimerRef.current) {
            clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;
        }
    };

    const buildProductsArray = () => products.map((product) => ({
        name: product[0],
        price: product[1],
        quantity: product[3],
    }));

    const resolverTotalBs = () => {
        if (ticketTotalsRef.current.totalBs !== null && !Number.isNaN(ticketTotalsRef.current.totalBs)) {
            return ticketTotalsRef.current.totalBs;
        }
        if (!tipoCambio) {
            return null;
        }
        return Number((total * tipoCambio).toFixed(2));
    };

    const registrarVenta = (id) => {
        const productsArray = buildProductsArray();
        const normalizedTableName = order.tableNumber?.trim().toLowerCase();
        const isDineInSale = order.type === saleOptions[0] && Boolean(normalizedTableName);
        const totalBsPersistido = resolverTotalBs();

        onNewSale({
            id: id,
            clientId: order.clientID,
            clientName: order.clientName,
            type: order.type,
            address: order.address,
            deliverymanName: order.deliverymanName,
            tableNumber: order.tableNumber,
            paymentMethod: order.paymentMethod,
            note: order.note,
            totalBs: totalBsPersistido,
            products: productsArray
        }, async () => {
            if (isDineInSale) {
                try {
                    await updateTableStatus(normalizedTableName, { status: "ordenada", saleId: id });
                } catch (error) {
                    console.error("No se pudo actualizar el estado de la mesa", error);
                    errorAlert("Mesas", "La venta se registró, pero no se pudo actualizar la mesa. Hazlo manualmente desde Inicio.");
                }
            }

            orderClearer();
            navegar('/Inicio');
            successAlert("Venta Registrada", "Su venta ha sido exitosamente registrada en el sistema");
        });
    };

    const finalizarVentaSinTicket = async () => {
        if (!products.length) {
            infoAlert("Carrito vacío", "Agrega productos antes de completar la venta.");
            return;
        }

        try {
            const ultimaVenta = await getLastSaleID();
            const id = (ultimaVenta ?? 0) + 1;

            questionAlert(
                "Registrar venta sin ticket",
                "No se imprimirá el ticket. ¿Deseas completar la venta?",
                () => registrarVenta(id),
                () => infoAlert("Información", "Puedes intentar imprimir el ticket si lo necesitas.")
            );
        } catch (error) {
            console.error("Error al intentar finalizar sin ticket:", error);
            errorAlert("Error", "No se pudo registrar la venta sin ticket. Inténtalo nuevamente.");
        }
    };

    const LONG_PRESS_DELAY = 3000;

    const handlePressStart = () => {
        if (pressTimerRef.current) {
            return;
        }
        longPressTriggeredRef.current = false;
        pressTimerRef.current = setTimeout(() => {
            longPressTriggeredRef.current = true;
            finalizarVentaSinTicket();
            pressTimerRef.current = null;
        }, LONG_PRESS_DELAY);
    };

    const handlePressEnd = () => {
        clearLongPressTimer();
    };

    const handleButtonClick = () => {
        if (longPressTriggeredRef.current) {
            longPressTriggeredRef.current = false;
            return;
        }
        imprimirTicket();
    };
    
    // Obtener el tipo de cambio al cargar el componente
    useEffect(() => {
        const fetchTipoCambio = async () => {
            try {
                const tasa = await obtenerTipoCambio();
                setTipoCambio(tasa);
            } catch (error) {
                console.error('Error al obtener el tipo de cambio:', error);
                // Si hay un error, mostrar 0 en lugar de romper la interfaz
                setTipoCambio(0);
            }
        };
        
        fetchTipoCambio();
    }, []);

    useEffect(() => {
        return () => {
            clearLongPressTimer();
        };
    }, []);

    const afterPrintDialog = (id) => {
        questionAlert(
            "Confirmación",
            "¿Se ha completado la venta e impreso el ticket correctamente?",
            () => registrarVenta(id),
            () => {
                infoAlert("Información", "Si desea registrar la venta, imprima el ticket y confírmerla nuevamente");
            }
        ); 
    };

    const imprimirTicket = async () => {
        if (!products.length) {
            infoAlert("Carrito vacío", "Agrega productos antes de completar la venta.");
            return;
        }

        const ultimaVenta = await getLastSaleID();
        const id = (ultimaVenta ?? 0) + 1;

        const now = new Date();
        const date = now.toLocaleDateString('es-MX');
        const time = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

        let exchangeRate = tipoCambio;
        try {
            const tasa = await obtenerTipoCambio();
            if (tasa) {
                exchangeRate = tasa;
                setTipoCambio(tasa);
            }
        } catch (error) {
            console.error('No se pudo actualizar la tasa de cambio antes de imprimir', error);
        }

        const totalBsCalculado = (exchangeRate)
            ? Number((total * exchangeRate).toFixed(2))
            : null;

        ticketTotalsRef.current = {
            totalBs: totalBsCalculado,
            exchangeRate: exchangeRate ?? null
        };
        
        const data = {
            id: id,
            type: order.type,
            address: order.address,
            deliverymanName: order.deliverymanName,
            tableNumber: order.tableNumber,
            paymentMethod: order.paymentMethod,
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
            totals: {
                totalBs: ticketTotalsRef.current.totalBs,
                exchangeRate: ticketTotalsRef.current.exchangeRate
            }
        };

        await printOrderTicket(data, () => afterPrintDialog(id)); 
    };

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

                <div className='separadorMetodoPago' role="presentation"></div>

                <div className='metodoPagoResumen'>
                    <span className='metodoPagoEtiqueta'>Método de Pago</span>
                    <span className='metodoPagoValor'>{order.paymentMethod?.trim() ? order.paymentMethod : "No registrado"}</span>
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
                    <span className='totalTexto'>Bs.{totalBs.toFixed(2)}</span>
                   
                  

                </div>

            </div>


        </div>


        <div className="frameBotones">

                        
            <button id="btnCancelar" className="btnPedido" onClick={() => navegar("/Pedido")}>Regresar</button>
            <button 
                id="btnContinuar" 
                className="btnPedido" 
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                onTouchCancel={handlePressEnd}
                onClick={handleButtonClick}
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
