import React from 'react';
import { Euro, Briefcase, FileText } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    </div>
);

const DashboardView = ({ invoices, jobs, quotes }) => {
    const unpaidInvoices = invoices.filter(i => i.status === 'Unpaid');
    const totalOwed = unpaidInvoices.reduce((sum, inv) => sum + (inv.invoiceData?.total || 0), 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Owed" value={formatCurrency(totalOwed)} icon={<Euro className="text-green-500"/>} />
            <StatCard title="Active Jobs" value={jobs.filter(j => ['New', 'Quoted', 'Approved', 'In Progress'].includes(j.status)).length} icon={<Briefcase className="text-blue-500"/>} />
            <StatCard title="Pending Quotes" value={quotes.filter(q => ['Sent', 'Draft'].includes(q.status)).length} icon={<FileText className="text-yellow-500"/>} />
        </div>
    );
};

export default DashboardView;