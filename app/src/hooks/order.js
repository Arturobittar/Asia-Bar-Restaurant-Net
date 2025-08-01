import { useState, useEffect, useMemo, useContext } from 'react';

import { getDishData } from '../utils/api.js';

import OrderContext from '../context/order.js';
import Order from '../utils/order.js';

const dbCategories = ["main-dish", "side-dish", "product"]
export const categories = [...dbCategories];
categories.push("all");

export function useOrder() {
    const { order, setOrder } = useContext(OrderContext);
    
    return useMemo(() => order, [order]);
}

export function useOrderInfoChanger(clientID, type) {
    const { order, setOrder } = useContext(OrderContext);

    const setNewInfo = async () => {
        const newOrder = await new Order(clientID, type, order.products, order.note); 
        await setOrder(newOrder);
        console.log(newOrder);
    };
    
    return () => setNewInfo();
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
    const { order } = useContext(OrderContext);
    const [products, setProducts] = useState(order.products || []);

    useEffect(() => {
        setProducts(order.products || []);
    }, [order.products]);

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
        const newOrder = await new Order(order.clientID, order.type, products, note); 
        await setOrder(newOrder);
        console.log(newOrder);
    };
    
    return () => setNewInfo();
}
