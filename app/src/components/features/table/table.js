import { Pencil, Trash, Info, ReceiptText } from "lucide-react";
import './table.css';

function ButtonsBox({ id, onInfo, onEdit, onDelete, onTicket }) { 
    return (
        <td>
            <div className="action-buttons-container">
                { onInfo && (<Info className="action-button" size={20} onClick={ () => onInfo(id) } />) }
                { onEdit && (<Pencil className="action-button" size={20} onClick={ () => onEdit(id) } />) }
                { onDelete && (<Trash className="action-button" size={20} onClick={ () => onDelete(id) } />) }
                { onTicket && (<ReceiptText className="action-button" size={20} onClick={ () => onTicket(id) } />) }
            </div>
        </td>
    );
}

function BodyRow({ row, index, onInfo, onEdit, onDelete, onTicket, fields }) {

    const rowId = `row-${index}`;

    const onDeleteClick = (id) => onDelete(id, () => 
        document.getElementById(rowId).style.display = "none"
    );

    const isBool = (value) => typeof value === "object" && Object.hasOwn(value, "bool");

    const toBool = (value) => {
        return (value === 1) ? "Sí" : "No";
    }   
                
    return (
        <tr id={`row-${index}`}  key={ index } >
            { row.map((value, i) => {

                const isNumber = /^\d*\.?\d+$/.test(value);

                const isDecimal = isNumber && String(value).includes(".");

                return <td key={i}>{ isDecimal ? parseFloat(value).toFixed(2) : (fields && isBool(fields[i])) ? toBool(value) : value }</td>  
            })}
            <ButtonsBox id = { row[0] } onInfo={ onInfo } onEdit={ onEdit} onDelete={ onDeleteClick } onTicket={ onTicket } /> 
        </tr>
    );
}

function Header({ fields }) {
    return(
        <thead>
            <tr>{ fields.map((field, index) => (<th key={index}>{field}</th>)) }</tr>
        </thead>
    );
}

function Body({ data, onInfo, onEdit, onTicket, onDelete, bodyFields }) {
    return (
        <tbody>
            {data.map((row, index) => 
                <BodyRow row={row} index={index} onInfo={onInfo} onEdit={onEdit} onDelete={onDelete} onTicket={onTicket} fields={bodyFields} /> 
            )}
        </tbody>
    );
}

export default function Table({ fields, data, onInfo, onEdit, onDelete, onTicket, bodyFields }) {
    return(
        <div className="table-container">
            <table className="control-table">
                <Header fields={ fields } />
                <Body data={ data } onInfo={onInfo} onEdit={onEdit} onDelete={onDelete} onTicket={onTicket} bodyFields={bodyFields}/>
            </table>
        </div>
    );
}
