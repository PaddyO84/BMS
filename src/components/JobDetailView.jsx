import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Plus, Trash2, ArrowLeft, Save, FileText } from 'lucide-react';
import { calculateJobTotal, formatDate } from '../utils/helpers';
import { generateInvoice } from '../services/pdf';

const JobDetailView = ({ job, profile, onSave }) => {
    const [editableJob, setEditableJob] = useState(job);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Recalculate totals when job data changes
        if (job) {
            const totals = calculateJobTotal(job);
            setEditableJob({ ...job, ...totals });
        }
    }, [job]);

    const handleFieldChange = (field, value) => {
        setEditableJob(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (type, index, field, value) => {
        const items = editableJob[type].map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        const newJobState = { ...editableJob, [type]: items };
        const totals = calculateJobTotal(newJobState);
        setEditableJob({ ...newJobState, ...totals });
    };

    const handleAddItem = (type) => {
        const newItem = type === 'labour'
            ? { description: '', hours: 1, rate: 50 }
            : { name: '', quantity: 1, cost: 10 };
        const newJobState = { ...editableJob, [type]: [...(editableJob[type] || []), newItem] };
        const totals = calculateJobTotal(newJobState);
        setEditableJob({ ...newJobState, ...totals });
    };

    const handleRemoveItem = (type, index) => {
        const items = editableJob[type].filter((_, i) => i !== index);
        const newJobState = { ...editableJob, [type]: items };
        const totals = calculateJobTotal(newJobState);
        setEditableJob({ ...newJobState, ...totals });
    };

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(editableJob);
        setIsSaving(false);
    };
    
    const handleDownloadInvoice = () => {
        if (editableJob && profile) {
            generateInvoice(editableJob, profile);
        }
    };

    if (!editableJob) {
        return <div className="flex items-center justify-center h-full"><Loader className="animate-spin mr-2"/>Loading...</div>;
    }

    return (
        <div>
            <button onClick={() => navigate('/jobs')} className="flex items-center mb-4 text-indigo-600 font-semibold hover:underline">
                <ArrowLeft size={18} className="mr-1" />
                Back to Jobs
            </button>
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">{editableJob.jobTitle}</h2>
                        <p className="text-gray-600">{editableJob.customer?.name}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={handleDownloadInvoice} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"><FileText size={16} className="mr-1"/>Download Invoice</button>
                        <button onClick={handleSave} className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center" disabled={isSaving}>
                            {isSaving ? <Loader size={16} className="animate-spin mr-1"/> : <Save size={16} className="mr-1" />}
                            Save
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" value={editableJob.jobTitle} onChange={e => handleFieldChange('jobTitle', e.target.value)} className="p-2 border rounded-md" placeholder="Job Title" />
                    <select value={editableJob.status} onChange={e => handleFieldChange('status', e.target.value)} className="p-2 border rounded-md">
                        <option>New</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                    </select>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-2">Labour</h3>
                    {(editableJob.labour || []).map((item, i) => (
                        <div key={i} className="grid grid-cols-5 gap-2 mb-2 items-center">
                            <input type="text" value={item.description} onChange={e => handleItemChange('labour', i, 'description', e.target.value)} className="col-span-2 p-2 border rounded-md" placeholder="Description" />
                            <input type="number" value={item.hours} onChange={e => handleItemChange('labour', i, 'hours', parseFloat(e.target.value) || 0)} className="p-2 border rounded-md" placeholder="Hours" />
                            <input type="number" value={item.rate} onChange={e => handleItemChange('labour', i, 'rate', parseFloat(e.target.value) || 0)} className="p-2 border rounded-md" placeholder="Rate" />
                            <button onClick={() => handleRemoveItem('labour', i)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                        </div>
                    ))}
                    <button onClick={() => handleAddItem('labour')} className="mt-2 text-indigo-600 flex items-center"><Plus size={16} className="mr-1"/>Add Labour</button>
                </div>
                
                <div className="mt-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-2">Materials</h3>
                    {(editableJob.materials || []).map((item, i) => (
                        <div key={i} className="grid grid-cols-5 gap-2 mb-2 items-center">
                            <input type="text" value={item.name} onChange={e => handleItemChange('materials', i, 'name', e.target.value)} className="col-span-2 p-2 border rounded-md" placeholder="Material Name" />
                            <input type="number" value={item.quantity} onChange={e => handleItemChange('materials', i, 'quantity', parseFloat(e.target.value) || 0)} className="p-2 border rounded-md" placeholder="Quantity" />
                            <input type="number" value={item.cost} onChange={e => handleItemChange('materials', i, 'cost', parseFloat(e.target.value) || 0)} className="p-2 border rounded-md" placeholder="Cost" />
                            <button onClick={() => handleRemoveItem('materials', i)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                        </div>
                    ))}
                    <button onClick={() => handleAddItem('materials')} className="mt-2 text-indigo-600 flex items-center"><Plus size={16} className="mr-1"/>Add Material</button>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="flex items-center">
                        <label className="mr-2">Tax Rate (%):</label>
                        <input 
                            type="number" 
                            value={editableJob.taxRate || 0} 
                            onChange={e => handleFieldChange('taxRate', parseFloat(e.target.value) || 0)} 
                            className="p-2 border rounded-md w-24"
                        />
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t-2 text-right">
                    <p className="text-gray-600">Subtotal: €{editableJob.subTotal?.toFixed(2)}</p>
                    <p className="text-gray-600">VAT ({editableJob.taxRate || 0}%): €{editableJob.taxAmount?.toFixed(2)}</p>
                    <p className="text-xl font-bold">Total: €{editableJob.total?.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
};

export default JobDetailView;