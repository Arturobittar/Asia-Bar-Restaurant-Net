import react from "react";
import "./widgetsInicioCss/modalesInicio.css"
import "./widgetsInicioCss/informacionDeProducto.css"
import "./widgetsInicioCss/informacionDePedido.css"
import {TarjetaProductoInformacionVenta} from "../ConfirmacionDeVenta/widgetsConfirmacionVenta.js"


export function ModalInicio({contenido, onOpen, onClose, onModalClick}){

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
                    <button className="btnCerrarModal" onClick={onClose}>x</button>

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


export function InformacionDelPedidoModal({datosPedido}){


    return(

        <div className="mainInformacionDelPedidoModal">

            <h2>Informacion del pedido</h2>

            <h3 className="nombreCompradorModal">{datosPedido.nombreComprador}</h3>
            <div className="labelInformacionPedido">{datosPedido.idComprador}</div>
           
            <div className="labelInformacionPedido">Tipo de pedido: {datosPedido.tipoDeCompra}</div>

            <div className={`informacionDelivery ${datosPedido.tipoDeCompra === "Delivery" ? "informacionVisibleModal":""}`}>
                <h3>{datosPedido.nombreRepartidor}</h3>
                <div className="labelInformacionPedido">{datosPedido.direccionEntrega}</div>

            </div>

            
            <div className={`informacionComerAqui ${datosPedido.tipoDeCompra === "Comer Aqui" ? "informacionVisibleModal":""}`}>
                
                <h3>{datosPedido.nombreMesero}</h3>
                <div className="labelInformacionPedido">{datosPedido.mesa}</div>

            </div>

            <h3 className="tituloPedidoModal">Pedido:</h3>
            <div className="scrollFramePedidoModal">

                <TarjetaProductoInformacionVenta/>
                <TarjetaProductoInformacionVenta/>
                <TarjetaProductoInformacionVenta/>
                <TarjetaProductoInformacionVenta/>
                <TarjetaProductoInformacionVenta/>
                <TarjetaProductoInformacionVenta/>
                <TarjetaProductoInformacionVenta/>

            </div>

            <div className="valorTotalPedidoModal">Valor total: {datosPedido.valorTotalDePedido}$</div>

        </div>


    )

}








export function ModalInformacionDelProducto ({datosDelProducto}){


    return (<ModalInicio contenido={<InformacionDelProductoModal datosProducto= {datosDelProducto}/>}/>)

}
