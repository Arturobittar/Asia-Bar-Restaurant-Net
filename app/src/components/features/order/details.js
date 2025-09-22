import { RequiredInput, WarningText, DisabledInputBox } from '../../ui/form.js';
import { SubmitButton } from '../../ui/buttons.js';

import { saleOptions } from '../../../config/tables.js';

function Input(title, type) {
    this.title = title;
    this.type = type;
}

function NewClientInputs({ values, setters }) {
    const inputs = [
        new Input("Nombre del Cliente", "text"),
        new Input("Dirección del Cliente", "city"),
        new Input("Teléfono del Cliente", "phone")
    ];

    const totalInputs = inputs.length;

    return (
        <>
            {inputs.map( (input, i) => 
                <RequiredInput 
                    key={`${input.title}-${i}`}
                    type={input.type}
                    title={input.title}
                    value={values[i]}
                    onChange={setters[i]}
                />
            )}
        </>
    );
}

function NewClientInfo({ values, setters }) {
    return(
        <>
            <WarningText text="Documento de Identidad no encontrado. Por favor, ingrese el resto de los datos del cliente." />
            <NewClientInputs values={values} setters={setters} />
        </>
    );
} 

export function ClientInfo({ isNewClient, foundName, values, setters }) {
    return isNewClient ? 
        <NewClientInfo values={values} setters={setters}/> : 
        <DisabledInputBox title="Nombre de Cliente Encontrado" value={foundName} />;
}

export function TypeInputs({ values, setters }) {
    return(
        <>
            <RequiredInput type="combo" title="Tipo de Venta" options={saleOptions} onChange={setters[0]} value={values[0]} />  
            
            {   
                (values[0] === saleOptions[2]) ? 
                    <RequiredInput type="text" title="Dirección" onChange={ setters[1] } /> : null
            } 
        </>
    );
}

export function OrderDetailsContent({ clientId, setClientId, isNewClient, foundName, newClientValues, newClientSetters, typeValues, typeSetters }) {
    return (
        <>
            <RequiredInput type="id" title="Documento de Identidad del Cliente" value={clientId} onChange={setClientId} />

            <ClientInfo isNewClient={isNewClient} foundName={foundName} values={newClientValues} setters={newClientSetters} />

            <TypeInputs values={typeValues} setters={typeSetters} />

            <SubmitButton text="Continuar" />
        </>
    );
}
