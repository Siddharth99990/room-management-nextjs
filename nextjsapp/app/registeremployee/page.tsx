'use client';
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lock, Mail, Shield, User2, UserCheck, UserCog2 } from "lucide-react";
import ProtectedRoute from "@/context/ProtectedRoute";
import { useEmployeeStore } from "@/stores/employeeStore";
import { type User } from "@/api/user.service";
import toast from "react-hot-toast";

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'employee' | '';
}

const RegisterEmployeePage = () => {
    const queryClient = useQueryClient();
    const { addEmployee } = useEmployeeStore();
    const [formData, setFormData] = useState<RegisterForm>({
        name: '',
        email: '',
        password: '',
        role: ''
    });

    const registerMutation = useMutation({
        mutationFn: (userData: Omit<User, 'userid'>) => addEmployee(userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['userCount'] });
            setFormData({ name: '', email: '', password: '', role: '' });
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const validateAndSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Simple validation checks
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.role) {
            toast.error("All fields are required.");
            return;
        }
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        const userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role as 'admin' | 'employee'
        };

        registerMutation.mutate(userData);
    };

    const features = [
        { icon: <User2 className="w-6 h-6" />, title: 'Register User', description: 'Register new users onto the platform' },
        { icon: <Shield className="w-6 h-6" />, title: 'Role Based Access', description: 'Control what the user can access based on roles' }
    ];

    return (
        <ProtectedRoute requiredRole="admin">
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900">
                <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-6rem)]">
                        <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
                            <div className="space-y-4 sm:space-y-6">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                                    Register a <span className="block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">New User</span>
                                </h1>
                                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
                                    Add new team members to the platform and manage access permissions.
                                </p>
                            </div>
                            <div className="space-y-4 sm:space-y-6">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-start space-x-4 p-4 rounded-xl dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-700/50 hover:shadow-lg hover:scale-[1.02] transition-all">
                                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md mx-auto">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <UserCheck className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Register User</h2>
                                    <p className="text-gray-600 dark:text-gray-400">Fill in the details below</p>
                                </div>

                                <form onSubmit={validateAndSubmit} className="space-y-6">
                                    <div className="relative">
                                        <User2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} disabled={registerMutation.isPending} className="w-full pl-11 pr-4 py-3 border rounded-xl" required />
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} disabled={registerMutation.isPending} className="w-full pl-11 pr-4 py-3 border rounded-xl" required />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} disabled={registerMutation.isPending} className="w-full pl-11 pr-4 py-3 border rounded-xl" autoComplete="new-password" required />
                                    </div>
                                    <div className="relative">
                                        <UserCog2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <select name="role" value={formData.role} onChange={handleInputChange} disabled={registerMutation.isPending} className="w-full pl-11 pr-4 py-3 border rounded-xl appearance-none" required>
                                            <option value="">Select Role</option>
                                            <option value="employee">Employee</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <button type="submit" disabled={registerMutation.isPending} className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-xl font-semibold">
                                        {registerMutation.isPending ? 'Registering...' : 'Register User'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default RegisterEmployeePage;