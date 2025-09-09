'use client';
import React, { useState,useEffect} from "react";
import { userService,type User } from "../../api/user.service";
import { Lock, Mail, Shield, User2, UserCheck, UserCog2 } from "lucide-react";
import ProtectedRoute from "@/context/ProtectedRoute";

interface RegisterForm{
    name:string;
    email:string;
    password:string;
    role:'admin'|'employee'|'';
}
const RegisterEmployeePage = () => {
    const [formData, setFormData] = useState<RegisterForm>({
        name: '',
        email: '',
        password: '',
        role: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        if(error)setError('');
    };

    useEffect(()=>{
        let timer:NodeJS.Timeout;
        if(success){
            timer=setTimeout(()=>{
                setSuccess(false);
            },3000);
        }
    })

    const validateForm = (): boolean => {
        if (!formData.email.trim()) {
            setError("Email is required");
            return false;
        }

        if (!formData.password.trim()) {
            setError("Password is required");
            return false;
        }

        if (!formData.name.trim()) {
            setError("Name is required");
            return false;
        }

        if (formData.password.length < 6) {
            setError("Password needs to be at least 6 characters long");
            return false;
        }

       if(!/[A-Z]/.test(formData.password)){
            setError("Password must contain atleast one uppercase character");
            return false;
       }

       if(!/[a-z]/.test(formData.password)){
            setError("Password must contain atleast one lowercase character");
            return false;
       }

       if(!/\d/.test(formData.password)){
            setError("Password must contain atleast one digit");
            return false;
       }

       if(!/[^A-Za-z0-9]/.test(formData.password)){
            setError("Password must contain atleast one special character");
            return false;
       }

        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError('Email must follow the format email@domain.com');
            return false;
        }

        if (!formData.name.match(/^[a-zA-Z\s\-]{2,}/)) {
            setError('Name must only contain characters and should be at least 2 characters long');
            return false;
        }

        if (!formData.role) {
            setError("Please select a role for the user");
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
            console.log("Registering user");

            const userData={
                name:formData.name,
                email:formData.email,
                password:formData.password,
                role:formData.role as 'admin'|'employee'
            };

            await userService.registeruser(userData as User);

            setSuccess(true);
            setFormData({name:'',email:'',password:'',role:''});

        } catch (err: any) {
            console.error("Registration failed",err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const features=[
        {   icon:<User2 className="w-6 h-6"/>,
            title:'Register User',
            description:'Register new users onto the platform'
        },
        {
            icon:<Shield className="w-6 h-6"/>,
            title:'Role Based Access',
            description:'Control what the user can access based on roles'
        }
    ]

    return (
        <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900 transition-all duration-500">
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-6rem)]">
                    
                    <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
                        <div className="space-y-4 sm:space-y-6">

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                                Register a
                                <span className="block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                    New User
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                                Add new team members to the platform and manage access permissions
                            </p>

                            <div className="space-y-4 sm:space-y-6">
                            {features.map((feature,index)=>(
                                <div key={index}className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl dark:gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-700/50 dark:hover:bf-gray-800/80 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                                    <div className="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                                        {feature.icon}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">{feature.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2">
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 w-full max-w-md mx-auto">
                            <div className="text-center mb-6 sm:mb-8">
                                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <UserCheck className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Register User
                                </h2>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                    Fill in the details below
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

                                 {error && (
                                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
                                        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                                    </div>
                                )}

                                {success && (
                                    <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg">
                                        <p className="text-green-700 dark:text-green-300 text-sm">User registered successfully!</p>
                                    </div>
                                )}

                                <div className="relative">
                                    <User2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300"
                                        
                                    />
                                </div>

                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300"
                                        
                                    />
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300"
                                        autoComplete="new-password"
                                        
                                    />
                                </div>

                                <div className="relative">
                                    <UserCog2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300 appearance-none"
                                        
                                    >
                                        <option value="">Select Role</option>
                                        <option value="employee">Employee</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-2.5 sm:py-3 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Registering...
                                        </div>
                                    ) : (
                                        'Register User'
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

export default RegisterEmployeePage;