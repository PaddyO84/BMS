import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const JobsView = ({ jobs, customers }) => {
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Jobs</h1>
                <Link to="/add-job" className="bg-blue-600 text-white p-2 rounded-full">
                    <Plus size={24} />
                </Link>
            </div>
            {jobs.length === 0 ? (
                <p>No jobs found.</p>
            ) : (
                <ul>
                    {jobs.map(job => {
                        const customer = customers.find(c => c.id === job.customerId);
                        return (
                            <li key={job.id} className="mb-4 p-4 border rounded-lg">
                                <Link to={`/job/${job.id}`}>
                                    <h2 className="text-xl font-semibold">{job.jobTitle}</h2>
                                    <p className="text-gray-600">{customer?.name}</p>
                                    <p className="text-sm text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</p>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default JobsView;