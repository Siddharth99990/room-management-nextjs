'use client';
import React, { useState } from "react";
import { Mail, Shield, User2, Trash2 } from "lucide-react";
import { type User, userService } from "../api/user.service";
import { useAuthStore } from "@/stores/authStore";

interface EmployeeCardProps {
  employee: User;
  onDelete?: (userid: number) => void;
  onUpdate?:(userid:number)=>void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onDelete,onUpdate }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {user}=useAuthStore();
  const isSelf=user?.userid===employee.userid;

  const handleDelete = async () => {
    if (!employee.userid) {
      console.error("No user ID available for deletion");
      return;
    }

    setIsDeleting(true);
    try {
      await userService.deleteUser(employee.userid);
      if (onDelete) {
        onDelete(employee.userid);
      }
      console.log(`User ${employee.name} deleted successfully`);
      
    } catch (error: any) {
      console.error("Failed to delete user:", error.message);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  const handleUpdateClick=()=>{
    if(onUpdate&&employee.userid){
      onUpdate(employee.userid);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-red-500 dark:border-red-900 transition-all duration-300 hover:shadow-xl flex flex-col justify-between h-60 mt-8 hover:scale-[1.02] hover:shadow-lg">
      <div>
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-white dark:text-gray-400 bg-red-500 dark:bg-gray-700 px-2 py-1 rounded transition-colors duration-300">
                ID:{employee.userid}
            </span>
          </div>
            
          <div className="flex items-center gap-2 mt-2">
            <User2 className="w-5 h-5 text-gray-800 dark:text-white " />
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              {employee.name.charAt(0).toUpperCase()+employee.name.slice(1)}
            </h3>
          </div>  
        </div>

        <div className="space-y-2 text-gray-900 dark:text-gray-400">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            <span className="text-sm">{employee.email}</span>
          </div>
        </div>
        <div className="space-y-2 text-gray-900 dark:text-gray-400 mt-3">
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            <span className="text-sm">{employee.role}</span>
          </div>
        </div>
      </div>

      {showConfirm ? (
        <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
            Delete {employee.name}?
          </p>
          <div className="flex gap-2">
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-all duration-300 text-sm disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Yes"}
            </button>
            <button 
              onClick={handleCancel}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all duration-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
          <button 
            onClick={handleUpdateClick}
            className="flex-1 bg-gradient-to-br from-red-600 to-pink-600 dark:from-red-700 dark:to-pink-700 text-white py-2 px-4 rounded-lg transition-all duration-300 hover:brightness-110 dark:hover:brightness-75">
            Edit Profile
          </button>
          {!isSelf &&(
            <button 
            onClick={handleDeleteClick}
            className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-all duration-300"
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeCard;