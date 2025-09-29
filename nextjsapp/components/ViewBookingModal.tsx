'use client';
import React, { useEffect, useState } from "react";
import { X } from 'lucide-react';
import { bookingService, type Booking } from "../api/booking.service";
import BookingCard from "./BookingsCard";
import { useViewBookingModalStore } from "@/stores/modalStore";

const ViewBookingModal: React.FC = () => {
    const { isViewBookingOpen, closeViewBooking, bookingId } = useViewBookingModalStore();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isViewBookingOpen && bookingId) {
            setIsLoading(true);
            setError(null);
            bookingService.getBookingById(bookingId)
                .then(response => {
                    if (response.success && response.booking) {
                        setBooking({
                            ...response.booking,
                            starttime: new Date(response.booking.starttime),
                            endtime: new Date(response.booking.endtime)
                        });
                    } else {
                        setError(response.message || 'Booking not found');
                    }
                })
                .catch(err => {
                    setError('Failed to fetch booking details.');
                    console.error(err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isViewBookingOpen, bookingId]);

    if (!isViewBookingOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-transparent bg-black/50 z-50 flex items-center justify-center p-4 shadow-lg">
            <div className=" backdrop-blur-xl bg-white shadow-lg dark:bg-gray-800 dark:border-red-900 dark:border-2 rounded-3xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
                <div className="p-6 sm:p-8 relative">
                    <button
                        onClick={closeViewBooking}
                        className="absolute right-4 top-4 p-2 rounded-lg text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                </div>
                <div className="flex items-center justify-center dark:text-white text-xl">Booking Details</div>
                <div className="p-6 sm:p-8">
                    {isLoading && (
                         <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    {booking && !isLoading && !error && (
                        <BookingCard booking={booking} showActions={false} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewBookingModal;