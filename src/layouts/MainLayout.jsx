import React from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { Euro, Users, Briefcase, User, Plus, Save } from 'lucide-react';

import Modal from '../components/Modal';
import CustomerForm from '../components/CustomerForm';
import JobForm from '../components/JobForm';

const TabButton = ({ icon, label, to }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link
            to={to}
            className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            {icon} <span className="ml-3 font-semibold">{label}</span>
        </Link>
    );
};

const ActionButton = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
    >
        {icon} <span className="ml-2">{label}</span>
    </button>
);

const MainLayout = ({ customers, onSaveCustomer, onSaveJob, handleBackup, modal, setModal }) => {
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
        <div className="bg-gray-50 font-sans min-h-screen">
            <div className="flex flex-col md:flex-row">
                <aside className="w-full md:w-64 bg-white md:min-h-screen p-4 border-r border-gray-200 shadow-md">
                    <h1 className="text-2xl font-bold text-indigo-600 mb-6 px-4">BMSys</h1>
                    <nav className="flex flex-row md:flex-col justify-around md:justify-start md:space-y-2">
                        <TabButton icon={<Euro />} label="Dashboard" to="/" />
                        <TabButton icon={<Users />} label="Customers" to="/customers" />
                        <TabButton icon={<Briefcase />} label="Jobs" to="/jobs" />
                        <TabButton icon={<User />} label="Profile" to="/profile" />
                    </nav>
                </aside>
                <main className="flex-1 p-4 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800 capitalize">{getTitle()}</h2>
                        <div className="flex space-x-2">
                            {location.pathname === '/' && <ActionButton icon={<Save />} label="Backup Now" onClick={handleBackup} />}
                            {location.pathname === '/customers' && <ActionButton icon={<Plus />} label="New Customer" onClick={() => setModal({ type: 'customer' })} />}
                            {location.pathname === '/jobs' && <ActionButton icon={<Plus />} label="New Job" onClick={() => setModal({ type: 'job' })} />}
                        </div>
                    </div>
                    <Outlet />
                </main>
            </div>
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