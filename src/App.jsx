import React, { useState, useEffect } from 'react';
import { Loader, Euro, Users, Briefcase, FileText, Plus, Download, AlertCircle } from 'lucide-react';
import * as db from './services/database';
import { calculateJobTotal, formatDate } from './utils/helpers';

import JobDetailView from './components/JobDetailView';
import Modal from './components/Modal';
import CustomerForm from './components/CustomerForm';
import JobForm from './components/JobForm';
import DashboardView from './views/DashboardView';
import CustomerListView from './views/CustomerListView';
import JobListView from './views/JobListView';

const ActionButton = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors">
        {icon} <span className="ml-2">{label}</span>
    </button>
);

const TabButton = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
        {icon} <span className="ml-3 font-semibold">{label}</span>
    </button>
);

function App() {
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [jobs, setJobs] = useState([]);

    const [activeTab, setActiveTab] = useState('dashboard');
    const [modal, setModal] = useState(null);
    const [selectedJobId, setSelectedJobId] = useState(null);

    useEffect(() => {
        const setup = async () => {
            try {
                await db.initializeDB();
                await fetchData();
            } catch (err) {
                console.error("Error during app setup:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchData = async () => {
            const customersData = (await db.getCustomers()).values || [];
            setCustomers([...customersData]);
            const jobsData = (await db.getJobs()).values || [];
            setJobs([...jobsData]);
        };

        setup();
    }, []);

    const handleSaveCustomer = async (customerData) => {
        if (customerData.id) {
            await db.updateCustomer(customerData);
        } else {
            await db.addCustomer(customerData);
        }
        setModal(null);
        await fetchData();
    };

    const handleSaveJob = async (jobData) => {
        if (jobData.id) {
             const totals = calculateJobTotal(jobData);
             const jobWithTotals = { ...jobData, ...totals };
             await db.updateJob(jobWithTotals);
        } else {
            const newJobId = await db.addJob(jobData);
            setSelectedJobId(newJobId);
        }
        setModal(null);
        fetchData();
    };

    const selectedJob = React.useMemo(() => {
        if (!selectedJobId) return null;
        const job = jobs.find(j => j.id === selectedJobId);
        if(!job) return null;
        const jobTotal = calculateJobTotal(job);
        return {
            ...job,
            ...jobTotal,
            customer: customers.find(c => c.id === job.customerId),
        };
    }, [selectedJobId, jobs, customers]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-gray-100"><Loader className="animate-spin mr-2"/>Loading...</div>;
    }

    const renderContent = () => {
        if (selectedJobId) {
            return <JobDetailView key={selectedJobId} job={selectedJob} onBack={() => setSelectedJobId(null)} onSave={handleSaveJob} />;
        }
        switch (activeTab) {
            case 'dashboard': return <DashboardView jobs={jobs} />;
            case 'customers': return <CustomerListView customers={customers} onEdit={(c) => setModal({ type: 'customer', data: c })}/>;
            case 'jobs': return <JobListView jobs={jobs} customers={customers} onSelectJob={setSelectedJobId}/>;
            default: return null;
        }
    };

    return (
        <div className="bg-gray-50 font-sans min-h-screen">
            <div className="flex flex-col md:flex-row">
                <aside className="w-full md:w-64 bg-white md:min-h-screen p-4 border-r border-gray-200 shadow-md">
                    <h1 className="text-2xl font-bold text-indigo-600 mb-6 px-4">BMSys</h1>
                    <nav className="flex flex-row md:flex-col justify-around md:justify-start md:space-y-2">
                        <TabButton icon={<Euro/>} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSelectedJobId(null); }}/>
                        <TabButton icon={<Users/>} label="Customers" isActive={activeTab === 'customers'} onClick={() => { setActiveTab('customers'); setSelectedJobId(null); }}/>
                        <TabButton icon={<Briefcase/>} label="Jobs" isActive={activeTab === 'jobs'} onClick={() => { setActiveTab('jobs'); setSelectedJobId(null); }}/>
                    </nav>
                </aside>
                <main className="flex-1 p-4 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800 capitalize">{selectedJobId ? 'Job Details' : activeTab}</h2>
                        <div>
                            {!selectedJobId && activeTab === 'customers' && <ActionButton icon={<Plus/>} label="New Customer" onClick={() => setModal({ type: 'customer' })}/>}
                            {!selectedJobId && activeTab === 'jobs' && <ActionButton icon={<Plus/>} label="New Job" onClick={() => setModal({ type: 'job' })}/>}
                        </div>
                    </div>
                    {renderContent()}
                </main>
            </div>
            {modal && (
                <Modal onClose={() => setModal(null)}>
                    {modal.type === 'customer' && <CustomerForm data={modal.data} onSave={handleSaveCustomer} onClose={() => setModal(null)}/>}
                    {modal.type === 'job' && <JobForm data={modal.data} customers={customers} onSave={handleSaveJob} onClose={() => setModal(null)}/>}
                </Modal>
            )}
        </div>
    );
}

export default App;