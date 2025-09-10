'use client';
import React, { useState } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from '../../api/user.service';
import { Cog, Plus, User2 } from 'lucide-react';
import UpdateUserModal from '../../components/UpdateEmployee';
import Link from 'next/link';
import ProtectedRoute from '@/context/ProtectedRoute';
import { getEmployeeColumns } from '@/components/columns/EmployeeColumns';
import { DataTable } from '@/components/DataTable';

const EmployeesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  const { data: employees = [], isLoading, isError, error } = useQuery({
    queryKey: ['employees'],
    queryFn: userService.getUsers,
  });

  const handleUserUpdate = (userid: number) => {
    setEditUserId(userid);
    setIsUpdateOpen(true);
  };

  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    handleCloseUpdate();
  };

  const handleCloseUpdate = () => {
    setIsUpdateOpen(false);
    setEditUserId(null);
  };

  const employeeColumns = getEmployeeColumns(handleUserUpdate);

  if (isLoading) {
    return (
      <div className='min-h-screen flex justify-center items-center'>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='min-h-screen flex justify-center items-center'>
        <p className='text-red-500'>{error.message}</p>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole='admin'>
      <>
        <div className='min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-800 dark:to-red-900 transition-all duration-500'>
          <div className='container mx-auto px-4 sm:px-6 py-8 sm:py-12'>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-br from-red-600 to-pink-600 text-transparent bg-clip-text dark:bg-gradient dark:from-red-500 dark:to-red-500">Manage Employees</h1>
                    <Link
                        href='/registeremployee'
                        className='inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                        >
                        <Plus className='w-5 h-5 mr-2'/>
                        Register Employee
                    </Link>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                    Browse, search, and manage all employees on the platform.
                </p>
                <DataTable 
                    columns={employeeColumns} 
                    data={employees} 
                    filterColumnId="name"
                    filterPlaceholder="Filter by name..."
                />
            </div>
          </div>
        </div>
        {isUpdateOpen && editUserId && (
            <UpdateUserModal
                isOpen={isUpdateOpen}
                onClose={handleCloseUpdate}
                userid={editUserId}
                onUpdateSuccess={handleUpdateSuccess}
            />
        )}
      </>
    </ProtectedRoute>  
  );
};

export default EmployeesPage;