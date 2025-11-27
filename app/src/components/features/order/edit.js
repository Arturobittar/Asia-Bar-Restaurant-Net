import { useEffect, useMemo, useRef, useState } from "react";
import { Trash, CirclePlus } from "lucide-react";

import './edit.css';

const CATEGORY_BUTTONS = [
    { id: 'main-dish', label: 'Menú' },
    { id: 'side-dish', label: 'Contorno' },
    { id: 'product', label: 'Producto' },
    { id: 'all', label: 'Todos' }
];

function ProductInput({name, value, onChange, type = "text", options = [], disabled = false}) {
    const isNumber = type === "number" || type === "int";
    const isSelect = type === "select";
    const min = !isNumber ? null : type === "int" ? 1 : 0.01;

    return(
        <div className="product-input-container">
            <p className="product-input-title">{name}</p>
            {isSelect ? (
                <select
                    className="product-input"
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    required
                >
                    <option value="" disabled hidden>
                        Selecciona un producto
                    </option>
                    {options.map((option) => (
                        <option key={option.name} value={option.name}>
                            {option.name}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    className="product-input"
                    type={type === "int" ? "number" : type}
                    min={min}
                    step={min}
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={name}
                    disabled={disabled}
                    required
                >
                </input>
            )}
        </div>
    );
}

function ProductComboBox({ value, onSelect, options = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState('all');
    const panelRef = useRef(null);
    const triggerRef = useRef(null);
    const [panelStyles, setPanelStyles] = useState({ top: 0, left: 0, width: 320 });
    const [displayValue, setDisplayValue] = useState(value ?? "");

    useEffect(() => {
        setDisplayValue(value ?? "");
    }, [value]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        window.addEventListener('mousedown', handleClickOutside);
        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const updatePanelPosition = () => {
            if (!triggerRef.current) {
                return;
            }

            const rect = triggerRef.current.getBoundingClientRect();
            const panelWidth = 320;
            const horizontalPadding = 16;
            const maxLeft = window.innerWidth - panelWidth - horizontalPadding;
            const desiredLeft = Math.max(horizontalPadding, Math.min(rect.left, maxLeft));

            const panelHeight = panelRef.current?.offsetHeight ?? 0;
            const gap = 8;
            const preferredTop = rect.top - panelHeight - gap;
            const minTop = 16;
            const hasSpaceAbove = preferredTop >= minTop;
            const fallbackTop = rect.bottom + gap;
            const top = hasSpaceAbove ? preferredTop : fallbackTop;

            setPanelStyles({
                top,
                left: desiredLeft,
                width: panelWidth
            });
        };

        updatePanelPosition();

        window.addEventListener('resize', updatePanelPosition);
        window.addEventListener('scroll', updatePanelPosition, true);

        return () => {
            window.removeEventListener('resize', updatePanelPosition);
            window.removeEventListener('scroll', updatePanelPosition, true);
        };
    }, [isOpen, category, options]);

    const filteredOptions = useMemo(() => {
        if (category === 'all') {
            return options;
        }

        return options.filter((product) => product.categoryId === category);
    }, [category, options]);

    const handleSelect = (product) => {
        if (!product) {
            return;
        }

        setDisplayValue(product.name);
        onSelect(product);
        setIsOpen(false);
    };

    return (
        <div className="product-combobox">
            <button
                type="button"
                className="product-input product-combobox__trigger"
                onClick={() => setIsOpen((prev) => !prev)}
                ref={triggerRef}
            >
                {displayValue || 'Selecciona un producto'}
            </button>

            {!isOpen ? null : (
                <div
                    className="product-combobox__panel"
                    ref={panelRef}
                    style={panelStyles}
                >
                    <div className="product-combobox__card">
                        <div className="product-combobox__articles">
                            {filteredOptions.length === 0 ? (
                                <p className="product-combobox__empty">No hay productos en esta categoría</p>
                            ) : (
                                filteredOptions.map((product) => (
                                    <button
                                        type="button"
                                        key={`${product.categoryId}-${product.name}`}
                                        className="product-combobox__article"
                                        onClick={() => handleSelect(product)}
                                    >
                                        <p className="product-combobox__article-title">{product.name}</p>
                                        <div className="product-combobox__divider" />
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="product-combobox__buttons">
                            {CATEGORY_BUTTONS.map((categoryOption) => (
                                <button
                                    type="button"
                                    key={categoryOption.id}
                                    className={`product-combobox__button${category === categoryOption.id ? ' product-combobox__button--active' : ''}`}
                                    onClick={() => setCategory(categoryOption.id)}
                                >
                                    {categoryOption.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ProductCard({ name, cost, quantity, onDelete, productOptions = [], onProductSelect }) {
    const isPriceLocked = productOptions.some((option) => option.name === name.value);

    return(
        <div className="product-card">
            <div className="product-input-container">
                <p className="product-input-title">Nombre</p>
                <ProductComboBox value={name.value} onSelect={onProductSelect ?? name.setter} options={productOptions} />
            </div>
            <ProductInput name={"Costo ($)"} type="number" value={cost.value} onChange={cost.setter} disabled={isPriceLocked} />
            <ProductInput name={"Cant."} type="int" value={quantity.value} onChange={quantity.setter} />
            <Trash className="trash-icon" size={25} color="#5a5a5a" onClick={onDelete} /> 
        </div>
    );
}

export function EditProductsSection({ products, onAdd, onDelete, productOptions = [] }) {
    const getFieldSetter = (product, i) => (newValue) => {
        const currentValue = Array.isArray(product.value) ? [...product.value] : ["", 0, 1, false];
        if (typeof currentValue[3] === "undefined") {
            currentValue[3] = false;
        }
        currentValue[i] = newValue;
        if (i === 0) {
            currentValue[3] = false;
        }
        product.setter(currentValue);
    };

    const fields = ["name", "cost", "quantity"];

    return (
        <div className="edit-products-container">
            <div className="edit-products-list">
                {
                    products.map((product, index) => {

                        const getFieldProp = (field, i) => ({ 
                            value: typeof product.value?.[i] === "undefined" ? "" : product.value[i], 
                            setter: getFieldSetter(product, i) 
                        });

                        const props = fields.reduce((object, field, i) => ({...object, [field]: getFieldProp(field, i)}), {});

                        const handleProductSelect = (selectedProduct) => {
                            const nextValue = Array.isArray(product.value) ? [...product.value] : ["", 0, 1, false];

                            if (selectedProduct) {
                                nextValue[0] = selectedProduct.name;
                                nextValue[1] = selectedProduct.price;
                                nextValue[3] = true;
                            }

                            product.setter(nextValue);
                        };

                        return(
                            <ProductCard 
                                key={`edit-product-${index}`}
                                {...props} 
                                onDelete={() => onDelete(index)} 
                                productOptions={productOptions}
                                onProductSelect={handleProductSelect}
                            />
                        );
                    })
                }
            </div>
            <div className="plus-icon-container">
                <CirclePlus className="plus-icon" size={25} color="#5a5a5a"  onClick={onAdd} /> 
            </div> 
        </div>
    );
}
