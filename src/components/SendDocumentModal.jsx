import React from 'react';
import { Send, X } from 'lucide-react';

const SendDocumentModal = ({ data, onClose }) => {
    const { docType, job } = data;

    const handleSend = () => {
        alert(`Sending ${docType} for job: ${job.jobTitle}... (Feature not implemented)`);
        onClose();
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Send {docType}</h2>
            <p>To: {job.customer?.email || 'N/A'}</p>
            <p className="my-4">This will send the {docType} to the customer's email address. </p>
            <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={onClose} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center">
                    <X size={18} className="mr-1" /> Cancel
                </button>
                <button onClick={handleSend} className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center">
                    <Send size={18} className="mr-1" /> Send
                </button>
            </div>
        </div>
    );
};

export default SendDocumentModal;