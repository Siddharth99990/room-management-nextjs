'use client';
import React from "react";
import { Building2, Calendar, Clock, HelpCircle, ShieldCheck, User, Users,Lock, Check } from "lucide-react";
import { ForgotPasswordForm } from '../../components/ForgetPasswordForm';

const features = [
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Quick Reset",
    description: "Get back into your workspace in under a minute"
  },
  {
    icon: <Check className="w-6 h-6" />,
    title: "Simplicity",
    description: "Reset your password with ease."
  }
];


const ForgetPasswordPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900 transition-all duration-500">
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-6rem)]">
                    <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
                        <div className="space-y-4 sm:space-y-6">

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                                Forgot Your
                                <span className="block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                    Password?
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                                Enter your email and you can reset it in a minute.
                            </p>
                        </div>

                        <div className="space-y-4 sm:space-y-6">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                                    <div className="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                                        {feature.icon}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="order-1 lg:order-2">
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 w-full max-w-md mx-auto">
                            <div className="text-center mb-6 sm:mb-8">
                                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <User className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Reset Password
                                </h2>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                    Enter your email to receive a reset code.
                                </p>
                            </div>

                            <ForgotPasswordForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgetPasswordPage;