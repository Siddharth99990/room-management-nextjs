'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import EmployeeCard from '../../components/EmployeeCard';
import { userService, type User } from '../../api/user.service';
import { Cog, Plus, User2 } from 'lucide-react';
import UpdateUserModal from '../../components/UpdateEmployee';
import Link from 'next/link';
import ProtectedRoute from '@/context/ProtectedRoute';

const EmployeesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  // Fetch employees using useQuery
  const { data: employees, isLoading, isError, error } = useQuery({
    queryKey: ['employees'],
    queryFn: userService.getUsers,
  });

  // Handle user deletion with useMutation
  const deleteMutation = useMutation({
    mutationFn: (userId: number) => userService.deleteUser(userId),
    onSuccess: () => {
      // THE FIX: Invalidate the query to refetch the list automatically
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err) => {
      console.error("Failed to delete user:", err);
      // You can set an error state here to show in the UI if needed
    },
  });

  const handleUserUpdate = (userid: number) => {
    setEditUserId(userid);
    setIsUpdateOpen(true);
  };

  const handleUpdateSuccess = () => {
    // THE FIX: Also invalidate the query after a successful update
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    handleCloseUpdate();
  };

  const handleCloseUpdate = () => {
    setIsUpdateOpen(false);
    setEditUserId(null);
  };

  const handleUserDelete = (deletedUserId: number) => {
    deleteMutation.mutate(deletedUserId);
  };
  
  const features = [
    {
      icon: <User2 className='w-6 h-6' />,
      title: 'Browse Users',
      description: 'Freely browse through users available on the platform',
    },
    {
      icon: <Cog className='w-6 h-6' />,
      title: 'Manage Users',
      description: 'Maintain user records, delete, update or change users as needed',
    },
  ];


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
        <div className='grid lg:grid-cols-3 gap-8 lg:gap-14'>
          <div className='space-y-6 sm:space-y-8'>
            <div className='space-y-4 sm:space-y-6 mt-20'>
              <Link 
                  href='/registeremployee'
                  className='inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                  >
                  <Plus className='w-5 h-5 mr-2'/>
                  Register a new Employee
              </Link> 
              <h1 className='text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white '>
                Browse through
                <span className='block bg-gradient-to-r from-red-600 to-gray-600 bg-clip-text text-transparent'>
                  &
                </span>
                <span className='block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent'>
                  Edit Employee
                </span>
              </h1>
              <p className='text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed'>
                Browse through employees on the platform and make changes
              </p>

              <div className='space-y-4 sm:space-y-6'>
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className='flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]'
                  >
                    <div className='flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white'>
                      {feature.icon}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h3 className='font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base'>
                        {feature.title}
                      </h3>
                      <p className='text-gray-600 dark:text-gray-300 text-sm'>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className='lg:col-span-2'>
            <div className='grid grid:cols-1 md:grid-cols-2 gap-6'>
              {employees?.map((employee) => (
                <EmployeeCard 
                  key={employee.userid} 
                  employee={employee} 
                  onDelete={handleUserDelete}
                  onUpdate={handleUserUpdate}
                />
              ))}
            </div>
          </div>
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