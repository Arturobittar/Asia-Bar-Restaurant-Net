import React, { useEffect, useState, useContext } from "react";
import './Pedido.css'

import { Producto } from "./Widgets";
import { Pedido as WidgethPedido } from "./Widgets" ;
import { WidgetNota } from "./Widgets";
import Dashboard from "../reusables/dashboard-page";

import { useNavigate, useLocation } from "react-router-dom";
import { categories, useCategory, useDishes, useProducts, useOrderChanger } from "../../hooks/order.js";
import OrderContext from '../../context/order';

const CategoryTitles = ["Menú", "Contornos", "Productos", "Todos"];

function ContenidoPedido() {

    const { order, clearOrder, updateNote } = useContext(OrderContext);
    const location = useLocation();

    // Lógica para no borrar el pedido al regresar para editar
    useEffect(() => {
        console.log('Fase 2: Estado de navegación recibido:', location.state);
        const isEditing = location.state?.edit;
        if (!isEditing) {
            console.log('Fase 2: No es modo edición, limpiando el pedido.');
            clearOrder();
        }
    }, []);

    const [category, changeCategory] = useCategory();
    const dishes = useDishes(category);

    const [products, addFirst, increase, decrease] = useProducts();

    const [nota, setNota] = useState(false);

    const orderChanger = useOrderChanger(products, order.note);

    const navigate = useNavigate()

    const navegarAConfirmacion = () => {
        if (products.length === 0) return; // Evita continuar si no hay productos
        orderChanger();
        navigate('/confirmacion-venta');
    };

    const toggleMostrarProductor = () =>{
        setIsVisible(!isVisible);
    };

    const cerrar = () => {
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

    const toggleNota = () => {
        setNota(!nota)
    }

    const calcularTotal = () => {
        return products.reduce((total, producto) => {
            return total + (producto[1] * (producto[3] || 1));
        }, 0);
    };
    
    
    

    return (
            
        <div className="mainPedido">

            

            <h1 id="tituloPedido">Pedido</h1>

            <div className = "contenedorFramesPedido">

                <div className="overlayPedidos"  
                    style={{display: isVisible ? "block":"none"}} 
                    onClick={cerrar}>
                    </div>
                    
                

                <div className={`framePedido ${isVisible ? "visible" : ""}`}  id="framePlatos">
                    
                        

                    <h3 className="tituloPedido"></h3>

                    <div className="scrollFrame" id="scrollFrameProductos">
                        {
                            dishes.map((dish) => (
                            <Producto 
                                key={ dish[0] }
                                onAgregar={ () => addFirst(dish) }
                                nombre={dish[0]}
                                precio={dish[1]}
                            />
                        ))}
                    </div>

                    <div className="frameSegmentedButtonsPedidos">
                        <div className="segmentedButtonsContainer">
                            { CategoryTitles.map( (title, i) => (
                                <button 
                                    className={`segmentedButtonPedidos ${category === categories[i] ? 'active' : ''}`}
                                    onClick={ () => { changeCategory(i) } }
                                >
                                { title }
                                </button> 
                            ))}
                        </div>
                    </div>

                        
                    
                </div>

            

                <div className="framePedido" id="frameOrden">


                    

                    <h3 className="tituloPedido">Pedido</h3>

                    <div className="scrollFrame" id="scrollFramePedido">

                        {products.map((product) => (
                            <WidgethPedido 
                                key={product[0]}
                                nombre={product[0]}
                                precio={product[1]}
                                cantidad={product[3]}
                                onIncrease={ () => increase(product[0]) }
                                onDecrease={ () => decrease(product[0]) }
                            />
                        ))}
                    </div>

                    {!nota && (

                        <button id="nota" onClick={()=> setNota(true)}>+ | Agregar Nota</button>

                    )}
                    
                    {nota && (      
                        
                        <div className="modalAgregarNota">

                            <button className="cerrarModalAgregarNota" onClick={()=> setNota(false)}>-</button>
                            <textarea 
                                className="inputNota" 
                                placeholder="..."
                                value={order.note}
                                onChange={(e) => updateNote(e.target.value)}
                            ></textarea>
                            <button 
                                className="aceptarModalAgregarNota"
                                onClick={()=> setNota(false)}
                            >
                                Agregar
                            </button>
                    
                         </div>

                    )}
                    
                    
                        
            

                </div>

            </div>

            <div className="frameBotones">

               
                <button id="btnCancelar" className="btnPedido" onClick={() => navigate("/informacion-de-venta")}>Regresar</button>
                <button 
                    id="btnContinuar" 
                    className="btnPedido" 
                    onClick={navegarAConfirmacion} 
                >
                    Continuar
                </button>


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
