import react, { useState, useEffect } from "react";
import DashboardPage from "../../components/layout/dashboard-page.js";
import "./Inicio.css"
import { ModalInformacionDelProducto, ModalInicio, InformacionDelProductoModal } from "./modalesInicio";

import { Mesa, RecienAgregado, MasVendidos, PedidoTicket } from "./widgetsInicio";

import { getTopProducts, getTableData, getRegisterData } from '../../utils/api.js';

import { saleAlert } from '../../utils/alerts.js';

function Inicio(){

    const [mostRecentProducts, setMostRecentProducts] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

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
                                            const fetched = await getRegisterData(`sales/details`, product[0]);

                                            const client = {
                                                id: fetched[1],
                                                name: fetched[2]
                                            };
                                            
                                            const products = fetched[4];

                                            const productsArray = [];

                                            products.map((product) => productsArray.push([
                                                product.Name, 
                                                Number.parseFloat(product.Price).toFixed(2),
                                                product.Quantity
                                            ]));

                                            saleAlert(
                                                fetched[0],
                                                client,
                                                fetched[3],
                                                productsArray
                                            );
                                        };

                                        return (
                                            <PedidoTicket 
                                                numeroPedido={product[0]}
                                                clientName={product[2]}
                                                tipoDePedido={product[3]}
                                                totalTicket={product[4]} 
                                                onOpen={() => showAlert()}
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
