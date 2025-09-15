'use client';
import React, { useState } from "react";
import { Building2, Calendar, Clock, HelpCircle, ShieldCheck, User, Users,Lock, Check, Mail } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";
import ProtectedRoute from "@/context/ProtectedRoute";


const DeleteOwnAccountPage = () => {
    const [isSubmitting,setIsSubmitting]=useState(false);
    const [error,setError]=useState('');
    const {user}=useAuthStore();
    const [formData,setFormData]=useState({
        email:'',
        password:''
    });

    const {deleteOwnAccount,isAuthenticated,isLoading,clearError,error:authError}=useAuthStore();

    const handleInputChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        setFormData(prev=>({
            ...prev,
            [e.target.name]:e.target.value
        }));
        if(error){
            setError('');
            clearError();
        };
    };

    const handleSubmit=async(e:React.FormEvent)=>{
        e.preventDefault();
        setError('');

        setIsSubmitting(true);

        try{
            console.log("Delete account attempt:",{email:formData.email});
            const success=await deleteOwnAccount(formData.email,formData.password);

            if(success){
                console.log("Deleted account successfully");
                toast.success("Deleted account successfully");
            }else{
                setError("Invalid email or password");
                toast.error("Couldnt delete account");
            }
        }catch(err:any){
            console.error("Delete account error:",err);
            setError("Something went wrong please try again in sometime");
        }finally{
            setIsSubmitting(false);
        }
    };

    if(isLoading){
        return (
             <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        )
    }

    return (
    <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900 transition-all duration-500">
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-6rem)]">
                    <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
                        <div className="space-y-4 sm:space-y-6">

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                                Delete your 
                                <span className="block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                    Account
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                                Enter your email and password to confirm deletion.
                            </p>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2">
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 w-full max-w-md mx-auto">
                            <div className="text-center mb-6 sm:mb-8">
                                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <User className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Delete Account
                                </h2>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                    Enter your email and password to delete your account
                                </p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
                                    <input 
                                        type="email"
                                        name="email"
                                        placeholder="Email address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        autoComplete={user?.email}
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300"
                                    />
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        autoComplete="new-password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-2.5 sm:py-3 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                    {isSubmitting?(
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Deleting Account...
                                        </div>
                                    ):(
                                        'Delete Account'
                                    )}
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

export default DeleteOwnAccountPage;