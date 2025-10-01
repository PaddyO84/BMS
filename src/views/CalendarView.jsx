import React, { useState, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, parseISO, isSameDay } from 'date-fns';
import { Link } from 'react-router-dom';

const CalendarView = ({ jobs }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const jobsByDate = useMemo(() => {
        return jobs.reduce((acc, job) => {
            if (job.dateRequested) {
                // The date from the DB is just a date string, so parseISO will handle it correctly
                const date = parseISO(job.dateRequested);
                const dateKey = format(date, 'yyyy-MM-dd');
                if (!acc[dateKey]) {
                    acc[dateKey] = [];
                }
                acc[dateKey].push(job);
            }
            return acc;
        }, {});
    }, [jobs]);

    const modifiers = {
        hasJob: Object.keys(jobsByDate).map(dateStr => parseISO(dateStr))
    };

    const modifiersStyles = {
        hasJob: {
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: '#3b82f6', // tailwind blue-500
        },
    };

    const selectedDayJobs = selectedDate ? jobs.filter(job => job.dateRequested && isSameDay(parseISO(job.dateRequested), selectedDate)) : [];

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Calendar</h1>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="bg-white p-4 rounded-lg shadow self-start">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        modifiers={modifiers}
                        modifiersStyles={modifiersStyles}
                        ISOWeek
                    />
                </div>
                <div className="flex-grow">
                    <h2 className="text-xl font-semibold mb-2">
                        Jobs for {selectedDate ? format(selectedDate, 'PPP') : '...'}
                    </h2>
                    {selectedDayJobs.length > 0 ? (
                        <ul className="bg-white p-4 rounded-lg shadow">
                            {selectedDayJobs.map(job => (
                                <li key={job.id} className="border-b last:border-b-0 py-2">
                                    <Link to={`/job/${job.id}`} className="text-indigo-600 hover:underline">
                                        {job.jobTitle}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 mt-4">No jobs scheduled for this day.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;