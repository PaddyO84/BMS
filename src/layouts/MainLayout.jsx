import React from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, User, Plus } from 'lucide-react';

import Modal from '../components/Modal';
import CustomerForm from '../components/CustomerForm';
import JobForm from '../components/JobForm';

const BottomNavItem = ({ icon, label, to }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link
            to={to}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors ${
                isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'
            }`}
        >
            {icon}
            <span className="text-xs mt-1">{label}</span>
        </Link>
    );
};

const MainLayout = ({ customers, onSaveCustomer, onSaveJob, modal, setModal }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleSaveJobWithNavigation = async (jobData) => {
        const newJobId = await onSaveJob(jobData);
        if (newJobId) {
            navigate(`/jobs/${newJobId}`);
        }
    };

    const getTitle = () => {
        const path = location.pathname;
        if (path.startsWith('/jobs/')) return 'Job Details';
        if (path === '/customers') return 'Customers';
        if (path === '/jobs') return 'Jobs';
        if (path === '/profile') return 'Profile';
        return 'Dashboard';
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 font-sans">
            <header className="bg-white shadow-md z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-xl font-bold text-gray-800">{getTitle()}</h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-20">
                <div className="p-4">
                    <Outlet />
                </div>
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-md flex justify-around">
                <BottomNavItem icon={<LayoutDashboard size={24} />} label="Dashboard" to="/" />
                <BottomNavItem icon={<Users size={24} />} label="Customers" to="/customers" />
                <BottomNavItem icon={<Briefcase size={24} />} label="Jobs" to="/jobs" />
                <BottomNavItem icon={<User size={24} />} label="Profile" to="/profile" />
            </nav>

            {modal && (
                <Modal onClose={() => setModal(null)}>
                    {modal.type === 'customer' && <CustomerForm data={modal.data} onSave={onSaveCustomer} onClose={() => setModal(null)} />}
                    {modal.type === 'job' && <JobForm data={modal.data} customers={customers} onSave={handleSaveJobWithNavigation} onClose={() => setModal(null)} />}
                </Modal>
            )}
        </div>
    );
};

export default MainLayout;