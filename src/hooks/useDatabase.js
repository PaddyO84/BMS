import { useState, useEffect, useCallback } from 'react';
import {
    initializeDB,
    getCustomers as dbGetCustomers,
    addCustomer as dbAddCustomer,
    updateCustomer as dbUpdateCustomer,
    getJobs as dbGetJobs,
    addJob as dbAddJob,
    updateJob as dbUpdateJob,
    getBusinessProfile as dbGetBusinessProfile,
    updateBusinessProfile as dbUpdateBusinessProfile
} from '../services/database';

export const useDatabase = () => {
    const [db, setDb] = useState(null);
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [profile, setProfile] = useState(null);

    const loadData = useCallback(async (currentDb) => {
        if (!currentDb) return;
        try {
            const [customersRes, jobsRes, profileRes] = await Promise.all([
                dbGetCustomers(),
                dbGetJobs(),
                dbGetBusinessProfile()
            ]);
            setCustomers(customersRes.values || []);
            setJobs(jobsRes.values || []);
            setProfile(profileRes || null);
        } catch (e) {
            console.error("Error loading data", e);
        }
    }, []);


    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const dbInstance = await initializeDB();
                setDb(dbInstance);
                await loadData(dbInstance);
            } catch (err) {
                console.error("Initialization error", err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [loadData]);

    const refreshData = useCallback(async () => {
        await loadData(db);
    }, [db, loadData]);

    const addCustomer = async (customer) => {
        await dbAddCustomer(customer);
        await refreshData();
    };

    const updateCustomer = async (customer) => {
        await dbUpdateCustomer(customer);
        await refreshData();
    };

    const addJob = async (job) => {
        const newJobId = await dbAddJob(job);
        await refreshData();
        return newJobId;
    };

    const updateJob = async (job) => {
        await dbUpdateJob(job);
        await refreshData();
    };

    const updateBusinessProfile = async (newProfile) => {
        await dbUpdateBusinessProfile(newProfile);
        await refreshData();
    };


    return {
        loading,
        customers,
        jobs,
        profile,
        addCustomer,
        updateCustomer,
        addJob,
        updateJob,
        updateBusinessProfile,
        refreshData
    };
};