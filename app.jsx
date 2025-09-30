import React, { useState, useMemo } from 'react';
import { useDatabase } from './hooks/useDatabase';
import { Plus, Loader, AlertCircle } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import BottomNavBar from './components/BottomNavBar';
import { CustomerForm, JobForm } from './components/forms';
import { Modal, ActionButton } from './components/ui';
import CustomerListView from './views/CustomerListView';
import JobListView from './views/JobListView';
import JobDetailView from './views/JobDetailView';
import ProfileView from './views/ProfileView';

// --- MAIN APP COMPONENT ---
function App() {
    const { loading, customers, jobs, profile, addCustomer, updateCustomer, addJob, updateJob, updateBusinessProfile } = useDatabase();
    const [activeTab, setActiveTab] = useState('jobs');
    const [modal, setModal] = useState(null);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveCustomer = async (customerData) => {
        setIsSaving(true);
        try {
            if (customerData.id) {
                await updateCustomer(customerData);
            } else {
                await addCustomer(customerData);
            }
            setModal(null);
        } catch (error) {
            console.error("Error saving customer:", error);
            alert(`Failed to save customer. Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveJob = async (jobData) => {
        setIsSaving(true);
        try {
            if (jobData.id) {
                await updateJob(jobData);
            } else {
                const newJobId = await addJob({ ...jobData, status: 'New' });
                setSelectedJobId(newJobId);
            }
            setModal(null);
        } catch (error) {
            console.error("Error saving job:", error);
            alert(`Failed to save job. Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const selectedJob = useMemo(() => {
        if (!selectedJobId) return null;
        const job = jobs.find(j => j.id === selectedJobId);
        if (!job) return null;
        return { ...job, customer: customers.find(c => c.id === job.customerId) };
    }, [selectedJobId, jobs, customers]);

    const renderContent = () => {
        if (selectedJobId) {
            return <JobDetailView
                key={selectedJobId}
                job={selectedJob}
                onBack={() => setSelectedJobId(null)}
                onSave={handleSaveJob}
                isSaving={isSaving}
                profile={profile}
            />
        }
        switch (activeTab) {
            case 'customers':
                return <CustomerListView customers={customers} onEdit={(c) => setModal({ type: 'customer', data: c })} />;
            case 'jobs':
                return <JobListView jobs={jobs} customers={customers} onSelectJob={setSelectedJobId} />;
            case 'profile':
                return <ProfileView profile={profile} onSave={updateBusinessProfile} isSaving={isSaving} />;
            default:
                return <JobListView jobs={jobs} customers={customers} onSelectJob={setSelectedJobId} />;
        }
    }

    if (loading) return <div className="flex items-center justify-center h-screen bg-gray-100"><Loader className="animate-spin mr-2" />Loading Business Manager...</div>;

    return (
        <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
            <header className="bg-white shadow-md p-4 flex justify-between items-center md:hidden">
                <h1 className="text-xl font-bold text-indigo-600 capitalize">{activeTab}</h1>
                {activeTab === 'customers' && <ActionButton icon={<Plus size={16} />} label="New" onClick={() => setModal({ type: 'customer' })} />}
                {activeTab === 'jobs' && <ActionButton icon={<Plus size={16} />} label="New" onClick={() => setModal({ type: 'job', data: { customerId: customers[0]?.id } })} />}
            </header>

            <main className="flex-1 p-4 mb-16">
                {renderContent()}
            </main>

            <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />

            {modal && <Modal onClose={() => setModal(null)}>
                {modal.type === 'customer' && <CustomerForm data={modal.data} onSave={handleSaveCustomer} onClose={() => setModal(null)} isSaving={isSaving} />}
                {modal.type === 'job' && <JobForm data={modal.data} customers={customers} onSave={handleSaveJob} onClose={() => setModal(null)} isSaving={isSaving} />}
            </Modal>}
        </div>
    );
}

// Wrap App in ErrorBoundary
export default function AppWrapper() {
    return (
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    );
}