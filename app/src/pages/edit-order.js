import { useEffect, useMemo, useState } from "react";
import { useSaleID, useEditSaleFormFields, useOnEditContinue } from "../hooks/sales.js";
import { getTableData, findClient } from "../utils/api.js";
import { OptionDropdown } from "../components/features/order/details.js";


import ControlForm from '../components/layout/control-form.js';

import { RequiredInput, OptionalInput, Selector } from '../components/ui/form.js';

import { saleOptions, tableOptions } from '../config/tables.js';

import { routes } from '../config/routes.js';

import { EditProductsSection } from '../components/features/order/edit.js';

const PRODUCT_SOURCES = [
    { table: 'main-dish', categoryId: 'main-dish' },
    { table: 'side-dish', categoryId: 'side-dish' },
    { table: 'product', categoryId: 'product' }
];

function RepartidorDropdown({ value, onChange }) {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const fetchDeliverymen = async () => {
            try {
                const data = await getTableData('deliverymen');
                let available = data
                    .filter((deliveryman) => deliveryman[2] === 1)
                    .map((deliveryman) => deliveryman[0]);

                if (value && !available.includes(value)) {
                    available = [...available, value];
                }

                if (isMounted) {
                    setOptions(available);
                }
            } catch (error) {
                console.error('No se pudieron cargar los repartidores', error);
            }
        };

        fetchDeliverymen();

        return () => {
            isMounted = false;
        };
    }, [value]);

    return (
        <Selector
            title="Repartidor"
            options={options}
            onChange={onChange}
            value={value}
            placeholder="Selecciona un repartidor"
            dropdownId="repartidor-selector"
        />
    );
}
function MesaDropdown({ value, onChange }) {
    return (
        <Selector
            title="Mesa"
            options={tableOptions}
            onChange={onChange}
            value={value}
            placeholder="Selecciona una mesa"
            dropdownId="mesa-selector"
        />
    );
}

function EditOrder() {

    const id = useSaleID();

    const [values, setters, products, onAdd, onDelete] = useEditSaleFormFields();
    const [productCatalog, setProductCatalog] = useState([]);
    
    useEffect(() => {
        if (!values[0]) {
            return;
        }

        let isMounted = true;

        const fetchClient = async () => {
            try {
                const found = await findClient(values[0]);

                if (!isMounted || !found || found.length === 0) {
                    return;
                }

                const fetchedName = found[1] ?? "";
                if (fetchedName) {
                    setters[1](fetchedName);
                }
            } catch (error) {
                console.error("No se pudo buscar al cliente", error);
            }
        };

        fetchClient();

        return () => {
            isMounted = false;
        };
    }, [values[0]]);

    useEffect(() => {
        let isMounted = true;

        const fetchProducts = async () => {
            try {
                const responses = await Promise.all(
                    PRODUCT_SOURCES.map(async ({ table, categoryId }) => {
                        const data = await getTableData(table);
                        return data.map((entry) => {
                            const [name,, price] = entry;
                            return {
                                name,
                                price: Number.parseFloat(price ?? 0).toFixed(2),
                                categoryId
                            };
                        });
                    })
                );

                if (!isMounted) {
                    return;
                }

                setProductCatalog(responses.flat());
            } catch (error) {
                console.error('No se pudieron cargar los productos', error);
            }
        };

        fetchProducts();

        return () => {
            isMounted = false;
        };
    }, []);

    const productOptions = useMemo(() => {
        const catalogMap = new Map(productCatalog.map((product) => [product.name, product]));

        products.forEach(({ value }) => {
            const [existingName, existingPrice] = value || [];

            if (!existingName || catalogMap.has(existingName)) {
                return;
            }

            catalogMap.set(existingName, {
                name: existingName,
                price: Number.parseFloat(existingPrice ?? 0).toFixed(2),
                categoryId: 'product'
            });
        });

        return Array.from(catalogMap.values());
    }, [productCatalog, products]);

    const client = {
        id: values[0],
        name: values[1]
    };

    const type = values[2];
    const address = values[3];
    const deliverymanName = values[4];
    const tableNumber = values[5];
    const note = values[6];
    const paymentMethod = values[7];

    const isDelivery = type === saleOptions[2]; // "Delivery" es la tercera opción
    const isEatHere = type === saleOptions[0]; // "Comer Aquí" es la primera opción

    const onContinue = useOnEditContinue(id, client, type, address, deliverymanName, tableNumber, note, paymentMethod, products);

    return (
        <ControlForm title={`Venta N°${id}`} backRoute={routes['Control de Ventas']} onSubmit={onContinue} > 
            <RequiredInput type="id" title="Identificación del Cliente" onChange={setters[0]} value={values[0]} /> 
            <RequiredInput type="text" title="Nombre del Cliente" onChange={setters[1]} value={values[1]} /> 
            <OptionDropdown 
                label="Tipo de Venta"
                placeholder="Selecciona el tipo de venta"
                options={saleOptions}
                value={values[2]}
                onChange={setters[2]}
                dropdownId="tipo-venta-selector"
            /> 
            
            {isDelivery && (
                <>
                    <RequiredInput type="text" title="Dirección" onChange={setters[3]} value={address} />
                    <RepartidorDropdown value={deliverymanName} onChange={setters[4]} />
                </>
            )}

            {isEatHere && (
                <MesaDropdown value={tableNumber} onChange={setters[5]} />
            )}

            <OptionalInput type="textarea" title="Nota" onChange={setters[6]} value={note} />
        
            <EditProductsSection 
                products={products} 
                onAdd={onAdd}
                onDelete={onDelete}
                productOptions={productOptions}
            />
            
        </ControlForm>
    );
};

export default EditOrder;
