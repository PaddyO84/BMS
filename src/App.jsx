import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import * as db from './services/database';
import * as backup from './services/backup';
import { calculateJobTotal } from './utils/helpers';
import AppRouter from './Router';

function App() {
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [profile, setProfile] = useState(null);
    const [modal, setModal] = useState(null);

    const fetchData = async () => {
        const customersData = (await db.getCustomers()).values || [];
        setCustomers([...customersData]);
        const jobsData = (await db.getJobs()).values || [];
        setJobs([...jobsData]);
        const profileData = await db.getBusinessProfile();
        setProfile(profileData);
    };

    const handleSaveProfile = async (profileData) => {
        await db.updateBusinessProfile(profileData);
        await fetchData();
    };

    const handleBackup = async () => {
        const success = await backup.createBackup();
        if (success) {
            alert('Backup created successfully!');
        } else {
            alert('Backup failed. Check logs for details.');
        }
    };

    useEffect(() => {
        const setup = async () => {
            try {
                await db.initializeDB();
                await fetchData();

                if (Capacitor.isNativePlatform()) {
                    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
                        if (isActive) {
                            fetchData();
                        }
                    });
                }
                
                const lastBackup = await backup.getLastBackupTimestamp();
                const oneDay = 24 * 60 * 60 * 1000;
                if (Date.now() - lastBackup > oneDay) {
                    await backup.createBackup();
                }
            } catch (err) {
                console.error("Error during app setup:", err);
            } finally {
                setLoading(false);
            }
        };
        setup();
    }, []);

    const handleSaveCustomer = async (customerData) => {
        if (customerData.id) {
            await db.updateCustomer(customerData);
        } else {
            await db.addCustomer(customerData);
        }
        setModal(null);
        await fetchData();
    };

    const handleSaveJob = async (jobData) => {
        let newJobId = null;
        if (jobData.id) {
            const totals = calculateJobTotal(jobData);
            const jobWithTotals = { ...jobData, ...totals };
            await db.updateJob(jobWithTotals);
        } else {
            newJobId = await db.addJob(jobData);
        }
        setModal(null);
        await fetchData();
        return newJobId;
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-gray-100"><Loader className="animate-spin mr-2"/>Loading...</div>;
    }

    return (
        <AppRouter
            customers={customers}
            jobs={jobs}
            profile={profile}
            onSaveProfile={handleSaveProfile}
            onSaveCustomer={handleSaveCustomer}
            onSaveJob={handleSaveJob}
            onRefresh={fetchData}
            modal={modal}
            setModal={setModal}
        />
    );
}

export default App;