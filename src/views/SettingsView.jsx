import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Save, Bell, Folder, Sun, Moon } from 'lucide-react';

const SettingsView = ({ appSettings, onUpdateSetting, handleBackup, handleRestore }) => {
    const [settings, setSettings] = useState(appSettings);

    useEffect(() => {
        setSettings(appSettings);
    }, [appSettings]);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = (key) => {
        onUpdateSetting(key, settings[key]);
    };

    const handleThemeChange = () => {
        const newTheme = settings.theme === 'light' ? 'dark' : 'light';
        handleSettingChange('theme', newTheme);
        onUpdateSetting('theme', newTheme);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <div className="space-y-8">
                {/* Business Profile */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Business Profile</h2>
                    <p className="text-gray-600 mb-4">Manage your company information for quotes and invoices.</p>
                    <Link to="/profile" className="text-indigo-600 font-semibold hover:underline">
                        Edit Business Profile
                    </Link>
                </div>

                {/* Reminders */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Bell className="mr-2" /> Reminders
                    </h2>
                    <div className="flex items-center justify-between">
                        <select
                            value={settings.reminders || 'daily'}
                            onChange={(e) => handleSettingChange('reminders', e.target.value)}
                            className="p-2 border rounded-md"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="never">Never</option>
                        </select>
                        <button onClick={() => handleSave('reminders')} className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center">
                            <Save size={18} className="mr-1" /> Save
                        </button>
                    </div>
                </div>

                {/* Backup Location */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Folder className="mr-2" /> Backup Location
                    </h2>
                    <div className="flex items-center justify-between">
                        <input
                            type="text"
                            value={settings.backupLocation || ''}
                            onChange={(e) => handleSettingChange('backupLocation', e.target.value)}
                            placeholder="/path/to/backup/folder"
                            className="p-2 border rounded-md w-full mr-4"
                        />
                        <button onClick={() => handleSave('backupLocation')} className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center">
                            <Save size={18} className="mr-1" /> Save
                        </button>
                    </div>
                </div>

                {/* Theme */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Sun className="mr-2" /> Theme
                    </h2>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600">Current theme: {settings.theme}</p>
                        <button onClick={handleThemeChange} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center">
                            {settings.theme === 'light' ? <Moon size={18} className="mr-1" /> : <Sun size={18} className="mr-1" />}
                            Switch to {settings.theme === 'light' ? 'Dark' : 'Light'}
                        </button>
                    </div>
                </div>

                {/* Data Management */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Data Management</h2>
                    <div className="flex space-x-4">
                        <button onClick={handleBackup} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Create Backup
                        </button>
                        <button onClick={handleRestore} className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                            Restore from Backup
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        Backups are stored in the location specified above. Restoring from a backup will overwrite all current data.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;