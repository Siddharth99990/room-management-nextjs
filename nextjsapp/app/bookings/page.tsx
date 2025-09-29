'use client';
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import UpdateBookingModal from "../../components/UpdateBooking";
import ProtectedRoute from "@/context/ProtectedRoute";
import { DataTable } from "@/components/DataTable";
import { getBookingColumns } from "@/components/columns/BookingColumns";
import { bookingService } from "@/api/booking.service";
import ViewBookingModal from "@/components/ViewBookingModal"; 


const BookingsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [editBookingId, setEditBookingId] = useState<number | null>(null);

    const { data: bookings = [], isLoading: isLoadingBookings, error: errorBookings } = useQuery({
        queryKey: ['bookings'],
        queryFn: async () => {
            const response = await bookingService.getAllBookings();
            return response.bookings.map(booking => ({
                ...booking,
                starttime: new Date(booking.starttime),
                endtime: new Date(booking.endtime)
            }));
        }
    });

    const handleBookingUpdate = (bookingid: number) => {
        setEditBookingId(bookingid);
        setIsUpdateOpen(true);
    };

    const handleUpdateSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        setTimeout(() => {
            handleCloseUpdate();
        }, 1000);
    };

    const handleCloseUpdate = () => {
        setIsUpdateOpen(false);
        setEditBookingId(null);
    };

    const stats = React.useMemo(() => {
        const statusCount = bookings.reduce((acc, booking) => {
            acc[booking.status] = (acc[booking.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total: bookings.length,
            confirmed: statusCount.confirmed || 0,
            cancelled: statusCount.cancelled || 0,
        };
    }, [bookings]);

    const bookingColumns = getBookingColumns(handleBookingUpdate);

    if (errorBookings && errorBookings.message!=='There are currently no bookings') {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-4">{(errorBookings as Error).message}</p>
                    <Link
                        href='/bookroom'
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                        Be the first to book a room
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <>
                <ViewBookingModal />
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-800 dark:to-red-900 transition-all duration-500">
                    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">

                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        Manage
                                        <br />
                                        <span className="bg-gradient-to-br from-red-600 to-pink-600 bg-clip-text text-transparent">Bookings</span>
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        View and manage your own bookings
                                    </p>
                                </div>
                                <Link
                                    href='/bookroom'
                                    className='inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                                >
                                    <Plus className='w-5 h-5 mr-2' />
                                    New Booking
                                </Link>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-red-300 dark:border-red-700 hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                            <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
                                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-red-300 dark:border-red-700 hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                            <CheckCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmed</p>
                                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.confirmed}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-red-300 dark:border-red-700 hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled</p>
                                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.cancelled}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:text-white p-4 dark:border-red-700 dark:border-2 border-2 border-red-300">
                        {bookings.length > 0 ? (
                            <DataTable
                                columns={bookingColumns}
                                data={bookings}
                                filterPlaceholder="Search by named fields (eg: hostname. etc)"
                                isLoading={isLoadingBookings}
                                enableColumnVisibility={false}
                                enableGlobalSearch={true}
                            />
                            
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-600 dark:text-gray-400">
                                <p className="text-lg mb-4">There are currently no bookings.</p>
                                <Link
                                    href='/bookroom'
                                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                                    Be the first to book a room
                                </Link>
                            </div>
                        )}
                    </div>
                    </div>
                </div>
                {isUpdateOpen && editBookingId && (
                    <UpdateBookingModal
                        isOpen={isUpdateOpen}
                        onClose={handleCloseUpdate}
                        bookingid={editBookingId}
                        onUpdateSuccess={handleUpdateSuccess}
                    />
                )}
            </>
        </ProtectedRoute>
    );
};

export default BookingsPage;