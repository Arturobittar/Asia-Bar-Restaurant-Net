 import react, { useState, useEffect } from "react";
import DashboardPage from "../../components/layout/dashboard-page.js";
import "./Inicio.css"
import { ModalInformacionDelProducto, ModalInicio, InformacionDelProductoModal } from "./modalesInicio";

import { Mesa, RecienAgregado, MasVendidos, PedidoTicket } from "./widgetsInicio";

import { useTicketPrinter } from '../../hooks/home.js';

import { getTopProducts, getTableData, getRegisterData, getSaleDetails } from '../../utils/api.js';

import { saleAlert } from '../../utils/alerts.js';
import { errorAlert } from "../../utils/alerts";

function Inicio(){

    const [mostRecentProducts, setMostRecentProducts] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const onPrint = useTicketPrinter();

    useEffect(() => {
        const fetchProducts = async () => {
            const topFetched = await getTopProducts();
            setTopProducts(topFetched);

            const allProducts = await getTableData('sales');
            
            const mostRecent = allProducts.slice(-15).reverse();

            setMostRecentProducts(mostRecent);
        };

        fetchProducts();
    }, []);

    const [ModalAbierto, setModalAbierto] = useState(false);
    const [modalContenido, setModalContenido] = useState("");

    const onOpen = (modalContenido) => {
        setModalContenido(modalContenido);
        setModalAbierto(true);
    };

    return (
    
    
        <div className="mainInicio">
            {ModalAbierto && <ModalInicio contenido={modalContenido} onClose={()=> setModalAbierto(false)}/>}

                    <div className="frameResumenes">
                        <div className="framepedidos">
                            <h2 className="tituloframe">Pedidos</h2>
                            <div className="scrollframePedidos">

                                {
                                    mostRecentProducts.map((product) => {

                                        const showAlert = async () => {
                                            try {
                                                console.log("Obteniendo detalles de la venta ID:", product[0]);
                                                const fetched = await getSaleDetails(product[0]);
                                                console.log("Respuesta del servidor:", fetched);

                                                if (!fetched) {
                                                    throw new Error("No se recibieron datos de la venta");
                                                }

                                                // Verificar que los datos necesarios existan
                                                if (!fetched.ClientIdDocument || !fetched.ClientName || !fetched.products) {
                                                    console.error("Datos incompletos en la respuesta:", {
                                                        hasClientId: !!fetched.ClientIdDocument,
                                                        hasClientName: !!fetched.ClientName,
                                                        hasProducts: !!fetched.products,
                                                        response: fetched
                                                    });
                                                    throw new Error("Datos incompletos en la respuesta del servidor");
                                                }

                                                const client = {
                                                    id: fetched.ClientIdDocument,
                                                    name: fetched.ClientName
                                                };
        
                                                // Asegurarse de que products sea un array
                                                const products = Array.isArray(fetched.products) ? fetched.products : [];
                                                console.log("Productos recibidos:", products);
                                            
                                                const productsArray = products.map((p) => [
                                                    p.Name || 'Sin nombre', 
                                                    Number.parseFloat(p.Price || 0).toFixed(2),
                                                    p.Quantity || 0
                                                ]);

                                                saleAlert(
                                                    fetched.ID || 'N/A',
                                                    client,
                                                    fetched.Type || 'No especificado',
                                                    productsArray,
                                                    fetched.DeliverymanName || null,
                                                    fetched.Address || null,
                                                    fetched.Note || null
                                                );
                                            } catch (error) {
                                                console.error("Error detallado:", {
                                                    error: error.message,
                                                    stack: error.stack,
                                                    product: product[0]
                                                });
                                                errorAlert("Error", `No se pudieron cargar los detalles de la venta: ${error.message}`);
                                            }
                                        };

                                        return (
                                            <PedidoTicket 
                                                numeroPedido={product[0]}
                                                clientName={product[2]}
                                                tipoDePedido={product[3]}
                                                totalTicket={product[4]} 
                                                onOpen={() => showAlert()}
                                                onPrint={() => onPrint(product[0])}
                                            />
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>

                <div className="frameMesas">
                    <h2 className="tituloframe">Mesas</h2>
                    <div className="scrollFrameMesas">

                       
                        <Mesa nombre={"mesa 1"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 2"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 3"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 4"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 5"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 6"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 7"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 8"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 9"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 10"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 11"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 12"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 13"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 14"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 15"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 16"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 17"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 18"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 19"} onOpen={onOpen}/>
                        <Mesa nombre={"mesa 20"} onOpen={onOpen}/>
                           
                    



                    </div>
                </div>

                <div className="FrameMasVendidos">
                    <h2 className= "tituloframe">Más Vendidos</h2>
                    <div className="scrollframeMasVendidos">

                    { 
                        topProducts.length <= 0 ? (<p>Sin Datos</p>) : (
                            <>
                                {topProducts.map((product) => (<MasVendidos nombre={product.Name} precio={product.Price} totalVentas={product.TotalSales} />))}
                            </>
                        )
                    }

                    </div>
                </div>
        </div>
    )
}

const Home = () => {
    return (
        <DashboardPage> 
            <Inicio/> 
        </DashboardPage>
    );
}

export default Home;
