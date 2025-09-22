import React, { useEffect, useState } from "react";
import "./widgetsInicioCss/Mesa.css"
/*import "./widgetsInicioCss/RecienAgregado.css"*/
import "./widgetsInicioCss/MasVendidos.css"
import "./widgetsInicioCss/PedidoTicket.css"
import {InformacionDelProductoModal, InformacionDelPedidoModal} from "./modalesInicio.js"
import { useNavigate } from "react-router-dom"; 

import { Info } from "lucide-react";



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

export function Mesa({nombre, onOpen}){

   const [estado,setEstado] = useState("desocupada");
   const [temporizador,setTemporizador] = useState(0);
   const [mostrarOpciones, setMostrarOpciones] = useState(false);

   const navigate = useNavigate();

   const handleOrdenar = (e) => {
      const session = JSON.parse(localStorage.getItem('session'));
      console.log("Tipo de cuenta actual:", session?.accountType);
      console.log("Navegando a /informacion_venta");
      navigate('/informacion_venta');
  };
   

   const formatearTimer = (totalSegundos) => {
      const horas = Math.floor(totalSegundos/3600);
      const minutos = Math.floor((totalSegundos%3600)/60);
      const segundos = totalSegundos%60;
      return  `${horas.toString().padStart(2,"0")}:${minutos.toString().padStart(2,"0")}:${segundos.toString().padStart(2,"0")}`;
   };

   
   useEffect(()=>{
      let intervalo;
      if (estado === "ordenada"){
         intervalo = setInterval(()=>{
            setTemporizador((prev)=> prev +1);
         },1000);
      } else {
         setTemporizador(0);
      }
      return () => clearInterval(intervalo);


   }, [estado]);

   const clickMesa = () =>{
      console.log("mesa clickeada, estado:",estado);
      console.log("antes de cambiar a mostrar opciones:",mostrarOpciones);
      setMostrarOpciones(!mostrarOpciones);
      console.log("despues de mostra opciones", !mostrarOpciones);
   };
   const cambiarEstado = (nuevoEstado) => {
      setEstado(nuevoEstado);
      setMostrarOpciones(false);
   };
   
   
   return (
      <div className={`widgetMesa ${estado}`} onClick={clickMesa}>
         <p className="nombreMesa">{nombre}</p>
         {estado === "ordenada" && <p className="timer">🕐 {formatearTimer(temporizador)} </p>}

         {mostrarOpciones && (
            <div className="menuOpciones">
               {estado === "desocupada" && (
                  <button className="opcionMesa" onClick={() => cambiarEstado("ocupada")}>Ocupada</button>
               )}
               {estado === "ocupada" && (
                  <>
                     <button className="opcionMesa" onClick={() => cambiarEstado("desocupada")}>Desocupar</button>
                     <button
                        className="opcionMesa"
                        type="button"
                        onClick={handleOrdenar} // <-- Aquí usas la función
                     >
                        Ordenar
                     </button>
                  </>
               )}
               {estado === "ordenada" && (
                  <>
                     <button className="opcionMesa" onClick={() => cambiarEstado("ocupada")}>Orden completa</button>
                     <button className="opcionMesa" onClick={() => cambiarEstado("desocupada")}>Desocupar</button>
                     <button className="opcionMesa" onClick={() => onOpen(<InformacionDelPedidoModal datosPedido={DatosPedidoPrueba}/>)}><Info size={20} /></button>
                  </>
               )}

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












export function PedidoTicket({numeroPedido, clientName, totalProductos, tipoDePedido, totalTicket, onOpen}){

   return (

      <div className="mainPedidoTicket"> {/* ticket visual en computadora, no la impresion*/}

         <div className="informacionPedidoTicket">
            <h3 className="numeroDePedido">Pedido N° {numeroPedido}</h3>
            <span className="NombreComprador">{clientName}</span>
            <span className="tipoDePedidoTicket">Tipo de pedido: {tipoDePedido}</span>
         </div>

         <span className="totalTicket">{Number.parseFloat(totalTicket).toFixed(2)}$</span>

         <div className="contenedorBtnPedidoTicket">
            <button className="botonInformacionTicket" onClick={() => onOpen(<InformacionDelPedidoModal datosPedido={DatosPedidoPrueba}/>)}><Info size={20} /></button>
            
         </div>
      </div>

   )

}
