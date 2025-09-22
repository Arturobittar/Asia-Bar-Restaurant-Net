import { ChevronDown, ChevronRight } from 'lucide-react'; 

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
    return (
        <ul className="submenu">
            {   
                subitems.map(( subitem, i) => ( 
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
