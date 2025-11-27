import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { useFormFields, usePairs } from './form.js';

import { getTableData, getRegisterData, getSaleDetails, onDelete, onUpdateSale } from '../utils/api.js';
import { successAlert, saleAlert } from '../utils/alerts.js';
import { printOrderTicket } from '../utils/ticket.js';

import { routes } from '../config/routes.js';

import SaleContext from "../context/sale.js";

export function useSaleIDChanger() {
    const {id, setID} = useContext(SaleContext);

    return (value) => setID(value);
}

export function useSaleID() {
    const {id, setID} = useContext(SaleContext);

    return id;
}

export function useEditSaleFormFields() {
    const id = useSaleID(); 
    const saleProducts = usePairs();
    const [values, setters] = useFormFields(8); // ClientId, ClientName, Type, Address, DeliverymanName, TableNumber, Note, PaymentMethod

    let areProductsInitialized = false;

    useEffect(() => {
        const getValues = async () => {
            const fetched = await getSaleDetails(id);
            
            if (!fetched) {
                console.error("No se pudieron cargar los datos de la venta");
                return;
            }

            // Setear valores del formulario: ClientIdDocument, ClientName, Type, Address, DeliverymanName, TableNumber
            setters[0](fetched.ClientIdDocument);
            setters[1](fetched.ClientName);
            setters[2](fetched.Type);
            setters[3](fetched.Address || '');
            setters[4](fetched.DeliverymanName || '');
            setters[5](fetched.TableNumber || '');
            setters[6](fetched.Note || '');
            setters[7](fetched.PaymentMethod || '');

            const products = Array.isArray(fetched.products) ? fetched.products : [];

            const productsArray = [];

            products.forEach((product) => productsArray.push([
                product.Name, 
                Number.parseFloat(product.Price).toFixed(2),
                Math.max(1, product.Quantity)
            ]));

            if (!areProductsInitialized)
                productsArray.forEach((product) => saleProducts.push(product) );

            areProductsInitialized = true;
        };
        
        getValues();
    }, []);

    const onAddProduct = () => saleProducts.push(["", 0, 1]);

    const onDeleteProduct = (indexToDelete) => saleProducts.deleteIf((_, index) => index === indexToDelete);

    return [values, setters, saleProducts, onAddProduct, onDeleteProduct];
}

export function useOnEditContinue(id, client, type, address, deliverymanName, tableNumber, note, paymentMethod, products) {
    const navigate = useNavigate();

    const productsArray = products.reduce((array, { value }) => [...array, {
        name: value[0],
        price: value[1],
        quantity: value[2],
    }], []);
    

    const data = {
        clientId: client.id,
        clientName: client.name,
        type: type,
        address: address || null,
        deliverymanName: deliverymanName || null,
        tableNumber: tableNumber || null,
        note: note || null,
        paymentMethod: paymentMethod || null,
        products: productsArray || []
    };

    return (e) => {
        e.preventDefault();
        onUpdateSale(
            id, 
            data, 
            () => {
                successAlert("Completado", "Se ha actualizado la venta correctamente");
                navigate(routes['Control de Ventas']);
            }
        );
    };
}

export function useData() {
    const [data, setData] = useState([]);
    const sanitizeRow = (row) => {
        if (!Array.isArray(row)) return row;

        const [id, clientId, clientName, type, total, table] = row;

        return [id, clientId, clientName, type, table ?? ""];
    };
    
    const fetchData = async () => {
        const fetched = await getTableData('sales');
        setData(fetched.map(sanitizeRow));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const setSanitizedData = (rows) => setData(rows.map(sanitizeRow));

    return [data, setSanitizedData];
}

export function useHeaderButtons(setData) {
    const navigate = useNavigate();
    const sanitizeRow = (row) => {
        if (!Array.isArray(row)) return row;
        const [id, clientId, clientName, type, total, table] = row;
        return [id, clientId, clientName, type, table ?? ""];
    };
    
    const onNew = (id) => navigate(routes['Informacion de Venta']);

    const onSearch = async (id) => {
        const fetched = await getTableData(`search/sales/${id}`);
        setData(fetched.map(sanitizeRow));
    };

    return [onNew, onSearch];
}

export function useActionButtons() {
    const navigate = useNavigate();
    const idChanger = useSaleIDChanger();
    
    const onInfo = (id) => {
        
        const loadAndshowAlert = async () => {
            const fetched = await getSaleDetails(id);
            
            if (!fetched) {
                return;
            }
            
            const client = {
                id: fetched.ClientIdDocument,
                name: fetched.ClientName
            };
            
            const products = Array.isArray(fetched.products) ? fetched.products : [];

            const productsArray = [];

            products.forEach((product) => productsArray.push([
                product.Name, 
                Number.parseFloat(product.Price).toFixed(2),
                product.Quantity
            ]));

            const productsTotalUsd = products.reduce((sum, product) => sum + (Number(product.Price) * Number(product.Quantity)), 0);
            const deliveryPriceUsd = Number(fetched.DeliveryPrice ?? 0);
            const totalUsdConDelivery = productsTotalUsd + deliveryPriceUsd;

            const totalBsNumber = fetched.TotalBs !== null && fetched.TotalBs !== undefined
                ? Number(fetched.TotalBs)
                : null;

            const exchangeRate = (totalBsNumber && totalUsdConDelivery)
                ? Number((totalBsNumber / totalUsdConDelivery).toFixed(4))
                : null;

            const deliveryPriceBs = (exchangeRate && deliveryPriceUsd)
                ? Number((deliveryPriceUsd * exchangeRate).toFixed(2))
                : null;

            saleAlert(
                fetched.ID,
                client,
                fetched.Type,
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
        };

        loadAndshowAlert();
    }; 

    const onDeleteClick = (id, hideRow) => {
        onDelete('sales', () => id, () => {
            successAlert("Completado", "Registro exitosamente eliminado");
            hideRow();
        });
    };

    const onEdit = (id) => {
        idChanger(id);
        navigate(routes['Edicion de Venta']);
    };

    const onTicket = (id) => {

        const print = async () => {
            const fetched = await getSaleDetails(id);
            
            if (!fetched) {
                console.error("No se pudieron cargar los datos de la venta");
                return;
            }
            
            const client = {
                id: fetched.ClientIdDocument,
                name: fetched.ClientName
            };
            
            const products = Array.isArray(fetched.products) ? fetched.products : [];

            const productsArray = [];

            products.forEach((product) => productsArray.push({
                nombre: product.Name, 
                cantidad: product.Quantity,
                precio: Number(product.Price)  // Precio unitario, no total
            }));

            const totalUsd = products.reduce((sum, product) => sum + (Number(product.Price) * Number(product.Quantity)), 0);
            const exchangeRateFromSale = (fetched.TotalBs && totalUsd)
                ? Number((fetched.TotalBs / totalUsd).toFixed(4))
                : null;

            await printOrderTicket({
                id: fetched.ID,
                type: fetched.Type,
                address: fetched.Address || null,
                note: fetched.Note || null,
                deliverymanName: fetched.DeliverymanName || null,
                tableNumber: fetched.TableNumber || null,
                paymentMethod: fetched.PaymentMethod || null,
                totals: {
                    totalBs: fetched.TotalBs ?? null,
                    exchangeRate: exchangeRateFromSale,
                },
                client: client,
                products: productsArray
            });
        };

        print();
    };

    return [onDeleteClick, onInfo, onEdit, onTicket];
}

