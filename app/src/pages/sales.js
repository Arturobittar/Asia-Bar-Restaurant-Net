import TablePage from "../components/features/table/table-page.js";
import { useData, useHeaderButtons, useActionButtons } from "../hooks/sales.js";

const fields = ["N°", "ID. Cliente", "Cliente", "Tipo", "Total"];

function SalesControl() {
    const [data, setData] = useData();
    const [onDelete, onInfo, onEdit] = useActionButtons();
    const [onNew, onSearch] = useHeaderButtons(setData)

    return (
        <TablePage 
            key="sales-control" 
            title="Control de Ventas"
            fields={fields} 
            data={data}
            onDelete={onDelete}
            onInfo={onInfo}
            onEdit={onEdit}
            onNew={onNew}
            onSearch={onSearch}
        />
    );
};

export default SalesControl;
