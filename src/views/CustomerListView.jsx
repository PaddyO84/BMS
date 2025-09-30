import React from 'react';
import { Edit, Users } from 'lucide-react';

const CustomerListView = ({ customers, onEdit }) => (
    <div className="bg-white rounded-lg shadow">
        <div className="p-6">
            {customers.length > 0 ? (
                customers.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-gray-50 rounded-md">
                        <div>
                            <p className="font-semibold text-gray-800">{c.name}</p>
                            <p className="text-sm text-gray-500">{c.email} | {c.phone}</p>
                        </div>
                        <button onClick={() => onEdit(c)} className="text-gray-400 hover:text-indigo-600">
                            <Edit size={18}/>
                        </button>
                    </div>
                ))
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <Users size={48} className="mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No customers found.</h3>
                    <p>Add a new customer to get started.</p>
                </div>
            )}
        </div>
    </div>
);

export default CustomerListView;