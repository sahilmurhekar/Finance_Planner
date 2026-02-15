// frontend/src/components/Layout.jsx
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">

            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <div className="flex-1">
                <main className="p-4 sm:p-6 md:p-8 lg:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;