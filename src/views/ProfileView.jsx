import React from 'react';
import ProfileForm from '../components/ProfileForm';

const ProfileView = ({ profile, onSave }) => {
    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Business Profile</h2>
            <div className="bg-white rounded-lg shadow p-6">
                <ProfileForm profile={profile} onSave={onSave} />
            </div>
        </div>
    );
};

export default ProfileView;