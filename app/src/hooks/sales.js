import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { useFormFields, usePairs } from './form.js';

import { getTableData, getRegisterData, onDelete, onUpdateSale } from '../utils/api.js';
import { successAlert, saleAlert } from '../utils/alerts.js';

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
    const [values, setters] = useFormFields(3);

    let areProductsInitialized = false;

    useEffect(() => {
        const getValues = async () => {
            const fetched = await getRegisterData('sales/details', id); 

            setters.forEach((setter, i) => setter(fetched[i + 1]));

            const products = fetched[4];

            const productsArray = [];

            products.forEach((product) => productsArray.push([
                product.Name, 
                Number.parseFloat(product.Price).toFixed(2),
                product.Quantity
            ]));

            if (!areProductsInitialized)
                productsArray.forEach((product) => saleProducts.push(product) );

            areProductsInitialized = true;
        };
        
        getValues();
    }, []);

    const onAddProduct = () => saleProducts.push(["", 0, 0]);

    const onDeleteProduct = (name) => saleProducts.deleteIf((product) => product[0] === name);

    return [values, setters, saleProducts, onAddProduct, onDeleteProduct];
}

export function useOnEditContinue(id, client, type, products) {
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
    
    const fetchData = async () => {
        const fetched = await getTableData('sales');
        setData(fetched);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return [data, setData];
}

export function useHeaderButtons(setData) {
    const navigate = useNavigate();
    
    const onNew = (id) => navigate(routes['Informacion de Venta']);

    const onSearch = async (id) => {
        const fetched = await getTableData(`search/sales/${id}`);
        setData(fetched);
    };

    return [onNew, onSearch];
}

export function useActionButtons() {
    const navigate = useNavigate();
    const idChanger = useSaleIDChanger();
    
    const onInfo = (id) => {
        
        const loadAndshowAlert = async () => {
            const fetched = await getRegisterData('sales/details', id); 
            const client = {
                id: fetched[1],
                name: fetched[2]
            };
            
            const products = fetched[4];

            const productsArray = [];

            products.forEach((product) => productsArray.push([
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

    return [onDeleteClick, onInfo, onEdit];
}

