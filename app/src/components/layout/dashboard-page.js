import { useState } from 'react';
import { useDashboardFunctions, useOnMenuItemFunctions, useOnQuit } from "../../hooks/dashboard.js";

import { dashboardItems } from '../../config/dashboard-items.js';

import Dashboard from "../../components/features/dashboard/dashboard.js";

const DashboardPage = ({ children }) => {
    const [isOpen, setOpenStatus] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);

    const [
        onToggle,
        onSidebarClick,
        onMainClick,
        onMainItem, 
        onSubItem, 
        onQuit
    ]  = useDashboardFunctions(isOpen, setOpenStatus, expandedIndex, setExpandedIndex);

    return (
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
    );
};

export default DashboardPage;
