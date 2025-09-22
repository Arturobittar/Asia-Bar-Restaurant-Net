import { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { useNavigate } from "react-router-dom";

import { useFormFields } from './form.js';

import { getDishData, onCreate, findClient } from '../utils/api.js';
import { successAlert } from "../utils/alerts.js";

import OrderContext from '../context/order.js';
import Order from '../utils/order.js';

const dbCategories = ["main-dish", "side-dish", "product"]
export const categories = [...dbCategories];
categories.push("all");

export function useOrder() {
    const { order, setOrder } = useContext(OrderContext);
    
    return useMemo(() => order, [order]);
}

export function useOrderClearer() {
    const { order, setOrder } = useContext(OrderContext);

    const setNewInfo = async () => {
        const newOrder = await new Order(); 
        await setOrder(newOrder);
    };
    
    return () => setNewInfo();
};

export function useOrderDetailsChanger() {
    const { order, setOrder } = useContext(OrderContext);

    const setNewDetails = async (clientID, clientName, type, address) => {
        const newOrder = await new Order(clientID, clientName, type, address, order.products, order.note); 
        await setOrder(newOrder);
    };
    
    return setNewDetails;
}

export function useNewClientFormFields(clientID) {
    const [values, setters] = useFormFields(3);
    
    const getData = () => {
        return {
            iddocument: clientID,
            name: values[0],
            address: values[1],
            phone: values[2]
        }
    }

    return [values, setters, getData];
}

export function useOnDetailsSubmit() {
    const clearer = useOrderClearer();

    useEffect(() => {
        clearer();
    }, []);

    const navigate = useNavigate();
    const detailsChanger = useOrderDetailsChanger();

    return (e, isNewClient, getNewClientInfo, getOrderDetails, route) => {
        e.preventDefault();

        if (isNewClient)
            onCreate(
                e, 
                "clients", 
                getNewClientInfo, 
                () => successAlert("Cliente Agregado", "Los datos del cliente han sido correctamente registrados en el sistema")
            );

        const details = getOrderDetails();

        detailsChanger(details.clientID, details.clientName, details.type, details.address);

        navigate(route);
    } 
}

export function useDetailsGetter(clientID, isNewClient, newName, foundName, type, address) {
    const clientName = isNewClient ? newName : foundName;

    return () => { 
        return {
            clientID: clientID,
            clientName: clientName, 
            type: type,
            address: address
        }
    };
}

export function useClientFetchData(clientId) {
    const [foundClient, setFoundClient] = useState([]);

    const isNewClient = foundClient.length === 0;
    const foundName = isNewClient ? "" : foundClient[1];
    
    useEffect(() => {

        const fetchClient = async () => {
            const found = await findClient(clientId);
            setFoundClient(found);
        };

        fetchClient();

    }, [clientId]);

    return [isNewClient, foundName];
}

export function useCategory() {
    const [category, setCategory] = useState(categories[0]);

    const changeCategory = (index) => {
        setCategory(categories[index]);
    };

    return [category, changeCategory];
}

export function useDishes(category) {
    const [dishes, setDishes] = useState([]);

    const updateData = async () => {
        if (category === categories[dbCategories.length]) {
            const allDishes = [];

            for (const dbCategory of dbCategories) {
                const data = await getDishData(dbCategory);
                allDishes.push(...data);
            }

            setDishes(allDishes);

            return;
        }

        const data = await getDishData(category);

        setDishes(data);
    };

    useEffect( () => {
        updateData();
    }, [category]);

    return dishes;
}

export function useProducts() {
    const order = useOrder();

    const [products, setProducts] = useState(order.products);

    const addFirst = (product) => {
        const oldProductList = [...products];

        if (oldProductList.find( (found) => found[0] === product[0] ) )
            return;

        setProducts([...oldProductList, [...product, 1] ]);
    };

    const increase = (productName) => {
        const oldProductList = [...products];

        oldProductList.map( (product) => {
            if (product[0] === productName)
                product[3] += 1;
        });

        setProducts([...oldProductList]);
    };

    const decrease = (productName) => {
        const oldProductList = [...products];

        oldProductList.map( (product) => {
            if (product[0] === productName)
                product[3] -= 1;
        });

        const filteredProductList = oldProductList.filter( (product) => product[3] > 0 );

        setProducts([...filteredProductList]);
    }

    return [products, addFirst, increase, decrease];
}

export function useOrderChanger(products, note) {
    const { order, setOrder } = useContext(OrderContext);

    const setNewInfo = async () => {
        const newOrder = await new Order(order.clientID, order.clientName, order.type, order.address, products, note); 
        await setOrder(newOrder);
    };
    
    return () => setNewInfo();
}

export function useOrderInfo() {
    const order = useOrder();

    return () => [order.clientID, order.clientName, order.type, order.address];
};
