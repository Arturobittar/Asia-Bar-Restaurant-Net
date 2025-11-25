
import React from "react";

import './widgetsConfirmacionVenta.css'


export function TarjetaProductoInformacionVenta({ nombre, cantidad, precio }){


    return(

        <div className="mainTarjetaInformacion">

            <span className="tituloTarjeta">{nombre}</span>
            <span className="cantidadProductoTarjeta">
                Cantidad: <span className="cantidadProductoTarjeta" id="numeroTotalProducto">{cantidad}</span>
            </span>

            <div className="precioTotalProducto">

                <span className="precioTotalLabel">Total: </span>
                <span className="precioTotalProductoTexto">
                    ${(precio * cantidad).toFixed(2)}
                </span>


            </div>

        </div>


    )


};

export function TarjetaNota({ nota }){
    return (
        <div className="mainTarjetaInformacion">
            <span className="tituloTarjeta">Nota</span>
            <div className="contenidoTarjetaNota">
                {nota}
            </div>
        </div>
    );
};


export function TarjetaDelivery ({ monto = 0, montoBs = null }){

    const montoFormateado = Number.parseFloat(monto || 0).toFixed(2);
    const montoBsFormateado = (montoBs !== null && montoBs !== undefined)
        ? Number.parseFloat(montoBs).toFixed(2)
        : null;

    return (

        <div className="mainTarjetaInformacion">
            
            <span className="tituloTarjeta">Costo Delivery</span>

            

            <div className="precioTotalProducto">

                <span className="precioTotalLabel">Delivery: </span>
                <span className="precioTotalProductoTexto">${montoFormateado}</span>

            </div>

            {montoBsFormateado !== null && (
                <div className="montoDeliveryBs">
                    <span className="precioTotalProductoTexto">Bs.{montoBsFormateado}</span>
                </div>
            )}


        </div>


    )


}