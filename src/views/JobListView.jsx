import React from 'react';
import { Briefcase } from 'lucide-react';

const JobStatusBadge = ({ status }) => {
    const statusClasses = {
        'New': 'bg-blue-100 text-blue-800',
        'Quoted': 'bg-yellow-100 text-yellow-800',
        'Approved': 'bg-green-100 text-green-800',
        'In Progress': 'bg-purple-100 text-purple-800',
        'Invoiced': 'bg-pink-100 text-pink-800',
        'Completed': 'bg-gray-100 text-gray-800',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

const JobListView = ({ jobs, customers, onSelectJob }) => {
    const customerMap = React.useMemo(() =>
        customers.reduce((acc, c) => {
            acc[c.id] = c.name;
            return acc;
        }, {}), [customers]);

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6">
                {jobs.length > 0 ? (
                    jobs.map(job => (
                        <div key={job.id} onClick={() => onSelectJob(job.id)} className="p-4 border-b last:border-b-0 hover:bg-indigo-50 cursor-pointer rounded-md transition-colors">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-900">{job.jobTitle}</p>
                                    <p className="text-sm text-gray-600">{customerMap[job.customerId] || '...'}</p>
                                </div>
                                <JobStatusBadge status={job.status}/>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Briefcase size={48} className="mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No jobs found.</h3>
                        <p>Create a new job to begin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobListView;
