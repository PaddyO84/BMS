import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import {
    getFirestore,
    doc,
    setDoc,
    addDoc,
    collection,
    query,
    where,
    onSnapshot,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Plus, X, Users, Briefcase, FileText, Euro, Edit, Trash2, Camera, Mail, MessageSquare, ChevronDown, ChevronUp, Download, Loader, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- MOCK CONFIG (WILL BE REPLACED BY HOSTING ENVIRONMENT) ---
const firebaseConfig = typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : { apiKey: "AIza...", authDomain: "...", projectId: "...", storageBucket: "...", messagingSenderId: "...", appId: "..." };
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- HELPER FUNCTIONS ---
const formatCurrency = (amount) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleDateString('en-GB');
    return new Date(timestamp).toLocaleDateString('en-GB');
};

// --- PDF Generation ---
const generatePdf = (docType, data) => {
    const doc = new jsPDF();
    const { number, job, customer, issueDate, dueDate } = data;
    doc.setFontSize(20); doc.text(docType.toUpperCase(), 15, 20);
    doc.setFontSize(10); doc.text("Your Business Name", 150, 15); doc.text("123 Business Road, Dublin", 150, 20); doc.text("your.email@business.com", 150, 25);
    doc.setFontSize(12); doc.text(`${docType} Number: ${number}`, 15, 40); doc.text(`Date of Issue: ${issueDate}`, 15, 46);
    if(dueDate) doc.text(`Due Date: ${dueDate}`, 15, 52);
    doc.text("Bill To:", 15, 65); doc.text(customer?.name || "N/A", 15, 71); doc.text(customer?.address || "N/A", 15, 77); doc.text(customer?.email || "N/A", 15, 83);
    const head = [['Description', 'Quantity/Hours', 'Unit Price', 'Total']];
    const labourBody = (job.labour || []).map(l => [l.description, `${l.hours} hrs`, formatCurrency(l.rate), formatCurrency(l.hours * l.rate)]);
    const materialsBody = (job.materials || []).map(m => [m.name, m.quantity, formatCurrency(m.cost), formatCurrency(m.quantity * m.cost)]);
    doc.autoTable({ startY: 95, head, body: [...labourBody, ...materialsBody], theme: 'striped', headStyles: { fillColor: [41, 128, 185] } });
    const finalY = doc.autoTable.previous.finalY;
    const totals = calculateJobTotal(job);
    doc.setFontSize(12); doc.text(`Subtotal:`, 140, finalY + 10, { align: 'right' }); doc.text(formatCurrency(totals.subTotal), 200, finalY + 10, { align: 'right' });
    doc.text(`VAT @ ${totals.taxRate}%:`, 140, finalY + 17, { align: 'right' }); doc.text(formatCurrency(totals.taxAmount), 200, finalY + 17, { align: 'right' });
    doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text(`Total:`, 140, finalY + 25, { align: 'right' }); doc.text(formatCurrency(totals.total), 200, finalY + 25, { align: 'right' });
    doc.setFontSize(10); doc.setFont(undefined, 'normal'); doc.text("Thank you for your business!", 15, doc.internal.pageSize.height - 10);
    doc.save(`${docType}_${number}.pdf`);
};

const calculateJobTotal = (job) => {
    if (!job) return { subTotal: 0, taxAmount: 0, total: 0, taxRate: 13.5 };
    const labourTotal = job.labour?.reduce((sum, item) => sum + ((item.hours || 0) * (item.rate || 0)), 0) || 0;
    const materialsTotal = job.materials?.reduce((sum, item) => sum + ((item.quantity || 0) * (item.cost || 0)), 0) || 0;
    const subTotal = labourTotal + materialsTotal;
    const taxRate = job.taxRate || 13.5;
    const taxAmount = subTotal * (taxRate / 100);
    const total = subTotal + taxAmount;
    return { subTotal, taxAmount, total, taxRate };
};

// --- Error Boundary Component ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700 p-4">
          <AlertCircle className="w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Something went wrong.</h1>
          <p className="text-center">The application encountered an error. Please try refreshing the page.</p>
          <pre className="mt-4 p-2 bg-red-100 text-xs rounded-md w-full max-w-lg overflow-auto">
            {this.state.error && this.state.error.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- MAIN APP COMPONENT ---
function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [customers, setCustomers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [modal, setModal] = useState(null);
    const [selectedJobId, setSelectedJobId] = useState(null);

    useEffect(() => {
        const authAction = async (token) => {
            try {
                if (token) await signInWithCustomToken(auth, token);
                else await signInAnonymously(auth);
            } catch (error) {
                console.error("Authentication Error:", error);
                setAuthError(error.message);
            }
        };
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
        authAction(initialAuthToken);
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;
        const baseCollectionPath = `artifacts/${appId}/public/data`;
        const ownerQuery = where("ownerId", "==", user.uid);
        const unsubCustomers = onSnapshot(query(collection(db, `${baseCollectionPath}/customers`), ownerQuery), s => setCustomers(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubJobs = onSnapshot(query(collection(db, `${baseCollectionPath}/jobs`), ownerQuery), (snapshot) => {
            const jobsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            jobsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setJobs(jobsData);
        });
        const unsubQuotes = onSnapshot(query(collection(db, `${baseCollectionPath}/quotes`), ownerQuery), s => setQuotes(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubInvoices = onSnapshot(query(collection(db, `${baseCollectionPath}/invoices`), ownerQuery), s => setInvoices(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        return () => { unsubCustomers(); unsubJobs(); unsubQuotes(); unsubInvoices(); };
    }, [user]);

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
        await addDoc(getCollectionRef('quotes'), { ownerId: user.uid, jobId: job.id, quoteNumber: `QT-2025-${String(quotes.length + 1).padStart(3, '0')}`, status: "Draft", createdAt: serverTimestamp(), quoteData: job });
        await updateDoc(doc(getCollectionRef('jobs'), job.id), { status: 'Quoted' });
    };

    const handleGenerateInvoice = async (job) => {
        if (!user) return;
        await addDoc(getCollectionRef('invoices'), { ownerId: user.uid, jobId: job.id, invoiceNumber: `INV-2025-${String(invoices.length + 1).padStart(3, '0')}`, status: "Unpaid", createdAt: serverTimestamp(), invoiceData: job });
        await updateDoc(doc(getCollectionRef('jobs'), job.id), { status: 'Invoiced' });
    };

    const handleUpdateInvoiceStatus = async (invoiceId, status) => await updateDoc(doc(getCollectionRef('invoices'), invoiceId), { status });
    const handleExport = () => {
        if (jobs.length === 0) {
            const customModal = document.createElement('div');
            customModal.innerHTML = `<div style="position:fixed; top:20px; left:50%; transform:translateX(-50%); background-color: #fefcbf; color: #744210; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index:100;">No data to export.</div>`;
            document.body.appendChild(customModal);
            setTimeout(() => document.body.removeChild(customModal), 3000);
            return;
         }
        const data = jobs.map(job => ({ jobId: job.id, jobTitle: job.jobTitle, customerName: customers.find(c=>c.id === job.customerId)?.name || 'N/A', status: job.status, totalCost: calculateJobTotal(job).total, invoiceNumber: invoices.find(i=>i.jobId === job.id)?.invoiceNumber || 'N/A', invoiceStatus: invoices.find(i=>i.jobId === job.id)?.status || 'N/A', date: formatDate(job.createdAt) }));
        const csv = [Object.keys(data[0]).join(','), ...data.map(row => Object.values(row).join(','))].join('\n');
        const link = Object.assign(document.createElement("a"), { href: 'data:text/csv;charset=utf-8,' + encodeURI(csv), download: "bizflow_accounting_export.csv" });
        document.body.appendChild(link).click(); document.body.removeChild(link);
    };

    const selectedJob = useMemo(() => {
        if (!selectedJobId) return null;
        const job = jobs.find(j => j.id === selectedJobId);
        if(!job) return null;
        return { ...job, ...calculateJobTotal(job), customer: customers.find(c => c.id === job.customerId), quote: quotes.find(q => q.jobId === job.id), invoice: invoices.find(i => i.jobId === job.id) };
    }, [selectedJobId, jobs, customers, quotes, invoices]);

    if (loading) return <div className="flex items-center justify-center h-screen bg-gray-100"><Loader className="animate-spin mr-2"/>Loading Business Manager...</div>;
    if (!user || authError) return <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-red-500"><AlertCircle className="w-12 h-12 mb-4"/>Authentication failed. Please refresh. <p className="text-sm mt-2">{authError}</p></div>;

    return (
        <div className="bg-gray-50 font-sans min-h-screen"><div className="flex flex-col md:flex-row">
            <aside className="w-full md:w-64 bg-white md:min-h-screen p-4 border-r border-gray-200 shadow-md">
                <h1 className="text-2xl font-bold text-indigo-600 mb-6">BizFlow</h1>
                <nav className="flex flex-row md:flex-col justify-around md:justify-start">
                    <TabButton icon={<Euro/>} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSelectedJobId(null); }}/>
                    <TabButton icon={<Users/>} label="Customers" isActive={activeTab === 'customers'} onClick={() => { setActiveTab('customers'); setSelectedJobId(null); }}/>
                    <TabButton icon={<Briefcase/>} label="Jobs" isActive={activeTab === 'jobs'} onClick={() => { setActiveTab('jobs'); setSelectedJobId(null); }}/>
                    <TabButton icon={<FileText/>} label="Invoices" isActive={activeTab === 'invoices'} onClick={() => { setActiveTab('invoices'); setSelectedJobId(null); }}/>
                </nav>
                {user && <div className="mt-8 p-3 bg-indigo-50 rounded-lg hidden md:block"><p className="text-xs text-gray-600">Your User ID:</p><p className="text-xs font-mono text-indigo-800 break-all">{user.uid}</p></div>}
            </aside>
            <main className="flex-1 p-4 md:p-8">
                {selectedJobId ? (<JobDetailView key={selectedJobId} job={selectedJob} onBack={() => setSelectedJobId(null)} onSave={handleSaveJob} onGenerateQuote={handleGenerateQuote} onGenerateInvoice={handleGenerateInvoice} onOpenSendModal={(type) => setModal({ type: 'send', data: { docType: type, job: selectedJob } })}/>)
                : (<>
                    <div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-gray-800 capitalize">{activeTab}</h2><div>
                        {activeTab === 'customers' && <ActionButton icon={<Plus/>} label="New Customer" onClick={() => setModal({ type: 'customer' })}/>}
                        {activeTab === 'jobs' && <ActionButton icon={<Plus/>} label="New Job" onClick={() => setModal({ type: 'job' })}/>}
                        {activeTab === 'dashboard' && <ActionButton icon={<Download />} label="Export Data" onClick={handleExport} />}
                    </div></div>
                    {activeTab === 'dashboard' && <DashboardView invoices={invoices} jobs={jobs} quotes={quotes} />}
                    {activeTab === 'customers' && <CustomerListView customers={customers} onEdit={(c) => setModal({ type: 'customer', data: c })}/>}
                    {activeTab === 'jobs' && <JobListView jobs={jobs} customers={customers} onSelectJob={setSelectedJobId}/>}
                    {activeTab === 'invoices' && <InvoiceListView invoices={invoices} jobs={jobs} customers={customers} onUpdateStatus={handleUpdateInvoiceStatus} />}
                </>)}
            </main>
        </div>
        {modal && <Modal onClose={() => setModal(null)}>
            {modal.type === 'customer' && <CustomerForm data={modal.data} onSave={handleSaveCustomer} onClose={() => setModal(null)}/>}
            {modal.type === 'job' && <JobForm data={modal.data} customers={customers} onSave={handleSaveJob} onClose={() => setModal(null)}/>}
            {modal.type === 'send' && <SendDocumentModal data={modal.data} onClose={() => setModal(null)}/>}
        </Modal>}</div>
    );
}

// Wrap App in ErrorBoundary for production
export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

// --- VIEWS / COMPONENTS ---
const DashboardView = ({ invoices, jobs, quotes }) => {
    const unpaidInvoices = invoices.filter(i => i.status === 'Unpaid');
    const totalOwed = unpaidInvoices.reduce((sum, inv) => sum + (inv.invoiceData?.total || 0), 0);
    return (<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Owed" value={formatCurrency(totalOwed)} icon={<Euro className="text-green-500"/>} />
        <StatCard title="Active Jobs" value={jobs.filter(j => ['New', 'Quoted', 'Approved', 'In Progress'].includes(j.status)).length} icon={<Briefcase className="text-blue-500"/>} />
        <StatCard title="Pending Quotes" value={quotes.filter(q => ['Sent', 'Draft'].includes(q.status)).length} icon={<FileText className="text-yellow-500"/>} />
    </div>);
};
const CustomerListView = ({ customers, onEdit }) => (<div className="bg-white rounded-lg shadow p-6">{customers.length>0?customers.map(c=>(<div key={c.id} className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-gray-50 rounded-md"><div><p className="font-semibold text-gray-800">{c.name}</p><p className="text-sm text-gray-500">{c.email} | {c.phone}</p></div><button onClick={()=>onEdit(c)} className="text-gray-400 hover:text-indigo-600"><Edit size={18}/></button></div>)):<p className="text-gray-500">No customers found.</p>}</div>);
const JobListView = ({ jobs, customers, onSelectJob }) => (<div className="bg-white rounded-lg shadow p-6">{jobs.length>0?jobs.map(job=>(<div key={job.id} onClick={()=>onSelectJob(job.id)} className="p-4 border-b last:border-b-0 hover:bg-indigo-50 cursor-pointer rounded-md"><div className="flex justify-between items-center"><div><p className="font-bold text-gray-900">{job.jobTitle}</p><p className="text-sm text-gray-600">{customers.find(c=>c.id===job.customerId)?.name||'...'}</p></div><JobStatusBadge status={job.status}/></div></div>)):<p className="text-gray-500">No jobs found.</p>}</div>);
const InvoiceListView = ({ invoices, jobs, customers, onUpdateStatus }) => (<div className="bg-white rounded-lg shadow p-6">{invoices.length>0?invoices.map(invoice=>{const job=jobs.find(j=>j.id===invoice.jobId);return(<div key={invoice.id} className="p-4 border-b last:border-b-0 flex justify-between items-center"><div><p className="font-bold">{invoice.invoiceNumber}</p><p className="text-sm text-gray-600">{job?.jobTitle} for {customers.find(c=>c.id===job?.customerId)?.name}</p><p className="text-sm font-semibold">{formatCurrency(invoice.invoiceData?.total||0)}</p></div><select value={invoice.status} onChange={(e)=>onUpdateStatus(invoice.id,e.target.value)} className={`p-2 rounded-md text-sm border-0 focus:ring-2 ${invoice.status==='Paid'?'bg-green-100 text-green-800 focus:ring-green-500':'bg-red-100 text-red-800 focus:ring-red-500'}`}><option value="Unpaid">Unpaid</option><option value="Paid">Paid</option></select></div>)}):<p className="text-gray-500">No invoices yet.</p>}</div>);

function JobDetailView({ job, onBack, onSave, onGenerateQuote, onGenerateInvoice, onOpenSendModal }) {
    const [editableJob, setEditableJob] = useState(job);
    const [isSaving, setIsSaving] = useState(false);
    useEffect(() => { setEditableJob(job); }, [job]);
    const handleFieldChange = (field, value) => setEditableJob(p => ({...p, [field]: value}));
    const handleItemChange = (type, i, field, value) => setEditableJob(p => ({ ...p, [type]: p[type].map((item, idx) => idx === i ? { ...item, [field]: value } : item) }));
    const handleAddItem = (type) => setEditableJob(p => ({ ...p, [type]: [...(p[type] || []), type === 'labour' ? { description: '', hours: 1, rate: 50 } : { name: '', quantity: 1, cost: 10 }] }));
    const handleRemoveItem = (type, i) => setEditableJob(p => ({ ...p, [type]: p[type].filter((_, idx) => idx !== i) }));
    const handleSave = async () => { setIsSaving(true); await onSave(editableJob); setIsSaving(false); };

    if (!editableJob) return <div className="flex items-center justify-center h-full"><Loader className="animate-spin mr-2"/>Loading job details...</div>;

    return (<div><button onClick={onBack} className="mb-4 text-indigo-600 font-semibold hover:underline">← Back to Jobs</button><div className="bg-white rounded-lg shadow-lg p-6"><div className="flex justify-between items-start mb-4"><div><h2 className="text-2xl font-bold">{editableJob.jobTitle}</h2><p className="
