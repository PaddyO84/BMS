import React from 'react';
import BottomNav from './BottomNav';

const MainLayout = ({ children }) => {
    return (
        <div className="flex flex-col h-screen">
            <main className="flex-grow pb-16">
                {children}
            </main>
            <BottomNav />
        </div>
    );
};

export default MainLayout;