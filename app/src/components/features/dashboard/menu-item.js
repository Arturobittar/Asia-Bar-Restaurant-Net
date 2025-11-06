import { ChevronDown, ChevronRight } from 'lucide-react'; 
import { useRol } from '../../../hooks/session.js'

import './menu-item.css';

function Subitem({ name, onClick }) {
    return (
        <li>
            <button onClick={onClick} className="submenu-button">
                { name }
            </button>
        </li>
    )
}

function SubMenu({ subitems, onSubClick }) {
    const rol = useRol(); 
    
    return (
        <ul className="submenu">
            {   
                subitems.map(( subitem, i) => (rol !== "Administrador" && subitem.isForOnlyAdmin) ? null : ( 
                    <Subitem 
                        key={ `subitem-${subitem.name}-${i}` } 
                        name={subitem.name} 
                        onClick={ () => onSubClick(subitem) } 
                    />
                ))
            }
        </ul>
    );
}

export default function MenuItem({ title, isExpanded, onClick, subitems = null, onSubClick }) {
    const ArrowIcon = isExpanded ? ChevronDown : ChevronRight;
    const Arrow = <ArrowIcon size={30} />;

    const areSubItemsShown = subitems && isExpanded;

    return (
        <li className="menu-item">
            <button className="menu-button" onClick={ onClick }>
                { title }
                { subitems && Arrow }
            </button>

            { areSubItemsShown && 
                ( <SubMenu subitems={subitems} onSubClick={onSubClick} /> )
            }
        </li>
    );
}
