import { useState, useEffect, useRef } from "react";

import { Search } from "lucide-react";
import './form.css';

import { idTypes, phonePrefixes, cityOptions } from "../../config/tables.js";

function DropdownSelect({
    value,
    onChange,
    options,
    placeholder = "Selecciona",
    dropdownId,
    disabled = false,
    className = '',
    listSize
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const closeDropdown = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target))
                setIsOpen(false);
        };

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                buttonRef.current?.focus();
            }
        };

        document.addEventListener('mousedown', closeDropdown);
        document.addEventListener('touchstart', closeDropdown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', closeDropdown);
            document.removeEventListener('touchstart', closeDropdown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    const handleSelect = (option) => {
        if (disabled) return;

        onChange(option);
        setIsOpen(false);
        buttonRef.current?.focus();
    };

    const handleToggle = () => {
        if (disabled) return;
        setIsOpen((prev) => !prev);
    };

    const handleKeyDown = (event) => {
        if (disabled) return;

        if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
            event.preventDefault();
            setIsOpen(true);
        }
    };

    const combinedClassName = ['custom-dropdown', className, disabled ? 'is-disabled' : '']
        .filter(Boolean)
        .join(' ');
    const menuStyle = listSize ? { maxHeight: `${Number(listSize) * 40}px` } : undefined;

    return (
        <div className={combinedClassName} ref={containerRef}>
            <button
                type="button"
                className={`custom-dropdown__toggle ${disabled ? 'is-disabled' : ''}`.trim()}
                onClick={handleToggle}
                onKeyDown={handleKeyDown}
                ref={buttonRef}
                id={dropdownId}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-disabled={disabled}
            >
                <span>{value || placeholder}</span>
                <span className="custom-dropdown__icon">▾</span>
            </button>

            {isOpen && (
                <div className="custom-dropdown__menu" role="listbox" style={menuStyle}>
                    {options.map((option) => (
                        <button
                            key={`${dropdownId}-option-${option}`}
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
                    if (disabled) return;
                    onChange(event.target.value);
                }}
                tabIndex={-1}
                required
                aria-hidden="true"
                disabled={disabled}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((option) => (
                    <option key={`${dropdownId}-hidden-${option}`} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

function InputBoxWrapper({ title, children, hasMargin = true }) {
    return(
        <div className={`input-box ${hasMargin ? "margined" : ""}`}>
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

function RequiredTextarea({ title, onChange, value, placeholder, hasMargin = true }) {
    return (
        <InputBoxWrapper title={title} hasMargin={hasMargin}>
            <textarea
                className="simple-input textarea-input"
                id={ title }
                placeholder={ placeholder ?? title }
                value={ value }
                onChange={ (e) => onChange(e.target.value) }
                required
            ></textarea>
        </InputBoxWrapper>
    );
}

export function OptionalTextarea({ title, onChange, value, placeholder, hasMargin = true }) {
    return (
        <InputBoxWrapper title={title} hasMargin={hasMargin}>
            <textarea
                className="simple-input textarea-input"
                id={ title }
                placeholder={ placeholder ?? title }
                value={ value }
                onChange={ (e) => onChange(e.target.value) }
            ></textarea>
        </InputBoxWrapper>
    );
}

export function RequiredInputBox({ title, onChange, type = 'text', regex, value, placeholder, options = {}, hasMargin = true }) {
    return(
        <InputBoxWrapper title={title} hasMargin={hasMargin}>
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

export function Selector({
    title,
    options = [],
    onChange,
    value,
    hasMargin = true,
    listSize,
    className,
    disabled = false,
    placeholder = 'Selecciona',
    dropdownId
}) {
    const generatedId = dropdownId ?? (title ? `${title.toLowerCase().replace(/\s+/g, '-')}-selector` : undefined);
    const combinedClassName = [className, disabled ? 'selector--disabled' : '']
        .filter(Boolean)
        .join(' ');

    return(
        <InputBoxWrapper title={title} hasMargin={hasMargin}>
            <DropdownSelect
                value={value}
                onChange={onChange}
                options={options}
                placeholder={placeholder ?? title ?? 'Selecciona'}
                dropdownId={generatedId}
                disabled={disabled}
                className={combinedClassName}
                listSize={listSize}
            />
        </InputBoxWrapper>
    );
}

function RequiredCombo({ title, options, onChange, value, defaultValue, onSetDefault, hasMargin = true, listSize, className, disabled = false }) {
    useEffect(() => {
        onSetDefault(defaultValue);
    }, []);

    return(
        <Selector
            title={title}
            options={options}
            onChange={onChange}
            value={value}
            hasMargin={hasMargin}
            listSize={listSize}
            className={className}
            disabled={disabled}
        />
    );
}

export function RequiredSelector({ title, options, onChange, value, hasMargin = true, listSize, className, disabled = false }) {
    const defaultValue = value || options[0];

    return( 
        <RequiredCombo
            title={title}
            options={options}
            onChange={onChange}
            onSetDefault={onChange}
            defaultValue={defaultValue}
            value={defaultValue}
            hasMargin={hasMargin}
            listSize={listSize}
            className={className}
            disabled={disabled}
        />
    );
}

export function RequiredBoolean({ title, onChange, value, listSize, className }) {
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
            listSize={listSize}
            className={className}
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
            <div className="input-selector-container">
                <div className="prefix-container">
                    <DropdownSelect
                        options={allOptions}
                        value={selected}
                        onChange={onChangeSelection}
                        placeholder={title}
                        dropdownId={`${title}-prefix-selector`}
                    />
                </div>

                <div className="input-selector-text-container">
                    <RequiredInputBox
                        onChange={onTextInput}
                        value={displayValue}
                        placeholder={title}
                        hasMargin={false}
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

export function RequiredInput({ type, title, onChange, value, options, selectorProps = {} }) {
    const data = {
        title,
        onChange,
        value,
        options
    };

    const { listSize, className, disabled: selectorDisabled } = selectorProps;

    return( 
        type === "text" ?
            <RequiredInputBox {...data} /> :
        type === "number" ? 
            <RequiredNumberBox isDecimal={ true } {...data} /> :
        type === "int" ? 
            <RequiredNumberBox {...data} /> :
        type === "combo" ?
            <RequiredSelector {...data} listSize={listSize} className={className} disabled={selectorDisabled} /> :
        type === "bool" ?
            <RequiredBoolean {...data} listSize={listSize} className={className} /> :
        type === "pseudocombo" ? 
            <RequiredOptionalSelector {...data} /> :
        type === "city" ?
            <RequiredCityInput {...data} /> :
        type === "phone" ?
            <RequiredPhoneInput {...data} /> :
        type === "id" ?
            <RequiredIdInput {...data} /> :
        type === "textarea" ?
            <RequiredTextarea {...data} /> : null
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

export function OptionalInput({ type, ...rest }) {
    if (type === "textarea") {
        return <OptionalTextarea {...rest} />;
    }

    return <RequiredInput type={type} {...rest} />;
}
