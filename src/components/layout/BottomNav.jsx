import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Bell, Settings } from 'lucide-react';

const BottomNav = () => {
    const location = useLocation();
    const navItems = [
        { href: '/', label: 'Jobs', icon: Home },
        { href: '/calendar', label: 'Calendar', icon: Calendar },
        { href: '/reminders', label: 'Reminders', icon: Bell },
        { href: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
            <div className="flex justify-around max-w-screen-sm mx-auto">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = location.pathname === href;
                    return (
                        <Link
                            key={label}
                            to={href}
                            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-sm ${
                                isActive ? 'text-blue-600' : 'text-gray-600'
                            }`}
                        >
                            <Icon size={24} />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;