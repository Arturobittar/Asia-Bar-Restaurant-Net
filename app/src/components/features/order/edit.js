import { Trash, CirclePlus } from "lucide-react";

import './edit.css';

function ProductInput({name, value, onChange, type = "text"}) {
    const isNumber = type === "number" || type === "int";
    const min = !isNumber ? null : type === "int" ? 1 : 0.01;

    return(
        <div className="product-input-container">
            <p className="product-input-title">{name}</p>
            <input
                className="product-input"
                type={type === "int" ? "number" : type}
                min={min}
                step={min}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={name}
                required
            >
            </input>
        </div>
    );
}

function ProductCard({ name, cost, quantity, onDelete }) {
    return(
        <div className="product-card">
            <ProductInput name={"Nombre"} value={name.value} onChange={name.setter} />
            <ProductInput name={"Costo ($)"} type="number" value={cost.value} onChange={cost.setter} />
            <ProductInput name={"Cant."} type="int" value={quantity.value} onChange={quantity.setter} />
            <Trash className="trash-icon" size={25} color="#5a5a5a" onClick={() => onDelete(name.value) } /> 
        </div>
    );
}

export function EditProductsSection({ products, onAdd, onDelete }) {
    const getFieldSetter = (product, i) => (newValue) => {
        const newProduct = product.value || "";
        newProduct[i] = newValue;
        product.setter(newProduct);
    };

    const fields = ["name", "cost", "quantity"];

    return (
        <div className="edit-products-container">
            {
                products.map((product) => {

                    const getFieldProp = (field, i) => ({ 
                        value: product.value[i], 
                        setter: getFieldSetter(product, i) 
                    });

                    const props = fields.reduce((object, field, i) => ({...object, [field]: getFieldProp(field, i)}), {});

                    return(
                        <ProductCard {...props} onDelete={onDelete} />
                    );
                })
            }
            <div className="plus-icon-container">
                <CirclePlus className="plus-icon" size={25} color="#5a5a5a"  onClick={onAdd} /> 
            </div> 
        </div>
    );
}
