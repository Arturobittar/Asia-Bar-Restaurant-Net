import { useNavigate } from "react-router-dom";
import useTable from "../hooks/useTable.js";
import { useFormFields, useFormValues } from "../hooks/form.js";
import { useModifyID } from "../hooks/session.js";

import ControlForm from '../components/layout/control-form.js';

import { RequiredInput } from '../components/ui/form.js';

import { onControlForm } from '../utils/api.js';

import { fieldTypes } from '../config/tables.js';
import { formatSequentialCurrencyInput } from '../config/fn-reusables.js';
import { formatSequentialCurrencyInput } from '../config/fn-reusables.js';

function ControlFormPage() {

    const table = useTable();
    const modifyID = useModifyID();
    const tableFields = table.fields;
    
    const [fields, setters] = useFormFields(7);
    useFormValues(table.dbname, modifyID, setters);
    
    const navigate = useNavigate();

    const requiresSequentialPrice = ["Menú", "Contornos", "Productos"].includes(table.name);

    return (
        <ControlForm title={ table.name } onSubmit={ (e) => onControlForm(e, table, fields, navigate, modifyID) } > 
            { tableFields.map( (tableField, i) => {
        
                const value = fields[i];
                const setter = setters[i];
                
                const type = fieldTypes.find((type) => Object.hasOwn(tableField, type));
                const title = tableField[type];
                const isSequentialPrice = requiresSequentialPrice && title === "Precio";
                const isSequentialNumber = requiresSequentialPrice && type === "number";

                const handleChange = (nextValue) => {
                    const formatted = isSequentialPrice
                        ? formatSequentialCurrencyInput(nextValue)
                        : isSequentialNumber
                            ? formatSequentialNumberInput(nextValue)
                            : nextValue;

                    setter(formatted);
                };

                return( 
                    <RequiredInput 
                        key={ `input-${title}` } 
                        type={ type } 
                        title={ title } 
                        onChange={ handleChange } 
                        value={ value } 
                        options={ tableField.options } 
                    /> 
                );
            })}
        </ControlForm>
    );
};

export default ControlFormPage;
