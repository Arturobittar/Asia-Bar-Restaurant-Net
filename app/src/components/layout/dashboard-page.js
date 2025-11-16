import { useState } from 'react';
import { useDashboardFunctions, useOnMenuItemFunctions, useOnQuit } from "../../hooks/dashboard.js";

import { dashboardItems } from '../../config/dashboard-items.js';
import { guardarTipoCambio } from '../../config/tipoCambio.js';
import { formatSequentialCurrencyInput } from '../../config/fn-reusables.js';

import Dashboard from "../../components/features/dashboard/dashboard.js";
import { ModalInicio } from "../../pages/Inicio/modalesInicio.js";
import { successAlert } from "../../utils/alerts.js";

import "../layout/form.css";
import "../ui/buttons.css";

const DashboardPage = ({ children }) => {
    const [isOpen, setOpenStatus] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);
    
    // Estado para modal de tipo de cambio
    const [showTCModal, setShowTCModal] = useState(false);
    const [tasa, setTasa] = useState("");

    // Funciones para el modal de tipo de cambio
    const handleOpenTCModal = () => {
        setShowTCModal(true);
        setOpenStatus(false); // Cerrar sidebar al abrir modal
    };
    
    const handleCloseTCModal = () => {
        setShowTCModal(false);
        setTasa("");
    };
    
    const handleGuardarTC = async () => {
        const valor = parseFloat(tasa);
        if (isNaN(valor) || valor <= 0) {
            alert('Por favor, ingrese un valor válido mayor a 0');
            return;
        }
        
        try {
            const resultado = await guardarTipoCambio(valor);
            if (resultado.success) {
                successAlert('Completado', 'Tipo de cambio actualizado correctamente');
                handleCloseTCModal();
            }
        } catch (error) {
            alert('Error al guardar el tipo de cambio. Inténtelo nuevamente.');
        }
    };

    const [
        onToggle,
        onSidebarClick,
        onMainClick,
        onMainItem, 
        onSubItem, 
        onQuit
    ]  = useDashboardFunctions(isOpen, setOpenStatus, expandedIndex, setExpandedIndex, handleOpenTCModal);

    const handleTasaChange = (e) => {
        const valorFormateado = formatSequentialCurrencyInput(e.target.value);
        setTasa(valorFormateado);
    };

    // Contenido del modal de tipo de cambio
    const contenidoTC = (
        <div className="frame-formEmergente modal-tipo-cambio">
            <h1>Dolar BCV</h1>
            <hr />

            <div className="input-box margined">
                <label className="input-title" htmlFor="precio-dolar">
                    Precio dólar (Bs)
                </label>
                <input 
                    className="simple-input"
                    type="text"
                    id="precio-dolar"
                    placeholder="0.00"
                    value={tasa}
                    onChange={handleTasaChange}
                    required
                />
            </div>

            <div className="buttons">
                <button type="button" className="go-back-button" onClick={handleCloseTCModal}>Volver</button>
                <button type="button" className="submit-button" onClick={handleGuardarTC}>Guardar</button>
            </div>
        </div>
    );

    return (
        <>
            <Dashboard
                isOpen={isOpen}
                onToggle={onToggle}
                onSidebarClick={onSidebarClick}
                onMenuItemClick={onMainItem}
                onMenuItemSubClick={onSubItem}
                onMainClick={onMainClick}
                onQuit={onQuit}
                dashboardItems={dashboardItems}
                expandedIndex={expandedIndex}
            >
                {children}
            </Dashboard>
            
            {showTCModal && (
                <ModalInicio 
                    contenido={contenidoTC} 
                    onClose={handleCloseTCModal}
                    onModalClick={() => setOpenStatus(false)}
                />
            )}
        </>
    );
};

export default DashboardPage;
