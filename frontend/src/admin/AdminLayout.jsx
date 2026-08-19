import React from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';

const AdminLayout = ({ children, searchTerm, setSearchTerm, searchPlaceholder }) => {
  return (
    <div className="bg-[#eef2f6] text-on-surface font-body-md min-h-screen antialiased flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder={searchPlaceholder}
        />
        <main className="ml-[260px] pt-[56px] p-6 min-h-screen overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
