import { useState, useEffect } from "react";

import { Search } from "lucide-react";
import './form.css';

import { idTypes, phonePrefixes, cityOptions } from "../../config/tables.js";

function InputBoxWrapper({ title, children }) {
    return(
        <div className="input-box">
            {   
                !title ? null : (
                    <label className="input-title" htmlFor={ title }>
                        { title }
                    </label>
                )
            }
            { children }
        </div>
    );
}

function SimpleRequiredInput({ type = 'text', title, placeholder, onChange, regex, value, options }) {
    return (
        <input 
            className="simple-input"
            type={ type } 
            id={ title } 
            placeholder={ placeholder } 
            pattern={ regex } 
            onChange={ (e) => onChange(e.target.value) } 
            value={ value }
            { ...options }
            required
        >
        </input>
    );
}

export function RequiredInputBox({ title, onChange, type = 'text', regex, value, placeholder, options = {} }) {
    return(
        <InputBoxWrapper title={title}>
            <SimpleRequiredInput
                type={ type } 
                title={ title }
                placeholder={ placeholder ?? title } 
                regex={ regex } 
                onChange={ onChange } 
                value={ value }
                options={ options }
            />
        </InputBoxWrapper>
    );
}

export function RequiredNumberBox({ title, onChange, isDecimal = false, value }) {
    const inputValue = isDecimal ? parseFloat(value).toFixed(2) : value;  
    const minValue = isDecimal ? 0.01 : 1;
        
    return (
        <RequiredInputBox 
            title={ title }
            type={ "number" }
            onChange={ onChange }
            value={ inputValue }
            options = {{
                min: minValue,
                step: minValue
            }}
        />
    );
}

export function SearchInputBox({ onChange, value }) {
    return (
       <>
            <Search className="search-icon" />

            <input
                type="text"
                className="search-input-box"
                placeholder="Buscar"
                value={ value }
                onChange={ (e) => onChange(e.target.value) }
            />
        </>
    );
}

function Selector({ title, options, onChange, value }) {
    return(
        <InputBoxWrapper title={title}>
            <select 
                className="selector" 
                id={ title } 
                value={ value }
                onChange={ (e) => onChange(e.target.value) }
                required
            >
                { options.map( (option, i) => <option key={`${option}-${i}`} value={option}>{option}</option> ) }
            </select>
        </InputBoxWrapper>
    );
}

function RequiredCombo({ title, options, onChange, value, defaultValue, onSetDefault }) {
    useEffect(() => {
        onSetDefault(defaultValue);
    }, []);

    return(
        <Selector
            title={title}
            options={options}
            onChange={onChange}
            value={value}
        />
    );
}

export function RequiredSelector({ title, options, onChange, value }) {
    const defaultValue = value || options[0];

    return( 
        <RequiredCombo
            title={title}
            options={options}
            onChange={onChange}
            onSetDefault={onChange}
            defaultValue={defaultValue}
            value={defaultValue}
        />
    );
}

export function RequiredBoolean({ title, onChange, value }) {
    const defaultValue = value || 0;
    const options = ["No", "Sí"];

    return( 
        <RequiredCombo
            title={title}
            options={options}
            onChange={(eventValue) => onChange(eventValue === "Sí" ? 1 : 0)}
            onSetDefault={onChange}
            defaultValue={defaultValue}
            value={options[defaultValue]}
        />
    );
};

function getAllOptions(options) {
    const all = [...options];
    all.push("N/A");
    return all; 
}

export function RequiredOptionalSelector({ title, options, onChange, value }) {
    const allOptions = getAllOptions(options);

    const [selected, setSelected] = useState("");
    const [text, setText] = useState("");

    const isSelecting = selected !== "N/A";

    useEffect(() => {
        const found = options.find( (option) => option === value);
        setSelected(found ?? "N/A");
        setText(found ? "" : value);
    }, [value]);
    
    useEffect(() => {
        onChange(isSelecting ? selected : text);
    }, [isSelecting, selected, text]);

    return (
        <>
            <RequiredSelector
                title={title}
                options={allOptions}
                onChange={setSelected}
                value={selected}
            />

            {isSelecting ? null : 
                <RequiredInputBox
                    onChange={setText}
                    value={text}
                    placeholder={title}
                />
            }
        </>
    );
}

export function RequiredCityInput({ title, onChange, value }) {
    return(
        <RequiredOptionalSelector 
            title={title}
            onChange={onChange}
            value={value}
            options={cityOptions}
        />        
    );  
}

function getCombinedText(selectorText, inputText) {
    if (selectorText === "N/A")
        return inputText;

    return selectorText + inputText;
}

function parsePossibleOption(string, size) {
    const reversed = string.split('').reverse().join('');
    const numbers = reversed.slice(-size);
    const option = numbers.split('').reverse().join('');
    return option;
}

function RequiredInputSelector({ title, value, onChange, options, optionSize }) {
    const allOptions = getAllOptions(options);
    
    const possibleOption = parsePossibleOption(value, optionSize);
    const foundOption = options.find( (option) => option === possibleOption );
    
    const selected = foundOption || "N/A";
    const usesOption = selected !== "N/A";
    const displayValue = usesOption ? value.slice(optionSize) : value;

    const onChangeSelection = (option) => {
        onChange(getCombinedText(option, displayValue));
    };

    const onTextInput = (input) => {
        onChange(getCombinedText(selected, input));
    };

    return (
        <InputBoxWrapper title={title}> 
            <div className="phone-input-container">
                <div className="prefix-container">
                    <RequiredSelector
                        options={allOptions}
                        onChange={onChangeSelection}
                        value={selected}
                    />
                </div>

                <div className="phone-text-container">
                    <RequiredInputBox
                        onChange={onTextInput}
                        value={displayValue}
                    />
                </div>
            </div>
        </InputBoxWrapper>
    );
}

export function RequiredPhoneInput({ title, value, onChange }) {
    return (
        <RequiredInputSelector
            title={title}
            onChange={onChange}
            value={value}
            options={phonePrefixes}
            optionSize={4}
        />
    );
}

export function RequiredIdInput({ title, value, onChange }) {
    return (
        <RequiredInputSelector
            title={title}
            onChange={onChange}
            value={value}
            options={idTypes}
            optionSize={2}
        />
    );
}

export function RequiredInput({ type, title, onChange, value, options }) {
    const data = {
        title: title,
        onChange: onChange,
        value: value,
        options: options
    };

    return( 
        type === "text" ?
            <RequiredInputBox {...data} /> :
        type === "number" ? 
            <RequiredNumberBox isDecimal={ true } {...data} /> :
        type === "int" ? 
            <RequiredNumberBox {...data} /> :
        type === "combo" ?
            <RequiredSelector {...data} /> :
        type === "bool" ?
            <RequiredBoolean {...data} /> :
        type === "pseudocombo" ? 
            <RequiredOptionalSelector {...data} /> :
        type === "city" ?
            <RequiredCityInput {...data} /> :
        type === "phone" ?
            <RequiredPhoneInput {...data} /> :
        type === "id" ?
            <RequiredIdInput {...data} /> : null
    );
}

export function DisabledInputBox({ title, value }) {
    return (
        <InputBoxWrapper title={title} >
            <input 
                className="disabled-input"
                type="text" 
                id={ title } 
                value={ value }
                disabled
            >
            </input>
        </InputBoxWrapper>
    );
}

export function WarningText({ text }) {
    return (
        <p className="warning-text">{text}</p>
    );
}
