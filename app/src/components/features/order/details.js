import { useEffect, useRef, useState } from 'react';
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

export function OptionDropdown({
    label,
    placeholder,
    options,
    value,
    onChange,
    isLocked = false,
    dropdownId
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    const generatedId = dropdownId ?? `${label.toLowerCase().replace(/\s+/g, '-')}-selector`;

    useEffect(() => {
        const closeDropdown = (event) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                buttonRef.current?.focus();
            }
        };

        document.addEventListener('mousedown', closeDropdown);
        document.addEventListener('touchstart', closeDropdown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', closeDropdown);
            document.removeEventListener('touchstart', closeDropdown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    useEffect(() => {
        if (isLocked) {
            setIsOpen(false);
        }
    }, [isLocked]);

    const handleToggle = () => {
        if (isLocked) return;
        setIsOpen((prev) => !prev);
    };

    const handleToggleKeyDown = (event) => {
        if (isLocked) return;
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
            event.preventDefault();
            setIsOpen(true);
        }
    };

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
        buttonRef.current?.focus();
    };

    return (
        <div className="input-box margined custom-dropdown" ref={containerRef}>
            <label className="input-title" htmlFor={generatedId}>{label}</label>
            <button
                id={generatedId}
                type="button"
                className={`custom-dropdown__toggle ${isLocked ? 'is-locked' : ''}`}
                onClick={handleToggle}
                onKeyDown={handleToggleKeyDown}
                ref={buttonRef}
                aria-disabled={isLocked}
            >
                <span>{value || placeholder}</span>
                <span className="custom-dropdown__icon">▾</span>
            </button>

            {isOpen && (
                <div className="custom-dropdown__menu" role="listbox">
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            className={`custom-dropdown__option ${option === value ? 'is-selected' : ''}`}
                            onClick={() => handleSelect(option)}
                            role="option"
                            aria-selected={option === value}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}

            <select
                className="custom-dropdown__native-select"
                value={value || ''}
                onChange={(event) => {
                    if (!isLocked) {
                        onChange(event.target.value);
                    }
                }}
                required
                tabIndex={-1}
                disabled={isLocked}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((option) => (
                    <option key={`${generatedId}-hidden-${option}`} value={option}>{option}</option>
                ))}
            </select>
        </div>
    );
}

export function TypeInputs({ values, setters, deliverymanValue, deliverymanSetter, deliverymenOptions, tableValue, tableSetter, tableOptions, isTableLocked, isSaleTypeLocked }) {
    return(
        <>
            <RequiredInput
                type="combo"
                title="Tipo de Venta"
                options={saleOptions}
                onChange={setters[0]}
                value={values[0]}
                selectorProps={{ disabled: isSaleTypeLocked }}
            />  
            
            {   
                (values[0] === saleOptions[0]) ? (
                    <OptionDropdown
                        label="Mesa"
                        placeholder="Selecciona una mesa"
                        options={tableOptions}
                        value={tableValue}
                        onChange={tableSetter}
                        isLocked={isTableLocked}
                        dropdownId="mesa-selector"
                    />
                ) : null
            }
            
            {   
                (values[0] === saleOptions[2]) ? (
                    <>
                        <OptionDropdown
                            label="Repartidor"
                            placeholder="Selecciona un repartidor"
                            options={deliverymenOptions}
                            value={deliverymanValue}
                            onChange={deliverymanSetter}
                            dropdownId="repartidor-selector"
                        />
                        <RequiredInput type="text" title="Dirección" onChange={ setters[1] } value={values[1]} />
                    </>
                ) : null
            } 
        </>
    );
}

export function OrderDetailsContent({ clientId, setClientId, isNewClient, foundName, newClientValues, newClientSetters, typeValues, typeSetters, deliverymanValue, deliverymanSetter, deliverymenOptions, tableValue, tableSetter, tableOptions, isTableLocked, isSaleTypeLocked, paymentMethod, paymentMethodSetter }) {
    return (
        <>
            <RequiredInput type="id" title="Documento de Identidad del Cliente" value={clientId} onChange={setClientId} />

            <ClientInfo isNewClient={isNewClient} foundName={foundName} values={newClientValues} setters={newClientSetters} />

            <TypeInputs
                values={typeValues}
                setters={typeSetters}
                deliverymanValue={deliverymanValue}
                deliverymanSetter={deliverymanSetter}
                deliverymenOptions={deliverymenOptions}
                tableValue={tableValue}
                tableSetter={tableSetter}
                tableOptions={tableOptions}
                isTableLocked={isTableLocked}
                isSaleTypeLocked={isSaleTypeLocked}
            />

            <RequiredInput
                type="text"
                title="Método de Pago"
                value={paymentMethod}
                onChange={paymentMethodSetter}
            />

            <SubmitButton text="Continuar" />
        </>
    );
}
