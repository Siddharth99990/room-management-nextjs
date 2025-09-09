import React, { useEffect, useState } from "react";
import { X, Check, Edit, Calendar, Clock, Building2,  Users, FileText } from 'lucide-react';
import { bookingService, type UpdateBookingRequest } from "../api/booking.service";
import { type Booking } from '../api/booking.service';
import { userService } from "../api/user.service";

interface UpdateBookingForm {
    title: string;
    description: string;
    starttime: string;
    endtime: string;
    status: 'confirmed' | 'cancelled';
    attendees: {
        userid: number;
        name: string;
    }[];
}

interface UpdateBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingid: number;
    onUpdateSuccess?: (updatedBooking: Booking) => void;
}

const UpdateBookingModal: React.FC<UpdateBookingModalProps> = ({ 
    isOpen, 
    onClose, 
    bookingid, 
    onUpdateSuccess 
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [originalBooking, setOriginalBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<{userid: number; name: string}[]>([]);
    
    const [attendeeSearch, setAttendeeSearch] = useState("");
    const [showAttendeeDropdown, setShowAttendeeDropdown] = useState(false);

    const [updateForm, setUpdateForm] = useState<UpdateBookingForm>({
        title: '',
        description: '',
        starttime: '',
        endtime: '',
        status: 'confirmed',
        attendees: [],
    });

    const formatDateForInput = (date: Date): string => {
        const pad = (num: number) => num.toString().padStart(2, '0');
        
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1); 
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };


    useEffect(() => {
        const fetchData = async () => {
            if (!isOpen || !bookingid) return;
            
            setLoading(true);
            try {
                const bookingResponse = await bookingService.getBookingById(bookingid);
                
                if (bookingResponse.booking) {
                    const booking = bookingResponse.booking;
                    setOriginalBooking(booking);

                    const starttime = new Date(booking.starttime);
                    const endtime = new Date(booking.endtime);
                    
                    setUpdateForm({
                        title: booking.title || '',
                        description: booking.description || '',
                        starttime: formatDateForInput(starttime),
                        endtime: formatDateForInput(endtime),
                        status: booking.status,
                        attendees: booking.attendees,
                    });
                } else {
                    setError('Booking not found');
                }

                const usersData = await userService.getUsers();
                setUsers(usersData.map(user => ({ userid: user.userid!, name: user.name })));
                
            } catch (err: any) {
                setError('Failed to fetch booking data: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isOpen, bookingid]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUpdateForm(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
        if (success) setSuccess(false);
    };

    const addAttendee = (user: {userid: number; name: string}) => {
        if (!updateForm.attendees.find(attendee => attendee.userid === user.userid)) {
            setUpdateForm(prev => ({
                ...prev,
                attendees: [...prev.attendees, user]
            }));
        }
        setAttendeeSearch("");
        setShowAttendeeDropdown(false);
    };

    const removeAttendee = (useridToRemove: number) => {
        setUpdateForm(prev => ({
            ...prev,
            attendees: prev.attendees.filter(attendee => attendee.userid !== useridToRemove)
        }));
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(attendeeSearch.toLowerCase()) &&
        !updateForm.attendees.find(attendee => attendee.userid === user.userid)
    );

    const validateForm = (): boolean => {
        if (!updateForm.title.trim()) {
            setError('Title is required');
            return false;
        }

        if (!updateForm.starttime) {
            setError('Start time is required');
            return false;
        }

        if (!updateForm.endtime) {
            setError('End time is required');
            return false;
        }

        const startDate = new Date(updateForm.starttime);
        const endDate = new Date(updateForm.endtime);
        const now = new Date();

        if (startDate >= endDate) {
            setError('End time must be after start time');
            return false;
        }

        if (startDate < now && updateForm.status === 'confirmed') {
            setError('Cannot schedule confirmed bookings in the past');
            return false;
        }

        const duration = endDate.getTime() - startDate.getTime();
        const maxDuration = 8 * 60 * 60 * 1000; 
        const minDuration = 15 * 60 * 1000; 

        if (duration > maxDuration) {
            setError('Booking duration cannot exceed 8 hours');
            return false;
        }

        if (duration < minDuration) {
            setError('Booking duration must be at least 15 minutes');
            return false;
        }

        if (originalBooking) {
            const originalStart = formatDateForInput(new Date(originalBooking.starttime));
            const originalEnd = formatDateForInput(new Date(originalBooking.endtime));
            
            const attendeesChanged = JSON.stringify(updateForm.attendees.sort((a, b) => a.userid - b.userid)) !== 
                                   JSON.stringify(originalBooking.attendees.sort((a, b) => a.userid - b.userid));

            if (updateForm.title === (originalBooking.title || '') &&
                updateForm.description === (originalBooking.description || '') &&
                updateForm.starttime === originalStart &&
                updateForm.endtime === originalEnd &&
                updateForm.status === originalBooking.status &&
                !attendeesChanged) {
                setError('No changes detected. Please modify at least one field.');
                return false;
            }
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

        setShowConfirm(true);
    };

    const handleConfirmUpdate = async () => {
        setIsSubmitting(true);
        setShowConfirm(false);

        try {
            const updateData: UpdateBookingRequest = {
                title: updateForm.title,
                description: updateForm.description,
                starttime: new Date(updateForm.starttime).toISOString(),
                endtime: new Date(updateForm.endtime).toISOString(),
                status: updateForm.status,
                attendees: updateForm.attendees
            };

            console.log('Updating booking with ID:', bookingid, 'Data:', updateData);
            const result = await bookingService.updateBooking(bookingid, updateData);

            if (result.success) {
                console.log('Booking updated successfully');
                setSuccess(true);

                const updatedBooking: Booking = {
                    ...originalBooking!,
                    bookingid:originalBooking!.bookingid,
                    createdBy:originalBooking!.createdBy,
                    roomid:originalBooking!.roomid,
                    title: result.data.title,
                    description: result.data.description,
                    starttime: new Date(result.data.starttime),
                    endtime: new Date(result.data.endtime),
                    status: result.data.status,
                    attendees: result.data.attendees,
                };

                if (onUpdateSuccess) {
                    onUpdateSuccess(updatedBooking);
                }
                setOriginalBooking(updatedBooking); 
            } else {
                setError(result.message || 'Failed to update booking');
            }
        } catch (err: any) {
            console.error("Update failed", err);
            setError(err.message || "An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setError('');
            setSuccess(false);
            setShowConfirm(false);
            setAttendeeSearch('');
            setShowAttendeeDropdown(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-red-800 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
                <div className="p-6 sm:p-8 border-b border-gray-200/50 dark:border-gray-700/50 relative">
                    <button 
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="absolute right-4 top-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                    
                    <div className="text-center">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Edit className="w-6 sm:w-8 h-6 sm:h-8 text-white"/>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Update Booking
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            Modify booking information
                        </p>
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        </div>
                    ) : (
                        <>
                            {success && (
                                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-xl">
                                    <div className="flex items-center">
                                        <Check className="w-5 h-5 text-green-600 dark:text-green-300 mr-2" />
                                        <p className="text-green-700 dark:text-green-300 font-medium text-sm">
                                            Booking updated successfully.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-xl">
                                    <p className="text-red-700 dark:text-red-300 text-sm">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="text"
                                        name="title"
                                        placeholder="Booking Title"
                                        value={updateForm.title}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <textarea 
                                        name="description"
                                        placeholder="Description (optional)"
                                        value={updateForm.description}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        rows={3}
                                        className="w-full pl-4 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input 
                                            type="datetime-local"
                                            name="starttime"
                                            value={updateForm.starttime}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                            className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            required
                                        />
                                    </div>

                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input 
                                            type="datetime-local"
                                            name="endtime"
                                            value={updateForm.endtime}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                            className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        name="status"
                                        value={updateForm.status}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                    >
                                        <option value="confirmed">Confirmed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>  
                                </div>

                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search and add attendees..."
                                        value={attendeeSearch}
                                        onChange={(e) => {
                                            setAttendeeSearch(e.target.value);
                                            setShowAttendeeDropdown(true);
                                        }}
                                        onFocus={() => setShowAttendeeDropdown(true)}
                                        disabled={isSubmitting}
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />

                                    {showAttendeeDropdown && attendeeSearch && (
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                            {filteredUsers.length > 0 ? (
                                                filteredUsers.map((user) => (
                                                    <button
                                                        key={user.userid}
                                                        type="button"
                                                        onClick={() => addAttendee(user)}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors duration-300"
                                                    >
                                                        <div className="font-medium text-gray-800 dark:text-gray-200">
                                                            {user.name}
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                                    No users found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {updateForm.attendees.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Selected Attendees ({updateForm.attendees.length})
                                        </label>
                                        <div className="flex flex-wrap gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                            {updateForm.attendees.map((attendee) => (
                                                <div
                                                    key={attendee.userid}
                                                    className="flex items-center bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm transition-all duration-300"
                                                >
                                                    {attendee.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttendee(attendee.userid)}
                                                        disabled={isSubmitting}
                                                        className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50 transition-colors duration-300"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {showConfirm ? (
                                    <div className="flex flex-col gap-4 pt-4">
                                        <p className="text-sm text-center text-gray-700 dark:text-gray-300 mb-2">
                                            Are you sure you want to update this booking?
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleConfirmUpdate}
                                                disabled={isSubmitting}
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? "Updating..." : "Confirm Update"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(false)}
                                                disabled={isSubmitting}
                                                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all duration-300 text-sm disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 pt-4">
                                        <button 
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-2.5 sm:py-3 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            Update Booking
                                        </button>
                                    </div>
                                )}
                        </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdateBookingModal;