import React from 'react';
import { Plus } from 'lucide-react';

const FloatingActionButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="fixed bottom-20 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-110"
        aria-label="Add new item"
    >
        <Plus size={24} />
    </button>
);

export default FloatingActionButton;