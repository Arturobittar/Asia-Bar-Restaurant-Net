import { useNavigate } from "react-router-dom";
import { useLateTableChanger } from './session.js';

import { onLogout } from '../utils/api.js';
import { questionAlert } from '../utils/alerts.js';

import { useRolChanger } from './session.js';

export function useDashboardFunctions(isOpen, setOpenStatus, expandedIndex, setExpandedIndex, handleOpenTCModal) {
    const navigate = useNavigate();
    const lateTableChanger = useLateTableChanger();
    const rolChanger = useRolChanger();
    
    const onToggle = () => setOpenStatus(!isOpen);

    const onSidebarClick = (e) => {
        if (e.target.classList.contains('sidebar'))
            setExpandedIndex(null);
    };

    const onMainClick = () => {
        setOpenStatus(false);
        setTimeout(() => { setExpandedIndex(null) }, 500);
    };
    
    const onMainItem = (index) => setExpandedIndex(expandedIndex === index ? null : index);
    
    const onSubItem = (subitem) => {
        // Si es TipoCambio, abrir el modal en lugar de navegar
        if (subitem.table === 'TipoCambio') {
            handleOpenTCModal();
            return;
        }
        
        lateTableChanger(subitem.table); 
        navigate(subitem.route);
    };

    const onQuit = () => questionAlert(
        "¿Desea Salir?",
        "¿Está seguro de que desea salir? Su sesión será cerrada.",
        () => {
            onLogout(navigate);
            setTimeout(() => {
                rolChanger(null);
            }, 200);
        }
    );

    return [onToggle, onSidebarClick, onMainClick, onMainItem, onSubItem, onQuit];
}
