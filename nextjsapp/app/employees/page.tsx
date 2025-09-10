'use client';
import React, { useState } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from '../../api/user.service';
import { Plus, Users, Shield, UserCheck, Calendar, User } from 'lucide-react';
import UpdateUserModal from '../../components/UpdateEmployee';
import Link from 'next/link';
import ProtectedRoute from '@/context/ProtectedRoute';
import { getEmployeeColumns } from '@/components/columns/EmployeeColumns';
import { DataTable } from '@/components/DataTable';
import { useAuth } from '@/context/AuthContext';

const EmployeesPage: React.FC = () => {
  const {user}=useAuth();
  const queryClient = useQueryClient();
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  const { data: employees = [], isLoading, isError, error, refetch } = useQuery({
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

  // Stats calculations
  const stats = React.useMemo(() => {
    const roleCount = employees.reduce((acc, emp) => {
      acc[emp.role] = (acc[emp.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    const newThisMonth = employees.filter(emp => 
      emp.createdAt && new Date(emp.createdAt) >= thisMonth
    ).length;

    return {
      total: employees.length,
      admins: roleCount.admin || 0,
      employees: roleCount.employee || 0,
      managers: roleCount.manager || 0,
      newThisMonth
    };
  }, [employees]);

  const employeeColumns = getEmployeeColumns(handleUserUpdate, user ? user.userid : null);

  if (isError) {
    return (
      <div className='min-h-screen flex justify-center items-center bg-gradient-to-br from-red-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-800 dark:to-red-900'>
        <p className='text-red-500'>{error.message}</p>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole='admin'>
      <>
        <div className='min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-800 dark:to-red-900 transition-all duration-500'>
          <div className='container mx-auto px-4 sm:px-6 py-8 sm:py-12'>
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Browse through
                    <br/>
                    <span className='bg-gradient-to-br from-red-600 to-pink-600 bg-clip-text text-transparent'>&</span>
                    <br/>
                    <span className='bg-gradient-to-br from-red-600 to-pink-600 bg-clip-text text-transparent'>Manage Employees</span>
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage all employees, roles, and permissions across the platform
                  </p>
                </div>
                <Link
                  href='/registeremployee'
                  className='inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                >
                  <Plus className='w-5 h-5 mr-2'/>
                  Add Employee
                </Link>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Staff</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admins</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.admins}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <User className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Employees</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.employees}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:text-white p-4">
              <DataTable 
                columns={employeeColumns} 
                data={employees}
                filterColumnId="name"
                filterPlaceholder="Search employees..."
                isLoading={isLoading}
                enableRowSelection={true}
                enableColumnVisibility={false}
                enableGlobalSearch={true}
                pageSize={10}
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