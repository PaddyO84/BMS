import React from 'react';
import { JobStatusBadge } from '../components/ui';

const JobListView = ({ jobs, customers, onSelectJob }) => (
    <div className="bg-white rounded-lg shadow p-6">
        {jobs.length > 0 ? (
            jobs.map(job => (
                <div key={job.id} onClick={() => onSelectJob(job.id)} className="p-4 border-b last:border-b-0 hover:bg-indigo-50 cursor-pointer rounded-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-gray-900">{job.jobTitle}</p>
                            <p className="text-sm text-gray-600">{customers.find(c => c.id === job.customerId)?.name || '...'}</p>
                        </div>
                        <JobStatusBadge status={job.status} />
                    </div>
                </div>
            ))
        ) : (
            <p className="text-gray-500">No jobs found.</p>
        )}
    </div>
);

export default JobListView;