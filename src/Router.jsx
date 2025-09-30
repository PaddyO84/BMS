import React from 'react';
import { HashRouter as Router, Routes, Route, useParams } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import DashboardView from './views/DashboardView';
import CustomerListView from './views/CustomerListView';
import JobListView from './views/JobListView';
import ProfileView from './views/ProfileView';
import JobDetailView from './components/JobDetailView';

const AppRouter = ({
    customers,
    jobs,
    profile,
    onSaveProfile,
    onSaveCustomer,
    onSaveJob,
    onRefresh,
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
            <Routes>
                <Route
                    path="/"
                    element={
                        <MainLayout
                            customers={customers}
                            onSaveCustomer={onSaveCustomer}
                            onSaveJob={onSaveJob}
                            onRefresh={onRefresh}
                            modal={modal}
                            setModal={setModal}
                        />
                    }
                >
                    <Route index element={<DashboardView jobs={jobs} />} />
                    <Route path="customers" element={<CustomerListView customers={customers} setModal={setModal} />} />
                    <Route path="jobs" element={<JobListView jobs={jobs} customers={customers} setModal={setModal} />} />
                    <Route path="jobs/:id" element={<JobDetailWrapper />} />
                    <Route path="profile" element={<ProfileView profile={profile} onSave={onSaveProfile} />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRouter;