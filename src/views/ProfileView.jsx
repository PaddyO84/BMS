import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { ActionButton } from '../components/ui';

const ProfileView = ({ profile, onSave, isSaving }) => {
    const [editableProfile, setEditableProfile] = useState(profile);
    const [logoPreview, setLogoPreview] = useState(profile?.logo);
    const fileInputRef = React.useRef(null);

    const handleChange = (e) => setEditableProfile(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
                setEditableProfile(p => ({ ...p, logo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(editableProfile);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Business Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center space-x-4">
                    <img src={logoPreview || 'https://via.placeholder.com/100'} alt="Logo" className="w-24 h-24 rounded-full object-cover" />
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" ref={fileInputRef} />
                    <button type="button" onClick={() => fileInputRef.current.click()} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
                        Change Logo
                    </button>
                </div>
                <input name="name" value={editableProfile?.name || ''} onChange={handleChange} placeholder="Business Name" className="w-full p-2 border rounded" />
                <textarea name="address" value={editableProfile?.address || ''} onChange={handleChange} placeholder="Address" className="w-full p-2 border rounded" rows="3" />
                <input name="email" value={editableProfile?.email || ''} onChange={handleChange} placeholder="Email" type="email" className="w-full p-2 border rounded" />
                <input name="phone" value={editableProfile?.phone || ''} onChange={handleChange} placeholder="Phone" className="w-full p-2 border rounded" />
                <input name="mobile" value={editableProfile?.mobile || ''} onChange={handleChange} placeholder="Mobile" className="w-full p-2 border rounded" />
                <input name="vatNumber" value={editableProfile?.vatNumber || ''} onChange={handleChange} placeholder="VAT Number" className="w-full p-2 border rounded" />
                <div className="flex justify-end">
                    <ActionButton icon={<Save size={16} />} label={isSaving ? 'Saving...' : 'Save Profile'} onClick={handleSubmit} disabled={isSaving} />
                </div>
            </form>
        </div>
    );
};

export default ProfileView;