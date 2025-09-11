'use client';
import React, { useEffect, useState } from "react";
import { X, Check, User2, Shield, Mail, Edit } from 'lucide-react';
import { userService, type User } from "../api/user.service";
import toast from "react-hot-toast";

interface UpdateUserForm {
    name: string;
    email: string;
    role: 'admin' | 'employee';
}

interface UpdateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    userid: number;
    onUpdateSuccess?: (updatedUser: User) => void;
}

const UpdateEmployeeModal: React.FC<UpdateUserModalProps> = ({ 
    isOpen, 
    onClose, 
    userid, 
    onUpdateSuccess 
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [originalUser, setOriginalUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [updateForm, setUpdateForm] = useState<UpdateUserForm>({
        name: '',
        email: '',
        role: 'employee'
    });

    useEffect(() => {
        const fetchUser = async () => {
            if (!isOpen || !userid) return;
            
            setLoading(true);
            try {
                const users = await userService.getUsers();
                const user = users.find(u => u.userid === userid);
                
                if (user) {
                    setOriginalUser(user);
                    setUpdateForm({
                        name: user.name,
                        email: user.email,
                        role: user.role
                    });
                } else {
                    setError('User not found');
                }
            } catch (err: any) {
                setError('Failed to fetch user data: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [isOpen, userid]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setUpdateForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        if (error) setError('');
        if (success) setSuccess(false);
    };

    const validateForm = (): boolean => {
        if (!updateForm.name.trim()) {
            setError('Name is required');
            return false;
        }

        if (!updateForm.email.trim()) {
            setError('Email is required');
            return false;
        }

        if (!updateForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError('Please enter a valid email address');
            return false;
        }

        if (!updateForm.name.match(/^[a-zA-Z\s\-]{2,}$/)) {
            setError('Name must only contain letters and be at least 2 characters long');
            return false;
        }

        if (!updateForm.role) {
            setError('Please select a role');
            return false;
        }
        
        if (originalUser && 
            updateForm.name === originalUser.name &&
            updateForm.email === originalUser.email &&
            updateForm.role === originalUser.role) {
            setError('No changes detected. Please modify at least one field.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(false);
        setError('');

        if (!validateForm()) {
            return;
        }

        setShowConfirm(true);
    };

    const handleConfirmUpdate = async () => {
        setIsSubmitting(true);
        setShowConfirm(false);

        try {
            console.log('Updating user with ID:', userid, 'Data:', updateForm);
            const result = await userService.updateUser(userid, updateForm);

            if (result.success) {
                toast.success("Employee updated successfully")
                console.log('Employee updated successfully');
                setSuccess(true);
                
                const updatedUser: User = {
                    ...originalUser!,
                    ...updateForm,
                    userid: userid
                };

                if (onUpdateSuccess) {
                    onUpdateSuccess(updatedUser);
                }
                setOriginalUser(updatedUser);
            } else {
                setError(result.message || 'Failed to update employee');
            }
        } catch (err: any) {
            console.error("Update failed", err);
            setError(err.message || "An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setError('');
            setSuccess(false);
            setShowConfirm(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-800 dark:to-red-800 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 w-full max-w-md mx-auto">
                <div className="p-6 sm:p-8 border-b border-gray-200/50 dark:border-gray-700/50 relative">
                    <button 
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="absolute right-4 top-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                    
                    <div className="text-center">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Edit className="w-6 sm:w-8 h-6 sm:h-8 text-white"/>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Update Employees
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            Modify Employee information
                        </p>
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-xl">
                                    <p className="text-red-700 dark:text-red-300 text-sm">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                <div className="relative">
                                    <User2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        value={updateForm.name}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>
                                
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={updateForm.email}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        name="role"
                                        value={updateForm.role}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                    >
                                        <option value="employee">Employee</option>
                                        <option value="admin">Admin</option>
                                    </select>  
                                </div>

                                {showConfirm ? (
                                    <div className="flex flex-col gap-4 pt-4">
                                        <p className="text-sm text-center mb-2">
                                            Are you sure you want to update this Employee?
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleConfirmUpdate}
                                                disabled={isSubmitting}
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? "Updating..." : "Confirm Update"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(false)}
                                                disabled={isSubmitting}
                                                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all duration-300 text-sm disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 pt-4">
                                        <button 
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-2.5 sm:py-3 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            Update Employee
                                        </button>
                                    </div>
                                )}
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdateEmployeeModal;