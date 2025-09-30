import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Download, ChevronLeft } from 'lucide-react';
import { ActionButton } from '../components/ui';
import { formatCurrency, calculateJobTotal, generatePdf } from '../services/utils';

const JobDetailView = ({ job, onBack, onSave, isSaving, profile }) => {
    const [editableJob, setEditableJob] = useState(job);

    useEffect(() => {
        setEditableJob(job);
    }, [job]);

    const handleFieldChange = (field, value) => setEditableJob(p => ({ ...p, [field]: value }));
    const handleItemChange = (type, i, field, value) => {
        const updatedItems = editableJob[type].map((item, idx) => idx === i ? { ...item, [field]: value } : item);
        setEditableJob(prev => ({ ...prev, [type]: updatedItems }));
    };
    const handleAddItem = (type) => setEditableJob(p => ({ ...p, [type]: [...(p[type] || []), type === 'labour' ? { description: '', hours: 1, rate: 50 } : { name: '', quantity: 1, cost: 10 }] }));
    const handleRemoveItem = (type, i) => setEditableJob(p => ({ ...p, [type]: p[type].filter((_, idx) => idx !== i) }));

    const handleSave = async () => {
        await onSave(editableJob);
    };

    useEffect(() => {
        if (editableJob) {
            const totals = calculateJobTotal(editableJob);
            if (totals.total !== editableJob.total || totals.subTotal !== editableJob.subTotal) {
                setEditableJob(prev => ({ ...prev, ...totals }));
            }
        }
    }, [editableJob?.labour, editableJob?.materials, editableJob?.taxRate]);

    if (!editableJob) return <div className="flex items-center justify-center h-full"><Loader className="animate-spin mr-2" />Loading job details...</div>;

    const handleGeneratePdf = () => {
        generatePdf('Invoice', {
            number: `INV-${job.id}`,
            job: editableJob,
            customer: job.customer,
            issueDate: new Date().toLocaleDateString('en-GB'),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')
        }, profile);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-start mb-4 space-y-4 md:space-y-0">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold">{editableJob.jobTitle}</h2>
                    <p className="text-gray-500">{job.customer?.name}</p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
                    <ActionButton icon={<Save size={16} />} label={isSaving ? 'Saving...' : 'Save Job'} onClick={handleSave} disabled={isSaving} />
                    <ActionButton icon={<Download size={16} />} label="Download PDF" onClick={handleGeneratePdf} />
                    <button onClick={onBack} className="flex items-center justify-center w-full sm:w-auto px-4 py-2 rounded-md hover:bg-gray-100">
                        <ChevronLeft size={16} className="mr-1" />
                        Back
                    </button>
                </div>
            </div>
            <div className="mt-6">
                <div>
                    <h3 className="text-lg font-bold">Labour</h3>
                    {(editableJob.labour || []).map((l, i) => (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-2 items-center">
                            <input type="text" placeholder="Description" value={l.description} onChange={e => handleItemChange('labour', i, 'description', e.target.value)} className="p-2 border rounded w-full sm:col-span-2" />
                            <input type="number" placeholder="Hours" value={l.hours} onChange={e => handleItemChange('labour', i, 'hours', parseFloat(e.target.value))} className="p-2 border rounded w-full" />
                            <input type="number" placeholder="Rate" value={l.rate} onChange={e => handleItemChange('labour', i, 'rate', parseFloat(e.target.value))} className="p-2 border rounded w-full" />
                            <button onClick={() => handleRemoveItem('labour', i)} className="text-red-500 sm:justify-self-center"><Trash2 /></button>
                        </div>
                    ))}
                    <button onClick={() => handleAddItem('labour')} className="mt-2 text-indigo-600 flex items-center">
                        <Plus size={16} className="mr-1" />Add Labour
                    </button>
                </div>
                <div className="mt-4">
                    <h3 className="text-lg font-bold">Materials</h3>
                    {(editableJob.materials || []).map((m, i) => (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-2 items-center">
                            <input type="text" placeholder="Name" value={m.name} onChange={e => handleItemChange('materials', i, 'name', e.target.value)} className="p-2 border rounded w-full sm:col-span-2" />
                            <input type="number" placeholder="Quantity" value={m.quantity} onChange={e => handleItemChange('materials', i, 'quantity', parseFloat(e.target.value))} className="p-2 border rounded w-full" />
                            <input type="number" placeholder="Cost" value={m.cost} onChange={e => handleItemChange('materials', i, 'cost', parseFloat(e.target.value))} className="p-2 border rounded w-full" />
                            <button onClick={() => handleRemoveItem('materials', i)} className="text-red-500 sm:justify-self-center"><Trash2 /></button>
                        </div>
                    ))}
                    <button onClick={() => handleAddItem('materials')} className="mt-2 text-indigo-600 flex items-center">
                        <Plus size={16} className="mr-1" />Add Material
                    </button>
                </div>
            </div>
            <div className="mt-6 text-right">
                <p>Subtotal: {formatCurrency(editableJob.subTotal)}</p>
                <div className="flex items-center justify-end">
                    <p className="mr-2">Tax (%):</p>
                    <input type="number" value={editableJob.taxRate || 13.5} onChange={e => handleFieldChange('taxRate', parseFloat(e.target.value))} className="p-1 border rounded w-20 text-right" />
                </div>
                <p>Tax Amount: {formatCurrency(editableJob.taxAmount)}</p>
                <p className="font-bold text-lg">Total: {formatCurrency(editableJob.total)}</p>
            </div>
        </div>
    );
};

export default JobDetailView;