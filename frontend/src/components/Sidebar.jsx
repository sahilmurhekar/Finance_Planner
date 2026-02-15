// frontend/src/components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet as WalletIcon,
    User,
    Settings,
    LogOut,
    ChevronRight
} from 'lucide-react';

const navItems = [
    {
        path: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard
    },
    {
        path: '/wallet',
        label: 'Wallet',
        icon: WalletIcon
    },
    {
        path: '/personal',
        label: 'Personal',
        icon: User
    },
    {
        path: '/settings',
        label: 'Settings',
        icon: Settings
    },
];

const Sidebar = () => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/'; // or use navigate('/')
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`fixed inset-y-0 left-0 z-30 bg-white/70 backdrop-blur-xl border-r border-gray-100 shadow-sm flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
            }`}>
            {/* Logo / Brand */}
            <div className="p-6 border-b border-gray-100">
                <button
                    onClick={toggleSidebar}
                    className={`flex items-center gap-3 w-full h-10 hover:opacity-80 transition-opacity ${isCollapsed ? 'justify-center' : ''
                        }`}
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                        F
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-semibold text-gray-900 tracking-tight whitespace-nowrap">
                                Finance<span className="font-bold text-blue-600">Planner</span>
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">Personal Finance</p>
                        </div>
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6">
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                  group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 relative
                  ${isActive
                                        ? 'bg-gradient-to-r from-blue-50 to-blue-50/50 text-blue-700 font-medium shadow-sm border border-blue-100'
                                        : 'text-gray-700 hover:bg-gray-50/80 hover:text-gray-900'
                                    }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                                title={isCollapsed ? item.label : ''}
                            >
                                <item.icon
                                    size={20}
                                    className={isActive ? 'text-blue-600 flex-shrink-0' : 'text-gray-500 group-hover:text-gray-700 flex-shrink-0'}
                                />
                                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                        {item.label}
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </nav>

            {/* Logout at bottom */}
            <div className="p-6 border-t border-gray-100 mt-auto">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50/60 hover:text-red-700 transition-colors duration-200 group ${isCollapsed ? 'justify-center' : 'justify-start'
                        }`}
                    title={isCollapsed ? 'Sign Out' : ''}
                >
                    <LogOut size={20} className="text-gray-500 group-hover:text-red-600 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium whitespace-nowrap">Sign Out</span>}
                </button>

                {/* Tooltip for collapsed logout */}
                {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 hover:opacity-100 pointer-events-none transition-opacity z-50 bottom-6">
                        Sign Out
                    </div>
                )}

                {/* Optional version / user info */}
                {!isCollapsed && (
                    <div className="mt-6 text-xs text-center text-gray-400">
                        v1.0.0 • {new Date().getFullYear()}
                    </div>
                )}
            </div>

            {/* Optional subtle background effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.04]"></div>
            </div>
        </div>
    );
};

export default Sidebar;