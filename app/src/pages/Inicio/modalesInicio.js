import react from "react";
import "./widgetsInicioCss/modalesInicio.css"
import "./widgetsInicioCss/informacionDeProducto.css"
import "./widgetsInicioCss/informacionDePedido.css"
import {TarjetaProductoInformacionVenta} from "../ConfirmacionDeVenta/widgetsConfirmacionVenta.js"


export function ModalInicio({contenido, onOpen, onClose, onModalClick, hideCloseButton = false}){

    // Cerrar modal al hacer clic en el overlay
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('overlayModalInicio')) {
            onClose();
        }
    };
    
    // Manejar clic en el modal (para cerrar sidebar si está abierto)
    const handleModalClick = () => {
        if (onModalClick) {
            onModalClick();
        }
    };

    return (

        <div className="mainModalInicio">

            <div className="overlayModalInicio" onClick={handleOverlayClick}>
                    
                <div className="modalInicio" onClick={handleModalClick}>
                    {!hideCloseButton && (
                        <button className="btnCerrarModal" onClick={onClose}>x</button>
                    )}

                        {contenido}

                </div>

            </div>

        </div>

    )

}

export function InformacionDelProductoModal({datosProducto}){


    return(

        <div className="mainInformacionDelProductoModal">

            
            

            
            
            <h2>{datosProducto.nombre}</h2>

            {/* <div className="labelInformacionProducto">Costo: {datosProducto.costo}$</div> */} {/*Actualmente no tiene uso*/}
            <div className="labelInformacionProducto">Precio de venta: {datosProducto.precioDeVenta}$</div>
            <div className="labelInformacionProducto Descripcion">Descripcion: {datosProducto.descripcion}</div>
            {/*<div className="labelInformacionProducto">Total de ventas: {datosProducto.totalDeVentas}</div>*/}{/*Actualmente no tiene uso*/}



        </div>

    )

}


export function InformacionDelPedidoModal({ datosPedido = {} }){

    const {
        numeroPedido,
        nombreComprador,
        idComprador,
        tipoDeCompra,
        nombreRepartidor,
        direccionEntrega,
        mesa,
        nota,
        productos = [],
        total = 0
    } = datosPedido || {};

    const tipoLower = tipoDeCompra?.toLowerCase() || "";
    const esDelivery = tipoLower.includes("delivery");
    const esComerAqui = tipoLower.includes("comer") || tipoLower.includes("aqu");

    return(

        <div className="mainInformacionDelPedidoModal">

            <div className="modalPedidoHeader">
                <div>
                    <h2>Información del pedido</h2>
                    {numeroPedido && <p className="numeroPedido">Orden #{numeroPedido}</p>}
                </div>
            </div>

            {nombreComprador && <h3 className="nombreCompradorModal">{nombreComprador}</h3>}
            {idComprador && <div className="labelInformacionPedido">{idComprador}</div>}
            {tipoDeCompra && <div className="labelInformacionPedido">Tipo de pedido: {tipoDeCompra}</div>}

            {esDelivery && (
                <div className={`informacionDelivery informacionVisibleModal`}>
                    {nombreRepartidor && <h3>{nombreRepartidor}</h3>}
                    {direccionEntrega && <div className="labelInformacionPedido">{direccionEntrega}</div>}
                </div>
            )}

            {esComerAqui && (
                <div className={`informacionComerAqui informacionVisibleModal`}>
                    <h3>Mesa asignada</h3>
                    {mesa && <div className="labelInformacionPedido">{mesa}</div>}
                </div>
            )}

            <h3 className="tituloPedidoModal">Pedido</h3>
            <div className="scrollFramePedidoModal">
                {productos.length > 0 ? (
                    productos.map((producto, index) => (
                        <TarjetaProductoInformacionVenta
                            key={`producto-${producto.nombre}-${index}`}
                            nombre={producto.nombre}
                            cantidad={producto.cantidad}
                            precio={producto.precio}
                        />
                    ))
                ) : (
                    <p className="mensajePedidoVacio">Sin productos registrados</p>
                )}
            </div>

            {nota && (
                <div className="notaPedido">
                    <span>Nota:</span>
                    <p>{nota}</p>
                </div>
            )}

            <div className="valorTotalPedidoModal">Valor total: ${Number(total || 0).toFixed(2)}</div>

        </div>


    )

}








export function ModalInformacionDelProducto ({datosDelProducto}){


    return (<ModalInicio contenido={<InformacionDelProductoModal datosProducto= {datosDelProducto}/>}/>)

}
