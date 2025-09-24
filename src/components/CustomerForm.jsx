import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

const CustomerForm = ({ data, onSave, onClose }) => {
    const [customer, setCustomer] = useState(data || { name: '', email: '', phone: '', address: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomer(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(customer);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg">
            <h2 className="text-2xl font-bold mb-6">{data ? 'Edit Customer' : 'New Customer'}</h2>
            <div className="grid grid-cols-1 gap-4">
                <input name="name" value={customer.name} onChange={handleChange} placeholder="Name" className="p-2 border rounded-md" required />
                <input name="email" type="email" value={customer.email} onChange={handleChange} placeholder="Email" className="p-2 border rounded-md" required />
                <input name="phone" value={customer.phone} onChange={handleChange} placeholder="Phone" className="p-2 border rounded-md" />
                <input name="address" value={customer.address} onChange={handleChange} placeholder="Address" className="p-2 border rounded-md" />
            </div>
            <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={onClose} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center">
                    <X size={18} className="mr-1" /> Cancel
                </button>
                <button type="submit" className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center">
                    <Save size={18} className="mr-1" /> Save
                </button>
            </div>
        </form>
    );
};

export default CustomerForm;
