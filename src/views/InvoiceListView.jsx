import React from 'react';
import { FileText } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

const InvoiceListView = ({ invoices, jobs, customers, onUpdateStatus }) => {
    const customerMap = React.useMemo(() =>
        customers.reduce((acc, c) => {
            acc[c.id] = c.name;
            return acc;
        }, {}), [customers]);

    const jobMap = React.useMemo(() =>
        jobs.reduce((acc, j) => {
            acc[j.id] = j;
            return acc;
        }, {}), [jobs]);

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6">
                {invoices.length > 0 ? (
                    invoices.map(invoice => {
                        const job = jobMap[invoice.jobId];
                        const customerName = job ? customerMap[job.customerId] : 'N/A';
                        const statusColor = invoice.status === 'Paid'
                            ? 'bg-green-100 text-green-800 focus:ring-green-500'
                            : 'bg-red-100 text-red-800 focus:ring-red-500';

                        return (
                            <div key={invoice.id} className="p-4 border-b last:border-b-0 flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{invoice.invoiceNumber}</p>
                                    <p className="text-sm text-gray-600">{job?.jobTitle} for {customerName}</p>
                                    <p className="text-sm font-semibold">{formatCurrency(invoice.invoiceData?.total || 0)}</p>
                                </div>
                                <select
                                    value={invoice.status}
                                    onChange={(e) => onUpdateStatus(invoice.id, e.target.value)}
                                    className={`p-2 rounded-md text-sm border-0 focus:ring-2 ${statusColor}`}
                                >
                                    <option value="Unpaid">Unpaid</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No invoices yet.</h3>
                        <p>Generate an invoice from a job to see it here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceListView;