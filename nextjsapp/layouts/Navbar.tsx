'use client'
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { useRouter, usePathname } from "next/navigation";
import { Home, Users, Building2, Sun, Moon, Menu, X, LogOut, Check, Settings, SearchCheck, Edit } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ChangePasswordModal from "../components/ChangePassword";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { usePasswordModalStore } from "@/stores/modalStore";

interface NavBarProps {
    children: React.ReactNode;
}

const NavBarLayout: React.FC<NavBarProps> = ({ children }) => {
    const { isChangePasswordOpen, openChangePassword, closeChangePassword } = usePasswordModalStore();
    const pathname = usePathname();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const { user, logout, isAuthenticated } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const hideNavbarPaths = ['/login','/forgetpassword'];
    const shouldHideNavbar = hideNavbarPaths.includes(pathname);

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        return pathname.startsWith(path) && path !== '/';
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        router.replace('/login');
        closeMobileMenu();
    };

    const handleChangePasswordClick = () => {
        openChangePassword();
    };

    const navLinks = isAuthenticated ? [
        { path: '/home', label: 'Home', icon: Home },
        { path: '/rooms', label: 'Rooms', icon: Building2 },
        { path: '/bookroom', label: 'Book', icon: Check },
        { path: '/bookings', label: 'Bookings', icon: SearchCheck },
        ...(user?.role === 'admin' ? [
            { path: '/employees', label: 'Employees', icon: Users },] : [])
    ] : [];

    const userMenu = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center w-9 h-9 bg-red-500 dark:bg-red-900 rounded-full text-white font-semibold text-lg hover:scale-[1.04] transition-transform duration-200">
                    {user?.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="bg-white dark:bg-gray-800 dark:border-2 dark:border-red-700 border-2 border-red-300 rounded-md backdrop-blur-lg shadow-lg w-56 p-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
                <DropdownMenuItem
                    onSelect={handleChangePasswordClick}
                    className="flex items-center w-full text-left space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer focus:bg-red-50 dark:focus:bg-gray-700 focus:text-red-600 dark:focus:text-red-400 outline-none"
                >
                    <Edit className="w-4 h-4" />
                    <span>Change Password</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={handleLogout}
                    className="flex items-center w-full text-left space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer focus:bg-red-50 dark:focus:bg-gray-700 focus:text-red-600 dark:focus:text-red-400 outline-none"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {!shouldHideNavbar && (
                <nav className="sticky top-0 bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 relative z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <Link href={isAuthenticated ? '/home' : '/login'} className="flex items-center space-x-2" onClick={closeMobileMenu}>
                                    <Building2 className="h-6 sm:h-8 w-6 sm:w-8 text-red-600 dark:text-red-400" />
                                    <span className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300 hidden sm:block">
                                        Rooms & Bookings
                                    </span>
                                    <span className="text-lg font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300 sm:hidden">
                                        R&B
                                    </span>
                                </Link>
                            </div>

                            <div className="hidden md:flex items-center space-x-6">
                                {navLinks.map(({ path, label, icon: Icon }) => (
                                    <Link key={path} href={path}
                                        className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive(path)
                                                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                                : 'text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700'
                                            }`}>
                                        <Icon className="h-4 w-4" />
                                        <span>{label}</span>
                                    </Link>
                                ))}

                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-110"
                                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                                >
                                    {theme === 'light' ? (
                                        <Moon className="h-5 w-5" />
                                    ) : (
                                        <Sun className="h-5 w-5" />
                                    )}
                                </button>

                                {isAuthenticated && user && (
                                    <div className="flex items-center space-x-4 border-l border-gray-200 dark:border-gray-700 pl-4">
                                        {userMenu}
                                    </div>
                                )}
                            </div>

                            <div className="md:hidden flex items-center space-x-2">
                                {isAuthenticated && user && userMenu}
                                
                                {isAuthenticated && (
                                    <button
                                        type="button"
                                        onClick={toggleMobileMenu}
                                        className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                                        aria-label="Toggle mobile menu"
                                    >
                                        {isMobileMenuOpen ? (
                                            <X className="h-6 w-6" />
                                        ) : (
                                            <Menu className="h-6 w-6" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {isAuthenticated && (
                        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen
                                ? 'max-h-96 opacity-100 visible'
                                : 'max-h-0 opacity-0 invisible overflow-hidden'
                            }`}>
                            <div className="px-4 pt-2 pb-4 space-y-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                {navLinks.map(({ path, label, icon: Icon }) => (
                                    <Link key={path} href={path}
                                        onClick={closeMobileMenu}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${isActive(path)
                                                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                                : 'text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700'
                                            }`}>
                                        <Icon className="h-5 w-5" />
                                        <span>{label}</span>
                                    </Link>
                                ))}
                                 <button
                                    type="button"
                                    onClick={() => {
                                        toggleTheme();
                                        closeMobileMenu();
                                    }}
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 w-full text-left"
                                >
                                    {theme === 'light' ? (
                                        <Moon className="h-5 w-5" />
                                    ) : (
                                        <Sun className="h-5 w-5" />
                                    )}
                                    <span>Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
                                </button>
                            </div>
                        </div>
                    )}
                </nav>
            )}

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => closeChangePassword()}
            />

            <main className="transition-colors duration-300">
                {children}
            </main>
        </div>
    );
};

export default NavBarLayout;

