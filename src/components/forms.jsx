import React, { useState } from 'react';

export const CustomerForm = ({ data, onSave, onClose, isSaving }) => {
    const [customer, setCustomer] = useState(data || { name: '', email: '', phone: '', address: '' });
    const handleChange = (e) => setCustomer(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(customer); };
    return (
        <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-semibold mb-4">{data?.id ? 'Edit Customer' : 'New Customer'}</h3>
            <fieldset disabled={isSaving} className="space-y-3">
                <input name="name" value={customer.name} onChange={handleChange} placeholder="Name" className="w-full p-2 border rounded" required />
                <input name="email" value={customer.email} onChange={handleChange} placeholder="Email" type="email" className="w-full p-2 border rounded" />
                <input name="phone" value={customer.phone} onChange={handleChange} placeholder="Phone" className="w-full p-2 border rounded" />
                <textarea name="address" value={customer.address} onChange={handleChange} placeholder="Address" className="w-full p-2 border rounded" rows="3" />
            </fieldset>
            <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-2 space-y-reverse sm:space-y-0">
                <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 w-full sm:w-auto disabled:bg-indigo-400" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 w-full sm:w-auto" disabled={isSaving}>
                    Cancel
                </button>
            </div>
        </form>
    );
};

export const JobForm = ({ data, customers, onSave, onClose, isSaving }) => {
    const [job, setJob] = useState(data || { jobTitle: '', customerId: '', status: 'New' });
    const handleChange = (e) => setJob(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(job); };
    return (
        <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-semibold mb-4">{data?.id ? 'Edit Job' : 'New Job'}</h3>
            <fieldset disabled={isSaving} className="space-y-3">
                <input name="jobTitle" value={job.jobTitle} onChange={handleChange} placeholder="Job Title" className="w-full p-2 border rounded" required />
                <select name="customerId" value={job.customerId} onChange={handleChange} className="w-full p-2 border rounded" required>
                    <option value="">Select Customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </fieldset>
            <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-2 space-y-reverse sm:space-y-0">
                <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 w-full sm:w-auto" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 w-full sm:w-auto" disabled={isSaving}>
                    Cancel
                </button>
            </div>
        </form>
    );
};