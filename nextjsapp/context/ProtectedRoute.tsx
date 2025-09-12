"use client"; 

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {Lock} from 'lucide-react';
import { usePasswordModalStore } from "@/stores/modalStore";


// The interface remains clean, without any extra props
interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { isChangePasswordOpen, openChangePassword, closeChangePassword } = usePasswordModalStore();
    const { isAuthenticated, isLoading, user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.replace(`/?from=${encodeURIComponent(pathname)}`);
            } else if (requiredRole && user?.role !== requiredRole) {
                router.replace(`/home?from=${encodeURIComponent(pathname)}`);
            }
        }
    }, [isAuthenticated, isLoading, requiredRole, user, router, pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (user?.isTemporaryPassword) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-4">
                        Action Required
                    </h1>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        Please change your temporary password to access this page.
                    </p>
                    <Button 
                        onClick={openChangePassword}
                        className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Lock className="w-4 h-4 mr-2" />
                        Change Password
                    </Button>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
        return null; 
    }

    return <>{children}</>;
};

export default ProtectedRoute;