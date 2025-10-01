import React from 'react';
import { HashRouter as Router, Routes, Route, useParams } from 'react-router-dom';

import MainLayout from './components/layout/MainLayout';
import JobsView from './views/JobsView';
import CalendarView from './views/CalendarView';
import RemindersView from './views/RemindersView';
import SettingsView from './views/SettingsView';
import JobDetailView from './components/JobDetailView';
import CustomerListView from './views/CustomerListView';
import ProfileView from './views/ProfileView';

const AppRouter = ({
    customers,
    jobs,
    profile,
    appSettings,
    onSaveProfile,
    onUpdateSetting,
    onSaveCustomer,
    onSaveJob,
    handleBackup,
    handleRestore,
    modal,
    setModal,
}) => {
    const JobDetailWrapper = () => {
        const { id } = useParams();
        const selectedJob = React.useMemo(() => {
            if (!id) return null;
            const job = jobs.find(j => j.id === parseInt(id));
            if (!job) return null;
            return {
                ...job,
                customer: customers.find(c => c.id === job.customerId),
            };
        }, [id, jobs, customers]);

        return <JobDetailView job={selectedJob} profile={profile} onSave={onSaveJob} />;
    };

    return (
        <Router>
            <MainLayout>
                <Routes>
                    <Route path="/" element={<JobsView jobs={jobs} customers={customers} />} />
                    <Route path="/calendar" element={<CalendarView jobs={jobs} />} />
                    <Route path="/reminders" element={<RemindersView />} />
                    <Route path="/settings" element={<SettingsView appSettings={appSettings} onUpdateSetting={onUpdateSetting} handleBackup={handleBackup} handleRestore={handleRestore} />} />
                    <Route path="/customers" element={<CustomerListView customers={customers} onEdit={(c) => setModal({ type: 'customer', data: c })} setModal={setModal} />} />
                    <Route path="/customer/:id" element={<CustomerDetails customers={customers} jobs={jobs} setModal={setModal} />} />
                    <Route path="/job/:id" element={<JobDetailWrapper />} />
                    <Route path="/profile" element={<ProfileView profile={profile} onSave={onSaveProfile} />} />
                </Routes>
            </MainLayout>
        </Router>
    );
};

export default AppRouter;