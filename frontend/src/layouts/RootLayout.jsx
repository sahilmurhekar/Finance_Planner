// frontend/src/layouts/RootLayout.jsx
import React, { createContext, useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// Create context to share sidebar state
export const SidebarContext = createContext();

const RootLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
            <div className="flex h-screen w-full bg-gray-50/30">
                {/* Sidebar - fixed positioning handled in Sidebar component */}
                <Sidebar />

                {/* Main content area with dynamic margin based on sidebar state */}
                {/* On laptop: margin changes based on sidebar state */}
                {/* On mobile: always has ml-20 since sidebar is always collapsed */}
                <main
                    className={`flex-1 overflow-auto transition-all duration-300 ease-in-out hidden md:block ${isCollapsed ? 'md:ml-20' : 'md:ml-64'
                        }`}
                >
                    <Outlet />
                </main>

                {/* Mobile view - always use ml-20 */}
                <main className="flex-1 overflow-auto transition-all duration-300 ease-in-out ml-20 md:hidden">
                    <Outlet />
                </main>
            </div>
        </SidebarContext.Provider>
    );
};

export default RootLayout;