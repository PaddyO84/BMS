import React from 'react';
import { Edit } from 'lucide-react';

const CustomerListView = ({ customers, onEdit }) => (
    <div className="bg-white rounded-lg shadow p-6">
        {customers.length > 0 ? (
            customers.map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-gray-50 rounded-md">
                    <div>
                        <p className="font-semibold text-gray-800">{c.name}</p>
                        <p className="text-sm text-gray-500">{c.email} | {c.phone}</p>
                    </div>
                    <button onClick={() => onEdit(c)} className="text-gray-400 hover:text-indigo-600">
                        <Edit size={18} />
                    </button>
                </div>
            ))
        ) : (
            <p className="text-gray-500">No customers found.</p>
        )}
    </div>
);

export default CustomerListView;