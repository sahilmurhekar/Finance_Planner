//frontend/src/pages/Dashboard.jsx
import React from 'react';

const Dashboard = () => {
    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600 mb-8">Welcome back! Here's your financial overview.</p>

                {/* Your dashboard content goes here */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Add your dashboard cards, charts, etc. */}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;