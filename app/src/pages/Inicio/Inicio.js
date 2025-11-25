 import react, { useState, useEffect, useCallback } from "react";
import DashboardPage from "../../components/layout/dashboard-page.js";
import "./Inicio.css"
import { ModalInformacionDelProducto, ModalInicio, InformacionDelProductoModal } from "./modalesInicio";

import { Mesa, RecienAgregado, MasVendidos, PedidoTicket } from "./widgetsInicio";

import { useTicketPrinter } from '../../hooks/home.js';

import { getTopProducts, getTableData, getRegisterData, getSaleDetails, getTablesStatus } from '../../utils/api.js';
import { tableOptions } from '../../config/tables.js';

import { saleAlert } from '../../utils/alerts.js';
import { errorAlert } from "../../utils/alerts";

function Inicio(){

    const [mostRecentProducts, setMostRecentProducts] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [tablesStatus, setTablesStatus] = useState({});
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

    const refreshTablesStatus = useCallback(async () => {
        try {
            const fetched = await getTablesStatus();
            const mapped = fetched.reduce((acc, table) => {
                if (!table?.Name) {
                    return acc;
                }
                acc[table.Name.toLowerCase()] = table;
                return acc;
            }, {});
            setTablesStatus(mapped);
        } catch (error) {
            console.error("No se pudieron cargar las mesas", error);
        }
    }, []);

    useEffect(() => {
        refreshTablesStatus();
    }, [refreshTablesStatus]);

    useEffect(() => {
        const interval = setInterval(refreshTablesStatus, 30000);
        return () => clearInterval(interval);
    }, [refreshTablesStatus]);

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

                                                const productsTotalUsd = products.reduce((sum, product) => sum + (Number(product.Price || 0) * Number(product.Quantity || 0)), 0);
                                                const deliveryPriceUsd = Number(fetched.DeliveryPrice ?? 0);
                                                const totalUsdConDelivery = productsTotalUsd + deliveryPriceUsd;

                                                const totalBsNumber = (fetched.TotalBs !== null && fetched.TotalBs !== undefined)
                                                    ? Number(fetched.TotalBs)
                                                    : null;

                                                const exchangeRate = (totalBsNumber && totalUsdConDelivery)
                                                    ? Number((totalBsNumber / totalUsdConDelivery).toFixed(4))
                                                    : null;

                                                const deliveryPriceBs = (exchangeRate && deliveryPriceUsd)
                                                    ? Number((deliveryPriceUsd * exchangeRate).toFixed(2))
                                                    : null;

                                                saleAlert(
                                                    fetched.ID || 'N/A',
                                                    client,
                                                    fetched.Type || 'No especificado',
                                                    productsArray,
                                                    fetched.DeliverymanName || null,
                                                    fetched.Address || null,
                                                    fetched.TableNumber || null,
                                                    fetched.Note || null,
                                                    fetched.PaymentMethod || null,
                                                    fetched.TotalBs ?? null,
                                                    deliveryPriceUsd,
                                                    deliveryPriceBs
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
                                                mesa={product[5]}
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

                        {tableOptions.map((tableName) => (
                            <Mesa
                                key={tableName}
                                nombre={tableName}
                                data={tablesStatus[tableName.toLowerCase()]}
                                onOpen={onOpen}
                                onRefresh={refreshTablesStatus}
                            />
                        ))}
                           
                    



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
