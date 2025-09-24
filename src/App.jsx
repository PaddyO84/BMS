import React, { useState, useMemo } from 'react';
import { doc, setDoc, addDoc, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from './firebase/config';
import { useAuth } from './hooks/useAuth';
import { useCollection } from './hooks/useCollection';
import { calculateJobTotal, formatDate } from './utils/helpers';
import { Plus, Download, Loader, AlertCircle, Euro, Users, Briefcase, FileText } from 'lucide-react';

import ErrorBoundary from './components/ErrorBoundary';
import JobDetailView from './components/JobDetailView';
import Modal from './components/Modal';
import CustomerForm from './components/CustomerForm';
import JobForm from './components/JobForm';
import SendDocumentModal from './components/SendDocumentModal';
import DashboardView from './views/DashboardView';
import CustomerListView from './views/CustomerListView';
import JobListView from './views/JobListView';
import InvoiceListView from './views/InvoiceListView';

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
    const { user, loading: authLoading, error: authError } = useAuth();
    const { documents: customers } = useCollection('customers');
    const { documents: jobs } = useCollection('jobs');
    const { documents: quotes } = useCollection('quotes');
    const { documents: invoices } = useCollection('invoices');

    const [activeTab, setActiveTab] = useState('dashboard');
    const [modal, setModal] = useState(null);
    const [selectedJobId, setSelectedJobId] = useState(null);

    const getCollectionRef = (name) => collection(db, `artifacts/${appId}/public/data/${name}`);

    const handleSaveCustomer = async (customerData) => {
        if (!user) return;
        const customerWithOwnership = { ...customerData, ownerId: user.uid, lastUpdated: serverTimestamp() };
        if (customerData.id) {
            await setDoc(doc(getCollectionRef('customers'), customerData.id), customerWithOwnership, { merge: true });
        } else {
            await addDoc(getCollectionRef('customers'), { ...customerWithOwnership, createdAt: serverTimestamp() });
        }
        setModal(null);
    };

    const handleSaveJob = async (jobData) => {
        if (!user) return;
        const totals = calculateJobTotal(jobData);
        const jobWithOwnership = { ...jobData, ...totals, ownerId: user.uid, lastUpdated: serverTimestamp() };
        if (jobData.id) {
            await updateDoc(doc(getCollectionRef('jobs'), jobData.id), jobWithOwnership);
        } else {
            const newJobRef = await addDoc(getCollectionRef('jobs'), { ...jobWithOwnership, status: 'New', createdAt: serverTimestamp() });
            setSelectedJobId(newJobRef.id);
        }
        setModal(null);
    };

    const handleGenerateQuote = async (job) => {
        if (!user) return;
        const quoteNumber = `QT-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(4, '0')}`;
        await addDoc(getCollectionRef('quotes'), {
            ownerId: user.uid,
            jobId: job.id,
            quoteNumber,
            status: "Draft",
            createdAt: serverTimestamp(),
            quoteData: job
        });
        await updateDoc(doc(getCollectionRef('jobs'), job.id), { status: 'Quoted' });
    };

    const handleGenerateInvoice = async (job) => {
        if (!user) return;
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;
        await addDoc(getCollectionRef('invoices'), {
            ownerId: user.uid,
            jobId: job.id,
            invoiceNumber,
            status: "Unpaid",
            createdAt: serverTimestamp(),
            invoiceData: job
        });
        await updateDoc(doc(getCollectionRef('jobs'), job.id), { status: 'Invoiced' });
    };

    const handleUpdateInvoiceStatus = async (invoiceId, status) => {
        await updateDoc(doc(getCollectionRef('invoices'), invoiceId), { status });
    };

    const handleExport = () => {
        if (jobs.length === 0) {
            alert("No data to export.");
            return;
         }
        const data = jobs.map(job => ({
            jobId: job.id,
            jobTitle: job.jobTitle,
            customerName: customers.find(c=>c.id === job.customerId)?.name || 'N/A',
            status: job.status,
            totalCost: calculateJobTotal(job).total,
            invoiceNumber: invoices.find(i=>i.jobId === job.id)?.invoiceNumber || 'N/A',
            invoiceStatus: invoices.find(i=>i.jobId === job.id)?.status || 'N/A',
            date: formatDate(job.createdAt)
        }));
        const csv = [Object.keys(data[0]).join(','), ...data.map(row => Object.values(row).join(','))].join('\n');
        const link = Object.assign(document.createElement("a"), {
            href: 'data:text/csv;charset=utf-8,' + encodeURI(csv),
            download: "bizflow_accounting_export.csv"
        });
        document.body.appendChild(link).click();
        document.body.removeChild(link);
    };

    const selectedJob = useMemo(() => {
        if (!selectedJobId) return null;
        const job = jobs.find(j => j.id === selectedJobId);
        if(!job) return null;
        const jobTotal = calculateJobTotal(job);
        return {
            ...job,
            ...jobTotal,
            customer: customers.find(c => c.id === job.customerId),
            quote: quotes.find(q => q.jobId === job.id),
            invoice: invoices.find(i => i.jobId === job.id)
        };
    }, [selectedJobId, jobs, customers, quotes, invoices]);

    if (authLoading) {
        return <div className="flex items-center justify-center h-screen bg-gray-100"><Loader className="animate-spin mr-2"/>Loading Business Manager...</div>;
    }
    if (authError) {
        return <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-red-500"><AlertCircle className="w-12 h-12 mb-4"/>Authentication failed. Please refresh. <p className="text-sm mt-2">{authError}</p></div>;
    }

    const renderContent = () => {
        if (selectedJobId) {
            return <JobDetailView key={selectedJobId} job={selectedJob} onBack={() => setSelectedJobId(null)} onSave={handleSaveJob} onGenerateQuote={handleGenerateQuote} onGenerateInvoice={handleGenerateInvoice} onOpenSendModal={(type) => setModal({ type: 'send', data: { docType: type, job: selectedJob } })}/>;
        }
        switch (activeTab) {
            case 'dashboard': return <DashboardView invoices={invoices} jobs={jobs} quotes={quotes} />;
            case 'customers': return <CustomerListView customers={customers} onEdit={(c) => setModal({ type: 'customer', data: c })}/>;
            case 'jobs': return <JobListView jobs={jobs} customers={customers} onSelectJob={setSelectedJobId}/>;
            case 'invoices': return <InvoiceListView invoices={invoices} jobs={jobs} customers={customers} onUpdateStatus={handleUpdateInvoiceStatus} />;
            default: return null;
        }
    };

    return (
        <div className="bg-gray-50 font-sans min-h-screen">
            <div className="flex flex-col md:flex-row">
                <aside className="w-full md:w-64 bg-white md:min-h-screen p-4 border-r border-gray-200 shadow-md">
                    <h1 className="text-2xl font-bold text-indigo-600 mb-6 px-4">BizFlow</h1>
                    <nav className="flex flex-row md:flex-col justify-around md:justify-start md:space-y-2">
                        <TabButton icon={<Euro/>} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSelectedJobId(null); }}/>
                        <TabButton icon={<Users/>} label="Customers" isActive={activeTab === 'customers'} onClick={() => { setActiveTab('customers'); setSelectedJobId(null); }}/>
                        <TabButton icon={<Briefcase/>} label="Jobs" isActive={activeTab === 'jobs'} onClick={() => { setActiveTab('jobs'); setSelectedJobId(null); }}/>
                        <TabButton icon={<FileText/>} label="Invoices" isActive={activeTab === 'invoices'} onClick={() => { setActiveTab('invoices'); setSelectedJobId(null); }}/>
                    </nav>
                    {user && <div className="mt-8 p-3 bg-indigo-50 rounded-lg hidden md:block"><p className="text-xs text-gray-600">Your User ID:</p><p className="text-xs font-mono text-indigo-800 break-all">{user.uid}</p></div>}
                </aside>
                <main className="flex-1 p-4 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800 capitalize">{selectedJobId ? 'Job Details' : activeTab}</h2>
                        <div>
                            {!selectedJobId && activeTab === 'customers' && <ActionButton icon={<Plus/>} label="New Customer" onClick={() => setModal({ type: 'customer' })}/>}
                            {!selectedJobId && activeTab === 'jobs' && <ActionButton icon={<Plus/>} label="New Job" onClick={() => setModal({ type: 'job' })}/>}
                            {!selectedJobId && activeTab === 'dashboard' && <ActionButton icon={<Download />} label="Export Data" onClick={handleExport} />}
                        </div>
                    </div>
                    {renderContent()}
                </main>
            </div>
            {modal && (
                <Modal onClose={() => setModal(null)}>
                    {modal.type === 'customer' && <CustomerForm data={modal.data} onSave={handleSaveCustomer} onClose={() => setModal(null)}/>}
                    {modal.type === 'job' && <JobForm data={modal.data} customers={customers} onSave={handleSaveJob} onClose={() => setModal(null)}/>}
                    {modal.type === 'send' && <SendDocumentModal data={modal.data} onClose={() => setModal(null)}/>}
                </Modal>
            )}
        </div>
    );
}

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
