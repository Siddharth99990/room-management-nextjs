"use client"; 

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
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

    if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
        return null; 
    }

    return <>{children}</>;
};

export default ProtectedRoute;
