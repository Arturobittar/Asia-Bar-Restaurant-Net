import { useEffect, useRef, useState } from 'react';
import { RequiredInput, WarningText, DisabledInputBox } from '../../ui/form.js';
import { SubmitButton } from '../../ui/buttons.js';

import { saleOptions } from '../../../config/tables.js';
import { formatSequentialCurrencyInput, createDropdown } from '../../../config/fn-reusables.js';

import { useCallback } from 'react';

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

    return (
        <>
            {inputs.map((input, i) => 
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
    value, 
    onChange, 
    options, 
    placeholder = "Selecciona", 
    dropdownId,
    isLocked = false 
}) {
    const Dropdown = useCallback(createDropdown, []);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    const generatedId = dropdownId ?? `${label?.toLowerCase().replace(/\s+/g, '-')}-selector`;

    useEffect(() => {
        const closeDropdown = (event) => {
            if (!containerRef.current || !event.target) return;
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

    if (isLocked) {
        return (
            <DisabledInputBox 
                title={label} 
                value={value} 
            />
        );
    }

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
        buttonRef.current?.focus();
    };

    const handleToggle = () => {
        if (isLocked) return;
        setIsOpen(!isOpen);
    };

    const handleKeyDown = (e) => {
        if (isLocked) return;
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            setIsOpen(true);
        }
    };

    return (
        <div className="input-box margined">
            {label && <label className="input-title" htmlFor={generatedId}>{label}</label>}
            <div className="custom-dropdown" ref={containerRef}>
                <button
                    type="button"
                    className="custom-dropdown__toggle"
                    onClick={handleToggle}
                    onKeyDown={handleKeyDown}
                    ref={buttonRef}
                    id={generatedId}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
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
                    onChange={(e) => onChange(e.target.value)}
                    tabIndex={-1}
                    required
                    aria-hidden="true"
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((option) => (
                        <option key={`${generatedId}-hidden-${option}`} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
export function TypeInputs({ values, setters, deliverymanValue, deliverymanSetter, deliverymenOptions, tableValue, tableSetter, tableOptions, isTableLocked, isSaleTypeLocked }) {
    const deliveryPriceValue = values[2] ?? '0.00';

    const handleDeliveryPriceChange = (inputValue) => {
        setters[2](formatSequentialCurrencyInput(inputValue));
    };

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
                        <RequiredInput type="text" title="Dirección" onChange={setters[1]} value={values[1]} />
                        <RequiredInput
                            type="text"
                            title="Precio delivery ($)"
                            onChange={handleDeliveryPriceChange}
                            value={deliveryPriceValue}
                            options={{ inputMode: 'decimal' }}
                        />
                    </>
                ) : null
            } 
        </>
    );
}

export function OrderDetailsContent({ clientId, setClientId, isNewClient, foundName, newClientValues, newClientSetters, typeValues, typeSetters, deliverymanValue, deliverymanSetter, deliverymenOptions, tableValue, tableSetter, tableOptions, isTableLocked, isSaleTypeLocked }) {
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

            <SubmitButton text="Continuar" />
        </>
    );
}
