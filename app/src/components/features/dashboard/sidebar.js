import { useState } from 'react';
import { Link } from 'react-router-dom';
import MenuItem from './menu-item.js';

import { getNetworkConfig } from '../../../config/network';
import { routes } from '../../../config/routes.js';

import Logo from '../../../assets/logo.png';

import './sidebar.css';

function HomeButton() {
    return (
        <li className="home-button" >
            <Link className="home-button-link" to={routes['Inicio'] } >
                Inicio
            </Link>
        </li>
    ); 
}

function SideBarMenu({ dashboardItems, expandedIndex, onItemClick, onSubItemClick }) {
    return (
        <nav className="menu">
            <ul className="menu-items">
                <HomeButton />

                {dashboardItems.map((menuItem, index) => (
                    <MenuItem
                        key={menuItem.title}
                        title={menuItem.title}
                        isExpanded={expandedIndex === index}
                        onClick={ () => onItemClick(index) }
                        subitems={menuItem.subItems} 
                        onSubClick={onSubItemClick}
                    />
                ))}
            </ul>
        </nav>
    );
}

function LogoContainer() {
    const [showQR, setShowQR] = useState(false);
    const { serverUrl } = getNetworkConfig();
    
    const handleLogoClick = (event) => {
        event.stopPropagation();
        setShowQR(!showQR);
    };

    return (
        <div className="logo-container">
                <div 
                    className={`logo-placeholder ${showQR ? 'show-qr' : ''}`} 
                    onClick={handleLogoClick}
                >
                    {!showQR ? (
                        <img 
                            src={Logo} 
                            alt="Logo" 
                            className="logo-image" 
                        />
                    ) : (
                        <div className="qr-inside-logo">
                            <div className="qr-code-holder">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(serverUrl)}`} 
                                    alt="Código QR de acceso"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
    );
}

export default function Sidebar({ dashboardItems, isOpen, onClick, expandedMenuItemIndex, onMenuItemClick, onMenuItemSubClick }) {
    const statusString = (isOpen) ? "open" : "";
    const className = "sidebar " + statusString;

    return (
        <aside className={className} onClick={onClick}>
            <LogoContainer />
            <div className="menu-title">
                Asia Menú
            </div>

            <SideBarMenu
                dashboardItems={dashboardItems}
                expandedIndex={ expandedMenuItemIndex } 
                onItemClick={onMenuItemClick} 
                onSubItemClick={onMenuItemSubClick}
            />
        </aside>
    );
}
