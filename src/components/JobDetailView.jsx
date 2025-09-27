import React, { useState, useEffect } from 'react';
import { Loader, Plus, Trash2, ArrowLeft, Save, FileText } from 'lucide-react';
import { formatCurrency, formatDate, generatePdf } from '../utils/helpers';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const JobDetailView = ({ job, profile, onBack, onSave }) => {
    const [editableJob, setEditableJob] = useState(job);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEditableJob(job);
    }, [job]);

    const handleFieldChange = (field, value) => {
        setEditableJob(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (type, index, field, value) => {
        const items = editableJob[type].map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setEditableJob(prev => ({ ...prev, [type]: items }));
    };

    const handleAddItem = (type) => {
        const newItem = type === 'labour'
            ? { description: '', hours: 1, rate: 50 }
            : { name: '', quantity: 1, cost: 10 };
        setEditableJob(prev => ({ ...prev, [type]: [...(prev[type] || []), newItem] }));
    };

    const handleRemoveItem = (type, index) => {
        const items = editableJob[type].filter((_, i) => i !== index);
        setEditableJob(prev => ({ ...prev, [type]: items }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(editableJob);
        setIsSaving(false);
    };

    const handleGenerateAndShare = async (docType) => {
        const number = `${docType.toUpperCase()}-${job.id}`;
        const pdfData = generatePdf(docType, {
            number: number,
            job: job,
            customer: job.customer,
            issueDate: formatDate(new Date()),
            dueDate: docType === 'invoice' ? formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) : null,
        }, profile);

        const fileName = `${number}.pdf`;

        try {
            const result = await Filesystem.writeFile({
                path: fileName,
                data: pdfData,
                directory: Directory.Documents,
                recursive: true
            });

            await Share.share({
                title: `${docType.charAt(0).toUpperCase() + docType.slice(1)} for ${job.jobTitle}`,
                text: `Here is the ${docType} for ${job.jobTitle}.`,
                url: result.uri,
                dialogTitle: `Share ${docType}`,
            });

        } catch (error) {
            console.error("Error sharing file", error);
            alert(`Could not share ${docType}. Please try again.`);
        }
    };

    if (!editableJob) {
        return <div className="flex items-center justify-center h-full"><Loader className="animate-spin mr-2"/>Loading...</div>;
    }

    return (
        <div>
            <button onClick={onBack} className="flex items-center mb-4 text-indigo-600 font-semibold hover:underline">
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
                        <button onClick={() => handleGenerateAndShare('quote')} className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center"><FileText size={16} className="mr-1"/>Quote</button>
                        <button onClick={() => handleGenerateAndShare('invoice')} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"><FileText size={16} className="mr-1"/>Invoice</button>
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
                    {editableJob.labour?.map((item, i) => (
                        <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-center">
                            <input type="text" value={item.description} onChange={e => handleItemChange('labour', i, 'description', e.target.value)} className="col-span-2 p-2 border rounded-md" placeholder="Description" />
                            <input type="number" value={item.hours} onChange={e => handleItemChange('labour', i, 'hours', parseFloat(e.target.value))} className="p-2 border rounded-md" placeholder="Hours" />
                            <input type="number" value={item.rate} onChange={e => handleItemChange('labour', i, 'rate', parseFloat(e.target.value))} className="p-2 border rounded-md" placeholder="Rate" />
                            <button onClick={() => handleRemoveItem('labour', i)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                        </div>
                    ))}
                    <button onClick={() => handleAddItem('labour')} className="mt-2 text-indigo-600 flex items-center"><Plus size={16} className="mr-1"/>Add Labour</button>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-2">Materials</h3>
                    {editableJob.materials?.map((item, i) => (
                        <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-center">
                            <input type="text" value={item.name} onChange={e => handleItemChange('materials', i, 'name', e.target.value)} className="col-span-2 p-2 border rounded-md" placeholder="Material Name" />
                            <input type="number" value={item.quantity} onChange={e => handleItemChange('materials', i, 'quantity', parseFloat(e.target.value))} className="p-2 border rounded-md" placeholder="Quantity" />
                            <input type="number" value={item.cost} onChange={e => handleItemChange('materials', i, 'cost', parseFloat(e.target.value))} className="p-2 border rounded-md" placeholder="Cost" />
                            <button onClick={() => handleRemoveItem('materials', i)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                        </div>
                    ))}
                    <button onClick={() => handleAddItem('materials')} className="mt-2 text-indigo-600 flex items-center"><Plus size={16} className="mr-1"/>Add Material</button>
                </div>

                <div className="mt-6 pt-4 border-t-2 text-right">
                    <p className="text-gray-600">Subtotal: {formatCurrency(job.subTotal)}</p>
                    <p className="text-gray-600">VAT ({job.taxRate}%): {formatCurrency(job.taxAmount)}</p>
                    <p className="text-xl font-bold">Total: {formatCurrency(job.total)}</p>
                </div>
            </div>
        </div>
    );
};

export default JobDetailView;