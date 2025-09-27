import React, { useState } from 'react';
import { Save, Image as ImageIcon } from 'lucide-react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const ProfileForm = ({ profile, onSave }) => {
    const [formData, setFormData] = useState(profile);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Photos, // Or CameraSource.Camera
            });

            if (image.dataUrl) {
                setFormData(prev => ({ ...prev, logo: image.dataUrl }));
            }
        } catch (error) {
            console.error("Error selecting image:", error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Section */}
                <div className="md:col-span-2 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 flex items-center justify-center overflow-hidden">
                        {formData.logo ? (
                            <img src={formData.logo} alt="Business Logo" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon size={48} className="text-gray-400" />
                        )}
                    </div>
                    <button type="button" onClick={handleLogoChange} className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200">
                        Change Logo
                    </button>
                </div>

                {/* Text Fields */}
                <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Business Name" className="p-2 border rounded-md" />
                <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Address" className="p-2 border rounded-md" />
                <input name="email" type="email" value={formData.email || ''} onChange={handleChange} placeholder="Email" className="p-2 border rounded-md" />
                <input name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="Phone" className="p-2 border rounded-md" />
                <input name="mobile" value={formData.mobile || ''} onChange={handleChange} placeholder="Mobile" className="p-2 border rounded-md" />
                <input name="vatNumber" value={formData.vatNumber || ''} onChange={handleChange} placeholder="VAT Number" className="p-2 border rounded-md" />
            </div>

            <div className="flex justify-end mt-8">
                <button type="submit" className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center">
                    <Save size={18} className="mr-1" /> Save Profile
                </button>
            </div>
        </form>
    );
};

export default ProfileForm;