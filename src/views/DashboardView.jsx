import React from 'react';
import { Euro, Briefcase } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    </div>
);

const DashboardView = ({ jobs }) => {
    const totalRevenue = jobs.reduce((sum, job) => sum + (job.total || 0), 0);
    const activeJobs = jobs.filter(j => j.status !== 'Completed').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<Euro className="text-green-500"/>} />
            <StatCard title="Active Jobs" value={activeJobs} icon={<Briefcase className="text-blue-500"/>} />
        </div>
    );
};

export default DashboardView;