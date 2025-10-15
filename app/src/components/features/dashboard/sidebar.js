"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { QRCode } from "react-qr-code"  // Cambiado de 'qrcode.react' a 'react-qr-code'
import MenuItem from "./menu-item.js"
import { useRol } from "../../../hooks/session.js"
import { routes } from "../../../config/routes.js"
import Logo from "../../../assets/logo.png"
import "./sidebar.css"

import { getNetworkConfig } from "../../../config/network";


function QRCodeWrapper({ value, size = 130 }) {
    const [isClient, setIsClient] = useState(false)
  
    useEffect(() => {
      setIsClient(true)
    }, [])
  
    if (!isClient) {
      return <div className="qr-placeholder" style={{ width: size, height: size }} />
    }
  
    return (
      <div className="qr-code-container">
        <QRCode 
          value={value} 
          size={size - 12}
          level="H"
          className="qr-code"
        />
      </div>
    )
  }

function HomeButton() {
    return (
      <li className="home-button">
        <Link className="home-button-link" to={routes["Inicio"]}>
          Inicio
        </Link>
      </li>
    )
  }
  

function SideBarMenu({ dashboardItems, expandedIndex, onItemClick, onSubItemClick }) {
  const rol = useRol()

  return (
    <nav className="menu">
      <ul className="menu-items">
        <HomeButton />

        {dashboardItems.map((menuItem, index) =>
          rol !== "Administrador" && menuItem.isForAdminOnly ? null : (
            <MenuItem
              key={menuItem.title}
              title={menuItem.title}
              isExpanded={expandedIndex === index}
              onClick={() => onItemClick(index)}
              subitems={menuItem.subItems}
              onSubClick={onSubItemClick}
            />
          ),
        )}
      </ul>
    </nav>
  )
}



function LogoContainer() {
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    // Obtener la URL del servidor desde la configuración
    const { serverUrl } = getNetworkConfig();
    console.log("URL del servidor desde network.js:", serverUrl);
    const url = new URL(serverUrl);
    
    // Construir la URL para el QR
    const currentUrl = new URL(window.location.href);
    currentUrl.hostname = url.hostname;
    if (url.port) {
      currentUrl.port = url.port;
    }
    
    setQrUrl(currentUrl.toString());
  }, []);

  const handleToggle = () => {
    setShowQR(!showQR);
  };

  return (
    <div className="logo-container">
      <div className={`logo-placeholder ${showQR ? "show-qr" : ""}`} onClick={handleToggle}>
        {!showQR ? (
          <img src={Logo || "/placeholder.svg"} alt="Logo" className="logo-image" />
        ) : (
          <div className="qr-inside-logo">
            <div className="qr-code-holder">
              <QRCodeWrapper value={qrUrl} size={130} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({
  dashboardItems,
  isOpen,
  onClick,
  expandedMenuItemIndex,
  onMenuItemClick,
  onMenuItemSubClick,
}) {
  const statusString = isOpen ? "open" : ""
  const className = "sidebar " + statusString

  return (
    <aside className={className} onClick={onClick}>
      <LogoContainer />
      <div className="menu-title">Asia Menú</div>

      <SideBarMenu
        dashboardItems={dashboardItems}
        expandedIndex={expandedMenuItemIndex}
        onItemClick={onMenuItemClick}
        onSubItemClick={onMenuItemSubClick}
      />
    </aside>
  )
}
