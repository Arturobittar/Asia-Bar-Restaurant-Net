import React, { useEffect, useMemo, useState } from "react";
import "./widgetsInicioCss/Mesa.css"
/*import "./widgetsInicioCss/RecienAgregado.css"*/
import "./widgetsInicioCss/MasVendidos.css"
import "./widgetsInicioCss/PedidoTicket.css"
import {InformacionDelProductoModal, InformacionDelPedidoModal} from "./modalesInicio.js"
import { useNavigate } from 'react-router-dom';
import { routes } from '../../config/routes.js'; 
import { updateTableStatus, getSaleDetails } from '../../utils/api.js';
import { errorAlert } from "../../utils/alerts.js";

import { Info, ReceiptText } from "lucide-react";


// Estas constantes solo estan para las pruebas
const DatosPrueba = {

   "nombre" : "Producto nombre",
   "costo"  : 2,
   "precioDeVenta" : 10,
   "descripcion" : "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi esse ab laboriosam ducimus ipsam quidem sapiente saepe, tempora nam quo!",
   "totalDeVentas" : 30,
   "imagen": "https://cdn.sanity.io/images/jsdrzfkj/recepedia-global-production/f4e2c09fadb6448eeac86dc6b680a46aefb6d54c-1200x800.jpg?w=1200&h=800&auto=format"

}

const DatosPedidoPrueba = {

   "nombreComprador" : "Nombre Comprador",
   "idComprador" : "V-11222333",
   "tipoDeCompra": "Comer Aqui",

   "nombreRepartidor":"Nombre Repartidor",
   "direccionEntrega": "calle falsa 123",

    /* "nombreMesero": "Nombre Mesero"*/ /*aun no se habilitará esta funcion*/
   "mesa": "mesa 9",

   "valorTotalDePedido": 40



}

export function Mesa({ nombre, data, onOpen, onRefresh }){

   const navigate = useNavigate();
   const [mostrarOpciones, setMostrarOpciones] = useState(false);
   const [elapsedSeconds, setElapsedSeconds] = useState(0);
   const [isUpdating, setIsUpdating] = useState(false);
   const [isLoadingInfo, setIsLoadingInfo] = useState(false);

   const estado = data?.Status ?? "desocupada";
   const timerStart = useMemo(() => data?.TimerStart ? new Date(data.TimerStart) : null, [data?.TimerStart]);
   const deliveryTimeSeconds = data?.DeliveryTimeSeconds ?? null;
   const saleId = data?.SaleID ?? null;
   const normalizedName = nombre?.toLowerCase();

   const estadoLabel = {
      desocupada: "Desocupada",
      ocupada: "Ocupada",
      ordenada: "Orden lista",
      consumiendo: "Consumiento"
   }[estado] || "Desconocida";

   const formatearTimer = (totalSegundos = 0) => {
      const horas = Math.floor(totalSegundos/3600);
      const minutos = Math.floor((totalSegundos%3600)/60);
      const segundos = totalSegundos%60;
      return  `${horas.toString().padStart(2,"0")}:${minutos.toString().padStart(2,"0")}:${segundos.toString().padStart(2,"0")}`;
   };

   useEffect(()=>{
      if (estado !== "ordenada" || !timerStart || Number.isNaN(timerStart.getTime())){
         setElapsedSeconds(0);
         return;
      }

      const tick = () => {
         const diff = Math.max(0, Math.floor((Date.now() - timerStart.getTime())/1000));
         setElapsedSeconds(diff);
      };

      tick();
      const intervalo = setInterval(tick, 1000);
      return () => clearInterval(intervalo);
   }, [estado, timerStart]);

   const toggleMenu = () => {
      if (isUpdating) return;
      setMostrarOpciones(prev => !prev);
   };

   const sendStatusUpdate = async (status, extraPayload = {}) => {
      if (!normalizedName) return;
      setIsUpdating(true);
      try {
         await updateTableStatus(normalizedName, { status, ...extraPayload });
         await onRefresh?.();
      } catch (error) {
         console.error("No se pudo actualizar la mesa", error);
         errorAlert("Error", "No se pudo actualizar la mesa. Inténtalo nuevamente.");
      } finally {
         setIsUpdating(false);
         setMostrarOpciones(false);
      }
   };

   const handleOrdenar = async (e) => {
      e.stopPropagation();

      if (estado === "consumiendo") {
         await sendStatusUpdate("ocupada", { saleId: null });
      }

      navigate(routes['Informacion de Venta'], { 
         state: { 
            fromTable: true, 
            tableName: nombre 
         } 
      });
   };

   const handleOcupar = async (e) => {
      e.stopPropagation();
      await sendStatusUpdate("ocupada", { saleId: null });
   };

   const handleDesocupar = async (e) => {
      e.stopPropagation();
      await sendStatusUpdate("desocupada");
   };

   const handlePedidoEntregado = async (e) => {
      e.stopPropagation();
      await sendStatusUpdate("consumiendo");
   };

   const handleInfo = async (e) => {
      e.stopPropagation();

      if (!saleId) {
         errorAlert("Pedido", "Esta mesa no tiene una venta vinculada todavía.");
         return;
      }

      setIsLoadingInfo(true);
      try {
         const fetched = await getSaleDetails(saleId);
         if (!fetched) {
            throw new Error("No se encontraron datos de la venta");
         }

         const products = Array.isArray(fetched.products) ? fetched.products : [];
         const formattedProducts = products.map((product) => ({
            nombre: product.Name || "Producto",
            cantidad: product.Quantity || 0,
            precio: Number.parseFloat(product.Price || 0)
         }));

         const totalCalculado = formattedProducts.reduce((sum, prod) => sum + (prod.precio * prod.cantidad), 0);

         onOpen?.(
            <InformacionDelPedidoModal
               datosPedido={{
                  numeroPedido: fetched.ID,
                  nombreComprador: fetched.ClientName,
                  idComprador: fetched.ClientIdDocument,
                  tipoDeCompra: fetched.Type,
                  nombreRepartidor: fetched.DeliverymanName,
                  direccionEntrega: fetched.Address,
                  mesa: fetched.TableNumber,
                  nota: fetched.Note,
                  productos: formattedProducts,
                  total: totalCalculado
               }}
            />
         );
      } catch (error) {
         console.error("No se pudo obtener la información del pedido", error);
         errorAlert("Pedido", "No se pudo cargar la información del pedido. Inténtalo nuevamente.");
      } finally {
         setIsLoadingInfo(false);
      }
   };

   const mostrarMenu = mostrarOpciones && !isUpdating;

   return (
      <div className={`widgetMesa ${estado}`} onClick={toggleMenu}>
         <div className="mesaHeader">
            <span className="estadoMesa">{estadoLabel}</span>
            {saleId && <span className="ventaTag">Orden #{saleId}</span>}
         </div>

         <div className="mesaBody">
            <p className="nombreMesa">{nombre}</p>
            {estado === "ordenada" && (
               <p className="timer">⏱ {formatearTimer(elapsedSeconds)}</p>
            )}
         </div>

         {estado === "consumiendo" && Number.isFinite(deliveryTimeSeconds) && (
            <p className="deliveryTime">Tiempo hasta entrega: {formatearTimer(deliveryTimeSeconds)}</p>
         )}

         {mostrarMenu && (
            <div className="menuOpciones" onClick={(e) => e.stopPropagation()}>
               {estado === "desocupada" && (
                  <button className="opcionMesa" type="button" onClick={handleOcupar} disabled={isUpdating}>Ocupar</button>
               )}

               {estado === "ocupada" && (
                  <>
                     <button className="opcionMesa" type="button" onClick={handleOrdenar} disabled={isUpdating}>Ordenar</button>
                     <button className="opcionMesa" type="button" onClick={handleDesocupar} disabled={isUpdating}>Desocupar</button>
                  </>
               )}

               {estado === "ordenada" && (
                  <>
                     <button className="opcionMesa" type="button" onClick={handlePedidoEntregado} disabled={isUpdating}>Pedido entregado</button>
                     <button className="opcionMesa" type="button" onClick={handleDesocupar} disabled={isUpdating}>Desocupar</button>
                     <button className="opcionMesa info" type="button" onClick={handleInfo}>
                        <Info size={18} />
                     </button>
                  </>
               )}

               {estado === "consumiendo" && (
                  <>
                     <button className="opcionMesa" type="button" onClick={handleOrdenar} disabled={isUpdating}>Ordenar</button>
                     <button className="opcionMesa" type="button" onClick={handleDesocupar} disabled={isUpdating}>Desocupar</button>
                  </>
               )}
            </div>
         )}

         {(isUpdating || isLoadingInfo) && (
            <div className="mesaUpdatingOverlay" aria-live="polite">
               <span className="mesaSpinner" aria-hidden="true"></span>
               <span className="mesaUpdatingText">{isUpdating ? "Actualizando…" : "Cargando info…"}</span>
            </div>
         )}
      </div>
   );
}








// Esta funcion recibe "onOpen" como argumento, esta es una funcion que se encarga de abrir el modal cuando se le da click al boton de informacion. La idea seria que al darle al boton se ejecute otra funcion que busque los datos del producto en la base de datos y luego ejecute la funcion onOpen abriendo el modal conteniendo el componente "InformacionDelProductoModal" y a su ves este tendria en "datosPorducto" un diccionario que tiene los datos necesarios para rellenar el modal. 
/*export function RecienAgregado({nombre, precio, categoria, onOpen}){

   

 

   return(

      <div className="mainRecienAgregado">

         <div className="informacionRecienAgregado">
            <h3 className="tituloRecienAgregado">{nombre}</h3>
            <span className="precioRecienAgregado">precio: <span className="precioRecienAgregadoTexto">{precio}$</span></span>
            <span className="categoriaRecienAgregado">{categoria}</span>
         </div>
         <button className="btnInformacionRecienAgregado" onClick = {() => onOpen(<InformacionDelProductoModal datosProducto={DatosPrueba} />)}><Info size={30} /></button> 

      </div>

   )

}*/











export function MasVendidos({top, nombre, srcImg, precio, totalVentas, onOpen}){

      if (!srcImg){
         srcImg = "https://static.vecteezy.com/system/resources/thumbnails/018/128/189/small/schezwan-noodles-or-szechuan-vegetable-png.png" 
      }
         
   return(

      <div className={`mainMasVendidos ${top}`}>
         
         
         <span className="nombreMasVendido">{nombre}</span>
         <span className="precioMasVendido">{Number.parseFloat(precio).toFixed(2)}$</span>
         <span className="totalDeVentas">Total de Ventas: {totalVentas}</span>
         

      </div>


   )


}












export function PedidoTicket({numeroPedido, clientName, totalProductos, tipoDePedido, mesa, totalTicket, onOpen, onPrint}){

   const esParaComerAqui = tipoDePedido && 
      (tipoDePedido.toLowerCase().includes('comer') || 
       tipoDePedido.toLowerCase().includes('aquí'));

   return (

      <div className="mainPedidoTicket"> {/* ticket visual en computadora, no la impresion*/}

         <div className="informacionPedidoTicket">
            <h3 className="numeroDePedido">Pedido N° {numeroPedido}</h3>
            <span className="NombreComprador">{clientName}</span>
            <span className="tipoDePedidoTicket">Tipo de pedido: {tipoDePedido}</span>
            {esParaComerAqui && mesa && (
               <span className="mesaTicket">Mesa: {mesa}</span>
            )}
         </div>

         <span className="totalTicket">{Number.parseFloat(totalTicket).toFixed(2)}$</span>

         <div className="contenedorBtnPedidoTicket">
            <button className="botonInformacionTicket" onClick={() => onOpen()}>
                <Info size={20} />
            </button>
            <button className="botonInformacionTicket" onClick={() => onPrint()}>
                <ReceiptText size={20} />
            </button>
            
         </div>
      </div>

   )

}
