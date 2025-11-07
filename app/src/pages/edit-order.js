import { useNavigate } from "react-router-dom";
import { useFormFields } from "../hooks/form.js";
import { useSaleID, useEditSaleFormFields, useOnEditContinue } from "../hooks/sales.js";

import ControlForm from '../components/layout/control-form.js';

import { RequiredInput } from '../components/ui/form.js';

import { saleOptions } from '../config/tables.js';

import { routes } from '../config/routes.js';

import { EditProductsSection } from '../components/features/order/edit.js';

function EditOrder() {

    const id = useSaleID();

    const [values, setters, products, onAdd, onDelete] = useEditSaleFormFields();

    const client = {
        id: values[0],
        name: values[1]
    };

    const type = values[2];
    const address = values[3];
    const deliverymanName = values[4];
    const tableNumber = values[5];
    const note = values[6];

    const isDelivery = type === saleOptions[2]; // "Delivery" es la tercera opción
    const isEatHere = type === saleOptions[0]; // "Comer Aquí" es la primera opción

    const onContinue = useOnEditContinue(id, client, type, address, deliverymanName, tableNumber, note, products);

    return (
        <ControlForm title={`Venta N°${id}`} backRoute={routes['Control de Ventas']} onSubmit={onContinue} > 
            <RequiredInput type="id" title="Identificación del Cliente" onChange={setters[0]} value={values[0]} /> 
            <RequiredInput type="text" title="Nombre del Cliente" onChange={setters[1]} value={values[1]} /> 
            <RequiredInput type="combo" title="Tipo de Venta" onChange={setters[2]} value={values[2]} options={ saleOptions } /> 
            
            {isDelivery && (
                <>
                    <RequiredInput type="text" title="Dirección" onChange={setters[3]} value={address} />
                    <RequiredInput type="text" title="Nombre del Repartidor" onChange={setters[4]} value={deliverymanName} />
                </>
            )}

            {isEatHere && (
                <RequiredInput type="text" title="Mesa" onChange={setters[5]} value={tableNumber} />
            )}

            <RequiredInput type="textarea" title="Nota" onChange={setters[6]} value={note} />
        
            <EditProductsSection 
                products={products} 
                onAdd={onAdd}
                onDelete={onDelete}
            />
            
        </ControlForm>
    );
};

export default EditOrder;
