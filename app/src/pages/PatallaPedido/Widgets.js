import React, { useState, useEffect } from "react";
import "./Widgets.css"

export function Producto({ nombre, precio, descripcion, onAgregar, isAvailable }){
    const handleAgregar = () => {
        if (onAgregar) {
            onAgregar({ nombre, precio });
        }
    };

    return (
        <div className="frameProducto">
            {descripcion && (
                <div className="infoProducto" data-tooltip={descripcion}>
                    i
                </div>
            )}
            <div className="productoInformacion">
                <div className = "descripcion">
                    <p id="productoNombre">{nombre}</p>
                    <p id="productoPrecio">{precio.toFixed(2)}$</p>
                    <p id="prductoDisponiblidad">{ isAvailable ? "Disponible" : "No disponible" }</p>
                </div>
            </div>
                
            {
                (isAvailable) ? 
                    <button id="btnAgregarPoducto" onClick={handleAgregar}>
                        +
                    </button> : null
            } 

        </div>
    )
}

export function Pedido({ id, nombre, precio, cantidad = 1, onIncrease, onDecrease }) {
    const total = cantidad * precio; 
    
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
                <p className="pedidoTotalTexto">{ total.toFixed(2) }$</p>
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
