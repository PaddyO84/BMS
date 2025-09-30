import React from 'react';
import ProfileForm from '../components/ProfileForm';
import { Save } from 'lucide-react';

const ProfileView = ({ profile, onSave, handleBackup }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Business Profile</h2>
                <button
                    onClick={handleBackup}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors"
                >
                    <Save size={18} className="mr-2" />
                    Backup Now
                </button>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
                <ProfileForm profile={profile} onSave={onSave} />
            </div>
        </div>
    );
};

export default ProfileView;