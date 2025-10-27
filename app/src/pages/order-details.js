import { useState, useEffect } from 'react';
import { useClientFetchData, useOnDetailsSubmit, useDetailsGetter, useNewClientFormFields } from "../hooks/order.js";
import { useFormFields } from "../hooks/form.js";

import DashboardPage from "../components/layout/dashboard-page.js";
import Form from "../components/layout/form.js";

import { OrderDetailsContent } from "../components/features/order/details.js";

import { routes } from '../config/routes.js';
import { getTableData } from '../utils/api.js';

export default function OrderDetails() {
    
    const onSubmit = useOnDetailsSubmit();

    const [clientId, setClientId] = useState("");
    const [isNewClient, foundName, foundAddress] = useClientFetchData(clientId);
    
    const [newClientValues, newClientSetters, getNewClientData] = useNewClientFormFields(clientId);
    const [typeValues, typeSetters] = useFormFields(2);
    
    // Establecer la dirección del cliente encontrado cuando cambia
    useEffect(() => {
        if (!isNewClient && foundAddress) {
            typeSetters[1](foundAddress);
        }
    }, [foundAddress, isNewClient]);
    
    const [deliverymanValue, setDeliverymanValue] = useState("");
    const [deliverymenOptions, setDeliverymenOptions] = useState([]);

    useEffect(() => {
        const fetchDeliverymen = async () => {
            const data = await getTableData('deliverymen');
            const availableDeliverymen = data
                .filter(d => d[2] === 1)
                .map(d => d[0]);
            setDeliverymenOptions(availableDeliverymen);
        };
        fetchDeliverymen();
    }, []);

    const detailsGetter = useDetailsGetter(clientId, isNewClient, newClientValues[0], foundName, typeValues[0], typeValues[1], deliverymanValue);
    
    return (
        <DashboardPage> 
            <Form onSubmit={ (e) => onSubmit(e, isNewClient, getNewClientData, detailsGetter, routes['Pedido']) } title="Información de Venta">
                <OrderDetailsContent
                    clientId={clientId}
                    setClientId={setClientId}
                    isNewClient={isNewClient}
                    foundName={foundName}
                    newClientValues={newClientValues}
                    newClientSetters={newClientSetters}
                    typeValues={typeValues}
                    typeSetters={typeSetters}
                    deliverymanValue={deliverymanValue}
                    deliverymanSetter={setDeliverymanValue}
                    deliverymenOptions={deliverymenOptions}
                /> 
            </Form>
        </DashboardPage>
    );
}
