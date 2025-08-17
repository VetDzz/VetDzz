import React from 'react';
import AdminPanel from '@/components/AdminPanel';
import AdminAuthGuard from '@/components/AdminAuthGuard';

const AdminPage: React.FC = () => {
  return (
    <AdminAuthGuard>
      <AdminPanel />
    </AdminAuthGuard>
  );
};

export default AdminPage;
