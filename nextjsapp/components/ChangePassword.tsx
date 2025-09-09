'use client'
import React, { useEffect, useState } from "react";
import { Lock, Mail, X, EyeOff, Eye, Check } from 'lucide-react';
import { useAuth } from "../context/AuthContext";

interface ChangePasswordForm {
    email: string;
    oldPassword: string;
    newPassword: string;
}

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const { user, clearError, error: authError, changePassword,hasTemporaryPassword } = useAuth();
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [passwordForm, setPasswordForm] = useState<ChangePasswordForm>({
        email: user?.email || '',
        oldPassword: '',
        newPassword: ''
    });
    
    useEffect(() => {
        if (user?.email && isOpen) {
            setPasswordForm(prev => ({
                ...prev,
                email: user.email
            }));
        }
    }, [user, isOpen]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        if (error) setError('');
        clearError();
    };

    useEffect(()=>{
        if(!hasTemporaryPassword && success){
            const timer=setTimeout(()=>{
                handleClose()
            },1000);
            return ()=> clearTimeout(timer);
        }
    },[success,!hasTemporaryPassword])

    const validateForm = (): boolean => {
        if (!passwordForm.email.trim()) {
            setError('Email is required');
            return false;
        }

        if (!passwordForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError('Please enter a valid email address');
            return false;
        }

        if (!passwordForm.oldPassword.trim()) {
            setError('Current password is required');
            return false;
        }

        if (!passwordForm.newPassword.trim()) {
            setError('New password is required');
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

        setIsSubmitting(true);

        try {
            console.log('Change Password attempt:', { email: passwordForm.email });
            const result = await changePassword(
                passwordForm.email,
                passwordForm.oldPassword,
                passwordForm.newPassword
            );

            if (result.success) {
                console.log('Password changed successfully');
                setSuccess(true);
                setPasswordForm(prev => ({
                    ...prev,
                    oldPassword: '',
                    newPassword: ''
                }));
            } else {
                setError(result.message || 'Failed to change password');
            }
        } catch (err: any) {
            console.error("Password change failed", err);
            setError(err.message || "An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {

        if (!isSubmitting) {
            setError('');
            setSuccess(false);
            setPasswordForm(prev => ({
                email: user?.email || '',
                oldPassword: '',
                newPassword: ''
            }));
            clearError();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:bg-gradient dark:from-gray-800 dark:to-red-800 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 w-full max-w-md mx-auto">
                <div className="p-6 sm:p-8 border-b border-gray-200/50 dark:border-gray-700/50">
                    <button 
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="absolute right-4 top-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-5 h-5"/>
                    </button> 
                {hasTemporaryPassword?(
                    <div className="text-center">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-6 sm:w-8 h-6 sm:h-8 text-white"/>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Change Temporary Password
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            Update your password to access all features
                        </p>
                    </div>
                ):(
                    <div className="text-center">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-6 sm:w-8 h-6 sm:h-8 text-white"/>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Change Password
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            Update your account password
                        </p>
                    </div>
                )}    
                </div>

                {success && (
                        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-xl">
                            <div className="flex items-center">
                                <Check className="w-5 h-5 text-green-600 dark:text-green-300 mr-2" />
                                <p className="text-green-700 dark:text-green-300 font-medium text-sm">
                                    Password changed successfully!
                                </p>
                            </div>
                        </div>
                    )}

                    {(error || authError) && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-xl">
                            <p className="text-red-700 dark:text-red-300 text-sm">
                                {error || authError}
                            </p>
                        </div>
                    )}

                <div className="p-6 sm:p-8">

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={passwordForm.email}
                                onChange={handleInputChange}
                                className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type={showOldPassword ? 'text' : 'password'}
                                name="oldPassword"
                                placeholder="Current Password"
                                value={passwordForm.oldPassword}
                                onChange={handleInputChange}
                                autoComplete="current-password"
                                className="w-full pl-11 pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-300"
                            >
                                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type={showNewPassword ? 'text' : 'password'}
                                name="newPassword"
                                placeholder="New Password"
                                value={passwordForm.newPassword}
                                onChange={handleInputChange}
                                autoComplete="new-password"
                                className="w-full pl-11 pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-300"
                            >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-2.5 sm:py-3 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        Updating...
                                    </div>
                                ) : (
                                    'Update Password'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;