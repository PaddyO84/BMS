import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Users, Plus } from 'lucide-react';

const CustomerListView = ({ customers, onEdit, setModal }) => (
    <div className="p-4">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Customers</h1>
            <button onClick={() => setModal({ type: 'customer', data: {} })} className="bg-blue-600 text-white p-2 rounded-full">
                <Plus size={24} />
            </button>
        </div>
        <div className="bg-white rounded-lg shadow">
            <div className="p-6">
                {customers.length > 0 ? (
                    customers.map(c => (
                        <div key={c.id} className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-gray-50 rounded-md">
                            <Link to={`/customer/${c.id}`} className="flex-grow">
                                <p className="font-semibold text-gray-800">{c.name} <span className="text-sm text-gray-600 font-normal">{c.roleTitle ? `- ${c.roleTitle}` : ''}</span></p>
                                <p className="text-sm text-gray-600">{c.companyName}</p>
                                <p className="text-sm text-gray-500">{c.email} | {c.phoneNumbers}</p>
                            </Link>
                            <button onClick={() => onEdit(c)} className="text-gray-400 hover:text-indigo-600 ml-4">
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
    </div>
);

export default CustomerListView;