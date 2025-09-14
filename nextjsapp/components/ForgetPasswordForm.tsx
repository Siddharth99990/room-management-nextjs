'use client';
import React, { useState } from "react";
import { Mail, KeyRound, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import toast from "react-hot-toast";

type FormStep = 'email' | 'otp';

export const ForgotPasswordForm = () => {
    const router = useRouter();
    const [step, setStep] = useState<FormStep>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { forgetPassword, resetPassword } = useAuthStore();

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }
        setIsSubmitting(true);
        const result = await forgetPassword(email);
        setIsSubmitting(false);

        if (result.success) {
            toast.success(result.message || "If an account with that email exists, an OTP has been sent.");
            setStep('otp');
        } else {
            toast.error(result.message || "Failed to send OTP. Please try again.");
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        setIsSubmitting(true);
        const result = await resetPassword(email, otp, newPassword);
        setIsSubmitting(false);

        if (result.success) {
            toast.success(result.message || "Password has been reset successfully!");
            router.push('/login');
        } else {
            toast.error(result.message || "Failed to reset password. Please check your OTP and try again.");
        }
    };

    return (
        <div>
            {step === 'email' ? (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                    <div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:opacity-50 transition-transform duration-300 ease-in-out hover:scale-[1.02]"
                    >
                        {isSubmitting ? "Sending..." : "Send Reset Code"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetSubmit} className="space-y-6">
                    <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                        An OTP has been sent to <strong>{email}</strong>.
                    </p>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            name="otp"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="newPassword"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-transform duration-300 ease-in-out hover:scale-[1.02]"
                    >
                        {isSubmitting ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            )}
             <div className="text-center mt-6">
                <Link href="/login" className="text-sm text-red-600 dark:text-red-400 hover:underline">
                    Back to Sign In
                </Link>
            </div>
        </div>
    );
};