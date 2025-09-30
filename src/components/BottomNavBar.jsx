import React from 'react';
import { Briefcase, Users, User } from 'lucide-react';

const BottomNavBar = ({ activeTab, setActiveTab }) => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg flex justify-around md:hidden">
        <TabButton icon={<Briefcase size={24}/>} label="Jobs" isActive={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')}/>
        <TabButton icon={<Users size={24}/>} label="Customers" isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')}/>
        <TabButton icon={<User size={24}/>} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')}/>
    </nav>
);

const TabButton = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center flex-1 p-2 transition-colors ${
            isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'
        }`}
    >
        {icon}
        <span className="text-xs font-medium mt-1">{label}</span>
    </button>
);

export default BottomNavBar;