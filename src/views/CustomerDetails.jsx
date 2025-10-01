import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';

const CustomerDetails = ({ customers, jobs, setModal }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const customer = customers.find(c => c.id === parseInt(id));
    const customerJobs = jobs.filter(j => j.customerId === parseInt(id));

    if (!customer) {
        return <div className="p-4">Customer not found.</div>;
    }

    const handleAddJob = () => {
        setModal({ type: 'job', data: { customerId: customer.id } });
    };

    return (
        <div className="p-4">
            <button onClick={() => navigate('/customers')} className="flex items-center mb-4 text-indigo-600 font-semibold hover:underline">
                <ArrowLeft size={18} className="mr-1" />
                Back to Customers
            </button>
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold">{customer.name}</h1>
                    {customer.roleTitle && <p className="text-md text-gray-600">{customer.roleTitle}</p>}
                    {customer.companyName && <p className="text-md text-gray-600">{customer.companyName}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <p><strong>Email:</strong> {customer.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {customer.phoneNumbers || 'N/A'}</p>
                    <p className="md:col-span-2"><strong>Address:</strong> {customer.address || 'N/A'}</p>
                </div>
            </div>

            <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Jobs</h2>
                    <button onClick={handleAddJob} className="bg-blue-600 text-white p-2 rounded-full">
                        <Plus size={24} />
                    </button>
                </div>
                {customerJobs.length > 0 ? (
                    <ul className="bg-white rounded-lg shadow">
                        {customerJobs.map(job => (
                            <li key={job.id} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                                <Link to={`/job/${job.id}`} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800">{job.jobTitle}</p>
                                        <p className="text-sm text-gray-500">
                                            {job.status} - {job.dateRequested ? new Date(job.dateRequested).toLocaleDateString() : 'No date'}
                                        </p>
                                    </div>
                                    <p className="font-semibold">€{job.total?.toFixed(2)}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No jobs found for this customer.</p>
                )}
            </div>
        </div>
    );
};

export default CustomerDetails;