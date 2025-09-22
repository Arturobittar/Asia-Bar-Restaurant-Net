import Sidebar from './sidebar.js';

import { Menu, LogOut } from 'lucide-react'; 

import './dashboard.css';

function ToggleButton({ isSidebarOpen, onClick }) {
    const className = `toggle-button ${isSidebarOpen ? 'open-sidebar' : ''}`;

    return (
        <Menu className={className} onClick={onClick} />
    );
}

function QuitButton({ onClick }) {
    return (
        <button className="logout-icon" onClick={onClick}>
            <LogOut size={24} color="#fff" />
        </button>
    );
}

const Dashboard = ({ children, isOpen, onToggle, onSidebarClick, onMenuItemClick, onMenuItemSubClick, onMainClick, onQuit, dashboardItems, expandedIndex }) => {
    return (
        <div className="dashboard">

            <QuitButton onClick={onQuit} />

            <ToggleButton isSidebarOpen={ isOpen } onClick={ onToggle } />
                
            <Sidebar 
                dashboardItems={ dashboardItems }
                isOpen={ isOpen }
                onClick={ onSidebarClick }
                expandedMenuItemIndex={ expandedIndex }
                onMenuItemClick={ onMenuItemClick }
                onMenuItemSubClick={ onMenuItemSubClick }
            />

            <main className="dashboard-main" onClick={onMainClick} >
                {children}
            </main>
        </div>
    );
};

export default Dashboard;
