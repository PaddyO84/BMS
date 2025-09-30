import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

const JobForm = ({ data, customers, onSave, onClose }) => {
    const [job, setJob] = useState(data || { jobTitle: '', customerId: '', status: 'New' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setJob(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!job.customerId) {
            alert("Please select a customer.");
            return;
        }
        await onSave(job);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg">
            <h2 className="text-2xl font-bold mb-6">{data ? 'Edit Job' : 'New Job'}</h2>
            <div className="grid grid-cols-1 gap-4">
                <input name="jobTitle" value={job.jobTitle} onChange={handleChange} placeholder="Job Title" className="p-2 border rounded-md" required />
                <select name="customerId" value={job.customerId} onChange={handleChange} className="p-2 border rounded-md" required>
                    <option value="">Select a Customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={onClose} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center">
                    <X size={18} className="mr-1" /> Cancel
                </button>
                <button type="submit" className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center">
                    <Save size={18} className="mr-1" /> Save Job
                </button>
            </div>
        </form>
    );
};

export default JobForm;