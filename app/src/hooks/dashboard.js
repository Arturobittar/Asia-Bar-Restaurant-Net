import { useNavigate } from "react-router-dom";
import { useLateTableChanger } from './session.js';

import { onLogout } from '../utils/api.js';
import { questionAlert } from '../utils/alerts.js';

export function useDashboardFunctions(isOpen, setOpenStatus, expandedIndex, setExpandedIndex) {
    const navigate = useNavigate();
    const lateTableChanger = useLateTableChanger();
    
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
        lateTableChanger(subitem.table); 
        navigate(subitem.route);
    };

    const onQuit = () => questionAlert(
        "¿Desea Salir?",
        "¿Está seguro de que desea salir? Su sesión será cerrada.",
        () => onLogout(navigate)
    );

    return [onToggle, onSidebarClick, onMainClick, onMainItem, onSubItem, onQuit];
}
