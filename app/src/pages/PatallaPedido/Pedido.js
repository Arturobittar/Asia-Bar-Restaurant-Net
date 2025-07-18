import React, { useEffect, useState } from "react";
import './Pedido.css'

import { Producto } from "./Widgets";
import { Pedido as WidgethPedido } from "./Widgets" ;
import { WidgetNota } from "./Widgets";
import Dashboard from "../reusables/dashboard-page";

import { useNavigate } from "react-router-dom";

function ContenidoPedido() {

    const navegar = useNavigate()
    const [pedido, setPedido] = useState([]);
    const [categoriaActiva, setCategoriaActiva] = useState('todos');
    const [nota, setNota] = useState(false)

    // Arreglo de productos por categoría
    const productosPorCategoria = {
        contornos: [
            { id: 4, nombre: 'Wontón Frito', precio: 15, categoria: 'contornos' },
            { id: 5, nombre: 'Rollo de Primavera', precio: 18, categoria: 'contornos' },
            { id: 9, nombre: 'Pollo Kung Pao', precio: 28, categoria: 'contornos' },
            { id: 10, nombre: 'Cerdo Agridulce', precio: 26, categoria: 'contornos' }
        ],
        productos: [
            { id: 1, nombre: 'Arroz Frito', precio: 20, categoria: 'productos' },
            { id: 2, nombre: 'Tallarín Saltado', precio: 25, categoria: 'productos' },
            { id: 3, nombre: 'Pollo Agridulce', precio: 30, categoria: 'productos' },
            { id: 6, nombre: 'Té Verde', precio: 8, categoria: 'productos' },
            { id: 7, nombre: 'Coca Cola', precio: 10, categoria: 'productos' },
            { id: 11, nombre: 'Sopa Wantán', precio: 22, categoria: 'productos' },
            { id: 12, nombre: 'Chaufa Especial', precio: 28, categoria: 'productos' },
            { id: 16, nombre: 'Jugo de Maracuyá', precio: 12, categoria: 'productos' },
            { id: 17, nombre: 'Agua Mineral', precio: 6, categoria: 'productos' }
        ],
        menu: [
            { id: 13, nombre: 'Menú Ejecutivo 1', precio: 35, categoria: 'menu' },
            { id: 14, nombre: 'Menú Familiar', precio: 65, categoria: 'menu' },
            { id: 15, nombre: 'Menú Vegetariano', precio: 30, categoria: 'menu' },
            { id: 18, nombre: 'Menú Especial', precio: 40, categoria: 'menu' }
        ]
    };

    // Combinar todos los productos para la categoría 'todos'
    const todosLosProductos = [
        ...productosPorCategoria.contornos,
        ...productosPorCategoria.productos,
        ...productosPorCategoria.menu
    ];

    const productos = {
        todos: todosLosProductos,
        ...productosPorCategoria
    };

    const agregarProducto = (producto) => {
        // Verificar si el producto ya está en el pedido
        const productoExistente = pedido.find(p => p.id === producto.id);
        
        if (productoExistente) {
            // Si existe, incrementar la cantidad
            setPedido(pedido.map(p => 
                p.id === producto.id 
                    ? { ...p, cantidad: (p.cantidad || 1) + 1 }
                    : p
            ));
        } else {
            // Si no existe, agregar con cantidad 1
            setPedido([...pedido, { ...producto, cantidad: 1 }]);
        }
    };

    const filtrarProductos = (categoria) => {
        setCategoriaActiva(categoria);
    };

    // Obtener productos según la categoría activa
    const productosFiltrados = categoriaActiva === 'todos' 
        ? productos.todos 
        : productos[categoriaActiva] || [];

    const actualizarCantidadProducto = (nuevaCantidad, id) => {
        if (nuevaCantidad < 1) {
            eliminarProducto(id);
            return;
        }
        setPedido(pedido.map(producto =>
            producto.id === id
                ? { ...producto, cantidad: nuevaCantidad }
                : producto
        ));
    };

    const eliminarProducto = (id) => {
        setPedido(pedido.filter(producto => producto.id !== id));
    };

    const toggleMostrarProductor = () =>{
        setIsVisible(!isVisible);
    };

    const cerrarProductos = () => {

        setIsVisible(false);

    };

    useEffect(()=>{

        const cambioDeTamanno = () => {

            if (window.innerWidth > 768){
                setIsVisible(false);
            }

        };

        window.addEventListener('resize',cambioDeTamanno);

        return () => {
            window.removeEventListener('resize',cambioDeTamanno);
        };


    }, []);

    const [isVisible, setIsVisible] = useState(false);

    const toggleNota = () =>{
        setNota(!nota)
    }

    return (
            
        <div className="mainPedido">

            

            <h1 id="tituloPedido">Pedido</h1>

            <div className = "contenedorFramesPedido">

                <div className="overlayPedidos"  
                    style={{display: isVisible ? "block":"none"}} 
                    onClick={cerrarProductos}>
                    </div>
                    
                

                <div className={`framePedido ${isVisible ? "visible" : ""}`}  id="framePlatos">
                    
                        

                    <h3 className="tituloPedido">Productos</h3>

                    <div className="scrollFrame" id="scrollFrameProductos">

                        {productosFiltrados.map((producto) => (
                            <Producto 
                                key={producto.id}
                                onAgregar={() => agregarProducto(producto)}
                                nombre={producto.nombre}
                                precio={producto.precio}
                            />
                        ))}
                    </div>

                    <div className="frameSegmentedButtonsPedidos">
                        <div className="segmentedButtonsContainer">
                            <button 
                                className={`segmentedButtonPedidos ${categoriaActiva === 'todos' ? 'active' : ''}`}
                                onClick={() => filtrarProductos('todos')}
                            >
                                Todos
                            </button>
                            <button 
                                className={`segmentedButtonPedidos ${categoriaActiva === 'contornos' ? 'active' : ''}`}
                                onClick={() => filtrarProductos('contornos')}
                            >
                                Contornos
                            </button>
                            <button 
                                className={`segmentedButtonPedidos ${categoriaActiva === 'productos' ? 'active' : ''}`}
                                onClick={() => filtrarProductos('productos')}
                            >
                                Productos
                            </button>
                            <button 
                                className={`segmentedButtonPedidos ${categoriaActiva === 'menu' ? 'active' : ''}`}
                                onClick={() => filtrarProductos('menu')}
                            >
                                Menú
                            </button>
                        </div>
                    </div>

                        
                    
                </div>

            

                <div className="framePedido" id="frameOrden">


                    

                    <h3 className="tituloPedido">Pedido</h3>

                    <div className="scrollFrame" id="scrollFramePedido">

                        {pedido.map((producto) => (
                            <WidgethPedido 
                                key={producto.id}
                                id={producto.id}
                                nombre={producto.nombre}
                                precio={producto.precio}
                                cantidad={producto.cantidad || 1}
                                onCantidadChange={(nuevaCantidad) => actualizarCantidadProducto(nuevaCantidad, producto.id)}
                                onEliminar={() => eliminarProducto(producto.id)}
                            />
                        ))}
                    </div>

                    {!nota && (

                        <button id="nota" onClick={()=> setNota(true)}>+ | Agregar Nota</button>

                    )}
                    
                    {nota && (      
                        
                        <div className="modalAgregarNota">

                            <button className="cerrarModalAgregarNota" onClick={()=> setNota(false)}>-</button>
                            <textarea className="inputNota" placeholder="..." ></textarea>
                            <button className="aceptarModalAgregarNota">Agregar</button>
                    
                         </div>

                    )}
                    
                    
                        
            

                </div>

            </div>

            <div className="frameBotones">

               
                <button id="btnCancelar" className="btnPedido" onClick={() => navegar("/informacion-de-venta")}>Regresar</button>
                <button id="btnContinuar" className="btnPedido" onClick={() => navegar("/confirmacion-venta")}>Continuar</button>


            </div>

            <button className={`btnEsconder ${isVisible ? "active" : ""}`}
                        id="btnEsconder"
                        onClick={toggleMostrarProductor}>
                            
                            {isVisible ? "▼":"▲"}

            </button>



        </div>




    );
}



const Pedido = () => {
    return (
        <Dashboard content={ <ContenidoPedido/> } />
    );
}

export default Pedido;


//Nota