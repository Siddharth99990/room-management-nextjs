'use client';
import React, { useState } from "react";
import { Calendar, Building, Users, User, Clock, MapPin, Edit, X } from "lucide-react";
import { bookingService } from "../api/booking.service";
import { type Booking } from "../api/booking.service";
import { useAuthStore } from "@/stores/authStore";

interface BookingCardProps {
    booking: Booking;
    isActive?: boolean;
    onDelete?: (bookingid: number) => void;
    onUpdate?: (bookingid: number) => void;
    showActions?:boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({
    booking,
    isActive = true,
    onDelete,
    onUpdate,
    showActions,
}) => {
    const { user } = useAuthStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300';
            case 'cancelled': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300';
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
        }
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleCancel = async () => {
        if (!user?.userid) {
            alert('User authentication required');
            return;
        }

        try {
            setIsDeleting(true);
            await bookingService.cancelBooking(booking.bookingid, user.userid);
            onDelete?.(booking.bookingid);
        } catch (error: any) {
            console.error('Failed to cancel booking:', error);
            alert(`Failed to cancel booking: ${error.message}`);
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    const handleCancelClick = () => {
        setShowConfirm(true);
    };

    const handleCancelConfirm = () => {
        setShowConfirm(false);
    };

    const handleUpdate = () => {
        onUpdate?.(booking.bookingid);
    };

    const canModify =user?.userid === booking.createdBy.userid;
    const isPastBooking = new Date(booking.endtime) < new Date();

    return (
        <div className={`flex flex-col bg-white dark:bg-gray-800 backdrop-blur-xl rounded-xl shadow-lg border border-red-500 dark:border-red-900 p-6 transition-all duration-300 ${isActive ? 'hover:shadow-xl hover:-translate-y-1' : ''
            }`}>
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-white bg-red-500 dark:bg-gray-700 px-2 py-1 rounded transition-colors duration-300">
                                ID: {booking.bookingid}
                            </span>
                            {isPastBooking && (
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                    Past
                                </span>
                            )}
                        </div>

                        {booking.title && (
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 leading-tight">
                                {booking.title}
                            </h3>
                        )}

                        {booking.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 leading-relaxed">
                                {booking.description.length > 100
                                    ? `${booking.description.substring(0, 100)}...`
                                    : booking.description
                                }
                            </p>
                        )}
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-800 dark:text-white transition-colors duration-300">
                        <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">
                            {booking.roomid.roomname ? `${booking.roomid.roomname} (Room ${booking.roomid.roomid})` : `Room ${booking.roomid.roomid}`}
                        </span>
                    </div>

                    {booking.roomid.roomlocation && (
                        <div className="flex items-center text-gray-800 dark:text-white transition-colors duration-300">
                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">{booking.roomid.roomlocation}</span>
                        </div>
                    )}

                    <div className="flex items-center text-gray-800 dark:text-white transition-colors duration-300">
                        <User className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">Host: {booking.createdBy.name}</span>
                    </div>

                    <div className="flex items-center text-gray-800 dark:text-white transition-colors duration-300">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">Date: {formatDate(booking.starttime)}</span>
                    </div>

                    <div className="flex items-center text-gray-800 dark:text-white transition-colors duration-300">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">Time: {formatTime(booking.starttime)} - {formatTime(booking.endtime)}</span>
                    </div>

                    <div className="flex items-center text-gray-800 dark:text-white transition-colors duration-300">
                        <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{booking.attendees.length} attendee{booking.attendees.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {booking.attendees.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-2 transition-colors duration-300">
                            Attendees ({booking.attendees.length})
                        </h4>
                        <div className="space-y-2 max-h-24 overflow-y-auto">
                            {booking.attendees.map((attendee) => (
                                <div key={attendee.userid} className="flex items-center text-sm">
                                    <span className="text-gray-800 dark:text-white transition-colors duration-300">
                                        {attendee.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

                    {showActions && (
                <>
                    {canModify && booking.status === 'confirmed' && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            {showConfirm ? (
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                                        Cancel "{booking.title || `Booking ${booking.bookingid}`}"?
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCancel}
                                            disabled={isDeleting}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-all duration-300 text-sm disabled:opacity-50"
                                        >
                                            {isDeleting ? "Cancelling..." : "Yes, Cancel"}
                                        </button>
                                        <button
                                            onClick={handleCancelConfirm}
                                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all duration-300 text-sm"
                                        >
                                            Keep
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    {onUpdate && !isPastBooking && (
                                        <button
                                            onClick={handleUpdate}
                                            className="flex-1 flex items-center justify-center px-3 py-2 bg-gradient-to-br from-red-600 to-pink-600 text-white rounded-lg hover:brightness-75 dark:hover:brightness-75 transition-all duration-300 text-sm font-medium"
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Update
                                        </button>
                                    )}
                                    <button
                                        onClick={handleCancelClick}
                                        className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 text-sm font-medium"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {(!canModify || booking.status === 'cancelled' || isPastBooking) && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                                {booking.status === 'cancelled'
                                    ? 'This booking has been cancelled'
                                    : isPastBooking
                                        ? 'This booking has ended'
                                        : 'You cannot modify this booking'
                                }
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
export default BookingCard;