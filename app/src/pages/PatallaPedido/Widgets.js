import React, { useState, useEffect } from "react";
import "./Widgets.css"

const formatearPrecio = (valor) => {
    return parseFloat(Number(valor).toFixed(2));
};

export function Producto({ nombre = "Nombre del producto", precio = 20, onAgregar }){
    const handleAgregar = () => {
        if (onAgregar) {
            onAgregar({ nombre, precio });
        }
    };

    return (
        <div className="frameProducto">
            <div className="productoInformacion">
                <div className = "descripcion">
                    <p id="productoNombre">{nombre}</p>
                    <p id="productoPrecio">{formatearPrecio(precio).toLocaleString('es-ES')}$</p>
                    <p id="prductoDisponiblidad">Disponible</p>
                </div>
            </div>
            <button id="btnAgregarPoducto" onClick={handleAgregar}>
                +
            </button>
        </div>
    )
}

export function Pedido({ id, nombre, precio, cantidad = 1, onIncrease, onDecrease }) {
    

    return (
        <div className="framePedidoWidget">
            <button 
                className="btnSumarRestar" 
                id="btnRestarProducto"
                onClick={onDecrease}
            >
                -
            </button>

            <p className="pedidoNombre">{nombre}</p>
            
            <div className="pedidoCantidad">
                {cantidad}x
            </div>

            <div className="pedidoTotal">
                <p className="pedidoTotalTexto">{formatearPrecio(cantidad * precio).toLocaleString('es-ES')}$</p>
            </div>

            <button 
                className="btnSumarRestar" 
                id="btnSumarProducto"
                onClick={onIncrease}
            >
                +
            </button>
        </div>
    );
}

export function WidgetNota(){
    return (
        <div className="mainNotaWidget">
            <div className="frameTituloNota">
                <p className="notaTitulo">Nota</p>
                <button id="btneliminarNota">
                    x
                </button>
            </div>
            <p className="notaContenido">*La nota deberia tener un maximo de caracteres 1232 13123213213213  </p>
        </div>
    )
}
