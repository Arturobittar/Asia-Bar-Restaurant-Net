import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useOrderInfoChanger, useOrderClearer } from "../hooks/order.js";
import { useFormFields } from "../hooks/form.js";
import { useClientSearch } from "../hooks/useClientSearch.js";

import DashboardPage from "./reusables/dashboard-page.js";
import Form from "../components/layout/form.js";

import { SubmitButton } from '../components/ui/buttons.js';
import { RequiredInputBox, RequiredSelector } from '../components/ui/form.js';

import { routes } from '../config/routes.js';
import { saleOptions } from '../config/tables.js';

function onSubmitInfo(e, navigate, infoChanger) {
    e.preventDefault();
    infoChanger();
    navigate(routes['Pedido']);
}

export default function InformacionVenta() {
    const clearer = useOrderClearer();
    
    useEffect(() => {
        clearer();
    }, []);

    const [values, setters] = useFormFields(4);
    const [documento, nombre, tipoVenta, direccion] = values;
    const [setDocumento, setNombre, setTipoVenta, setDireccion] = setters;
    const [clienteEncontrado, setClienteEncontrado] = useState(false);

    // Manejar cuando se encuentra un cliente
    const handleClientFound = (client) => {
        if (client) {
            setNombre(client.Name || '');
            setDireccion(client.Address || '');
            setClienteEncontrado(true);
        } else {
            setClienteEncontrado(false);
        }
    };

    // Usar el hook de búsqueda de cliente
    const { isSearching, searchError, clientNotFound, createNewClient, lastSearch } = useClientSearch(documento, handleClientFound, setDocumento);

    const infoChanger = useOrderInfoChanger(documento, nombre, tipoVenta, direccion);
    const navigate = useNavigate();
    
    // Limpiar nombre y dirección si se borra el documento
    useEffect(() => {
        if (!documento) {
            setNombre('');
            setDireccion('');
            setClienteEncontrado(false);
        }
    }, [documento, setNombre, setDireccion]);
    
    return (
        <DashboardPage 
            content={
                <Form onSubmit={ (e) => onSubmitInfo(e, navigate, infoChanger) } title={ "Información de Venta" } >
                    <div className="space-y-4">
                        <div className="relative">
                            <RequiredInputBox 
                                title={ "Documento de Identidad del Cliente" } 
                                textSetter={setDocumento}
                                value={documento || ''}
                                disabled={isSearching}
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-10 text-blue-500 text-sm">
                                    Buscando...
                                </div>
                            )}
                            {searchError && !isSearching && (
                                <div className="text-red-500 text-sm mt-1">
                                    {searchError}
                                    {clientNotFound && (
                                        <button 
                                            type="button"
                                            onClick={() => createNewClient(lastSearch)}
                                            className="ml-2 text-blue-500 hover:underline focus:outline-none"
                                        >
                                            ¿Desea crear un nuevo cliente?
                                        </button>
                                    )}
                                </div>
                            )}
                            {/* Se ha eliminado el mensaje 'Cliente encontrado' */}
                        </div>
                        
                        <RequiredInputBox 
                            title={ "Nombre del Cliente" } 
                            textSetter={setNombre} 
                            value={nombre || ''}
                            disabled={clienteEncontrado}
                        />
                        
                        <RequiredSelector 
                            title={ "Tipo de Venta" } 
                            options={saleOptions} 
                            textSetter={setTipoVenta} 
                            value={tipoVenta || ''}
                        />  
                        
                        {   
                            (tipoVenta === saleOptions[2]) && (
                                <RequiredInputBox 
                                    title={"Dirección"} 
                                    textSetter={setDireccion} 
                                    value={direccion || ''}
                                    disabled={clienteEncontrado}
                                />
                            )
                        } 

                        <div className="pt-4">
                            <SubmitButton 
                                text={"Continuar"} 
                                disabled={isSearching || (documento && !nombre)}
                            />
                        </div>
                    </div>
                </Form>
            }
        />
    );
}
