import React from 'react';
import DatabaseCheck from '@/components/DatabaseCheck';

const DatabaseStatus: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Database Status</h1>
        <DatabaseCheck />
      </div>
    </div>
  );
};

export default DatabaseStatus;
