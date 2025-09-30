import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md max-h-full overflow-y-auto">
            <div className="p-4 border-b flex justify-end items-center">
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
            </div>
            <div className="p-4">
                {children}
            </div>
        </div>
    </div>
);

export const ActionButton = ({ icon, label, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors text-sm disabled:bg-indigo-400">
        {icon}
        <span className="ml-2 font-semibold">{label}</span>
    </button>
);

export const JobStatusBadge = ({ status }) => {
    const statusConfig = {
        New: 'bg-blue-100 text-blue-800',
        Quoted: 'bg-yellow-100 text-yellow-800',
        Invoiced: 'bg-purple-100 text-purple-800',
        Paid: 'bg-green-100 text-green-800',
        'In Progress': 'bg-teal-100 text-teal-800',
        Completed: 'bg-green-100 text-green-800'
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[status] || 'bg-gray-100'}`}>{status}</span>;
};