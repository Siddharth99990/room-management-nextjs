'use client';
import React from 'react';
import { User } from '@/api/user.service';
import { Mail, Shield, User2 } from 'lucide-react';

interface EmployeeRowCardProps {
  employee: User;
}

const EmployeeRowCard: React.FC<EmployeeRowCardProps> = ({ employee }) => {
  return (
    <div className="flex items-center space-x-4 p-2">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <User2 className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
          {employee.name}
        </p>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Mail className="w-4 h-4 mr-1.5" />
            <span>{employee.email}</span>
        </div>
      </div>
      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
        <Shield className="w-4 h-4 mr-1.5" />
        <span className="font-medium">{employee.role}</span>
      </div>
    </div>
  );
};

export default EmployeeRowCard;