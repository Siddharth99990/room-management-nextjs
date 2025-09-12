'use client';
import React, { useEffect, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { X, Edit, User2, Shield, Mail } from 'lucide-react';
import { type User, type UpdateUserData } from "../api/user.service";
import toast from "react-hot-toast";
import { useEmployeeStore } from "@/stores/employeeStore";

interface UpdateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    userid: number;
    onUpdateSuccess?: () => void;
}

const UpdateEmployeeModal: React.FC<UpdateUserModalProps> = ({ isOpen, onClose, userid, onUpdateSuccess }) => {
    const queryClient = useQueryClient();
    const { updateEmployee } = useEmployeeStore();
    const [showConfirm, setShowConfirm] = useState(false);
    const [updateForm, setUpdateForm] = useState<{ name: string; email: string; role: 'admin' | 'employee' }>({
        name: '',
        email: '',
        role: 'employee'
    });

    const [originalUser, setOriginalUser] = useState<User | null>(null);

    useEffect(() => {
        if (isOpen) {
            const employees: User[] | undefined = queryClient.getQueryData(['employees']);
            const userToEdit = employees?.find(u => u.userid === userid);
            if (userToEdit) {
                setOriginalUser(userToEdit);
                setUpdateForm({
                    name: userToEdit.name,
                    email: userToEdit.email,
                    role: userToEdit.role
                });
            }
        }
    }, [isOpen, userid, queryClient]);

    const updateMutation = useMutation({
        mutationFn: (data: UpdateUserData) => updateEmployee(userid, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            onUpdateSuccess?.();
            onClose();
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setUpdateForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (JSON.stringify(updateForm) === JSON.stringify({ name: originalUser?.name, email: originalUser?.email, role: originalUser?.role })) {
            toast.error('No changes detected.');
            return;
        }
        setShowConfirm(true);
    };

    const handleConfirmUpdate = () => {
        updateMutation.mutate(updateForm);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-red-800 rounded-3xl shadow-2xl w-full max-w-md mx-auto">
                <div className="p-6 sm:p-8 border-b border-gray-200/50 dark:border-gray-700/50 relative">
                    <button onClick={onClose} disabled={updateMutation.isPending} className="absolute right-4 top-4 p-2 rounded-lg text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Edit className="w-6 h-6 text-white" /></div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Update Employee</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Modify Employee information</p>
                    </div>
                </div>
                <div className="p-6 sm:p-8">
                    {!originalUser ? <div className="text-center py-8">Loading user data...</div> : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative">
                                <User2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" name="name" value={updateForm.name} onChange={handleInputChange} disabled={updateMutation.isPending} className="w-full pl-11 pr-4 py-3 border rounded-xl" required />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="email" name="email" value={updateForm.email} onChange={handleInputChange} disabled={updateMutation.isPending} className="w-full pl-11 pr-4 py-3 border rounded-xl" required />
                            </div>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select name="role" value={updateForm.role} onChange={handleInputChange} disabled={updateMutation.isPending} className="w-full pl-11 pr-4 py-3 border rounded-xl appearance-none" required>
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            {showConfirm ? (
                                <div className="space-y-2 pt-4">
                                    <p className="text-sm text-center">Are you sure you want to update this employee?</p>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={handleConfirmUpdate} disabled={updateMutation.isPending} className="flex-1 bg-red-600 text-white py-2 rounded-lg">{updateMutation.isPending ? "Updating..." : "Confirm Update"}</button>
                                        <button type="button" onClick={() => setShowConfirm(false)} disabled={updateMutation.isPending} className="flex-1 bg-gray-500 text-white py-2 rounded-lg">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="pt-4">
                                    <button type="submit" disabled={updateMutation.isPending} className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-xl font-semibold">Update Employee</button>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdateEmployeeModal;