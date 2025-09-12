'use client'
import React, { useState, useRef, useEffect } from "react";
import { Clock, Users, Building2, Search, Filter, X, Check, ChevronDown, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomService, type Room } from "../../api/room.service";
import { bookingService, type CreateBookingRequest } from "../../api/booking.service";
import { userService } from "../../api/user.service";
import ProtectedRoute from "@/context/ProtectedRoute";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema, type BookingFormData } from '../../validator/bookingvalidator';
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import { useEmployeeStore } from "@/stores/employeeStore";

interface AttendeeData {
    userid: number;
    name: string;
}

interface AttendeeOption {
    userid: number;
    name: string;
    email?: string;
}

const BookRoomPage: React.FC = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const {employees,getEmployees,isLoadingEmployees}=useEmployeeStore();
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [capacityFilter, setCapacityFilter] = useState<string>("");
    const [equipmentFilter, setEquipmentFilter] = useState<string>("");
    const [showAvailableOnly, setShowAvailableOnly] = useState(false);
    const [dateFilter, setDateFilter] = useState<string>("");
    const [startTimeFilter, setStartTimeFilter] = useState<string>("");
    const [endTimeFilter, setEndTimeFilter] = useState<string>("");
    const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
    const [attendeeSearch, setAttendeeSearch] = useState("");
    const [showAttendeeDropdown, setShowAttendeeDropdown] = useState(false);

    const attendeeInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        getEmployees();
    },[getEmployees]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
        trigger
    } = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            roomid: null,
            date: "",
            starttime: "",
            endtime: "",
            title: "",
            description: "",
            attendees: []
        }
    });

    const formValues = watch();
    const formAttendees = watch("attendees")||[];

    const {
        data: roomsData = [],
        isLoading: isLoadingRooms,
        error: roomsError
    } = useQuery({
        queryKey: ['rooms'],
        queryFn: async () => {
            const response = await roomService.getAllRooms();
            return response.rooms;
        },
        staleTime: 5 * 60 * 1000,
    });

    const {
        data: availableAttendees = [],
        isLoading: isLoadingAttendees,
    } = useQuery({
        queryKey: ['users', user?.userid],
        queryFn: async () => {
            if (!user) return [];
            const users = await userService.getUsers();
            return users
                .filter(u => u.userid !== user.userid)
                .map(u => ({
                    userid: u.userid!,
                    name: u.name,
                    email: u.email
                }));
        },
        enabled: !!user,
        staleTime: 10 * 60 * 1000,
    });

    const {
        data: availableRooms = [],
        isLoading: isCheckingAvailability,
    } = useQuery({
        queryKey: ['availableRooms', dateFilter, startTimeFilter, endTimeFilter],
        queryFn: async () => {
            const startDateTime = new Date(`${dateFilter}T${startTimeFilter}`);
            const endDateTime = new Date(`${dateFilter}T${endTimeFilter}`);
            
            const response = await bookingService.getAvailableRooms(
                startDateTime.toISOString(),
                endDateTime.toISOString()
            );
            
            if (response.success && response.data) {
                return response.data;
            }
            return [];
        },
        enabled: showAvailableOnly && !!dateFilter && !!startTimeFilter && !!endTimeFilter,
        staleTime: 1 * 60 * 1000,
    });

    const bookRoomMutation = useMutation({
        mutationFn: async (bookingData: CreateBookingRequest) => {
            return await bookingService.bookRoom(bookingData);
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success("Room booked successfully!");
                
                // Reset form
                resetFormAndCloseModal();
                
                // Invalidate queries to refresh data
                queryClient.invalidateQueries({ queryKey: ['bookings'] });
                queryClient.invalidateQueries({ queryKey: ['userBookings'] });
                queryClient.invalidateQueries({ queryKey: ['availableRooms'] });
            } else {
                toast.error(response.message || "Failed to book room");
            }
        },
        onError: (err: any) => {
            console.error("Error booking room:", err);
            toast.error(err.message || "Network error. Please check your connection and try again.");
        }
    });

    // Handle click outside for dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                attendeeInputRef.current &&
                !attendeeInputRef.current.contains(event.target as Node)
            ) {
                setShowAttendeeDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Show error from queries if any
    useEffect(() => {
        if (roomsError) {
            toast.error("Failed to fetch rooms. Please refresh the page.");
        }
    }, [roomsError]);

    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const isRoomAvailable = (roomid: number): boolean => {
        if (!showAvailableOnly || !dateFilter || !startTimeFilter || !endTimeFilter) {
            return true;
        }
        return availableRooms.some(room => room.roomid === roomid);
    };

    const filteredRooms = roomsData.filter(room => {
        const matchesSearch = room.roomname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.roomlocation.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCapacity = !capacityFilter ||
            (capacityFilter === "small" && room.capacity <= 6) ||
            (capacityFilter === "medium" && room.capacity > 6 && room.capacity <= 12) ||
            (capacityFilter === "large" && room.capacity > 12);

        const matchesEquipment = !equipmentFilter ||
            room.equipment.some(eq => eq.toLowerCase().includes(equipmentFilter.toLowerCase()));

        const matchesAvailability = !showAvailableOnly || isRoomAvailable(room.roomid);

        return matchesSearch && matchesCapacity && matchesEquipment && matchesAvailability;
    });

    const handleRoomSelect = (room: Room) => {
        if (showAvailableOnly && !isRoomAvailable(room.roomid)) {
            return;
        }

        setSelectedRoom(room);
        setValue("roomid", room.roomid);
        setValue("date", dateFilter || "");
        setValue("starttime", startTimeFilter || "");
        setValue("endtime", endTimeFilter || "");
        setIsBookingFormOpen(true);
    };

    const addAttendee = (attendee: AttendeeOption) => {
        const attendeeData: AttendeeData = {
            userid: attendee.userid,
            name: attendee.name,
        };

        if (!formAttendees.some(a => a.userid === attendee.userid)) {
            setValue("attendees", [...formAttendees, attendeeData]);
        }
        setAttendeeSearch("");
        setShowAttendeeDropdown(false);
    };

    const removeAttendee = (attendeeId: number) => {
        setValue("attendees", formAttendees.filter(a => a.userid !== attendeeId));
    };

    const filteredAttendees = availableAttendees.filter(attendee =>
        attendee.name.toLowerCase().includes(attendeeSearch.toLowerCase()) &&
        !formAttendees.some(a => a.userid === attendee.userid)
    );

    const handleAttendeeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAttendeeSearch(value);
        setShowAttendeeDropdown(value.length > 0 || availableAttendees.length > 0);
    };

    const handleAttendeeInputFocus = () => {
        setShowAttendeeDropdown(true);
    };

    const onSubmit: SubmitHandler<BookingFormData> = async (data) => {
        if (!user) {
            toast.error("User authentication required");
            return;
        }

        const startDateTime = new Date(`${data.date}T${data.starttime}`);
        const endDateTime = new Date(`${data.date}T${data.endtime}`);

        const bookingData: CreateBookingRequest = {
            title: data.title.trim(),
            description: data?.description?.trim() || undefined,
            starttime: startDateTime.toISOString(),
            endtime: endDateTime.toISOString(),
            roomid: data.roomid!,
            attendees: data.attendees!.length > 0 ? data.attendees : undefined
        };

        bookRoomMutation.mutate(bookingData);
    };

    const resetFormAndCloseModal = () => {
        setIsBookingFormOpen(false);
        setSelectedRoom(null);
        reset();
        setAttendeeSearch("");
        setShowAttendeeDropdown(false);
    };

    return (
        <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-red-900 transition-all duration-500">
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                        Book a
                        <span className="block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                            Room
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto mt-4">
                        Find and Book rooms for your meetings
                    </p>
                </div>

                <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-red-500 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="relative lg:col-span-3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search rooms..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <select
                            value={capacityFilter}
                            onChange={(e) => setCapacityFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                            <option value="">Any capacity</option>
                            <option value="small">Small (1-6 people)</option>
                            <option value="medium">Medium (7-12 people)</option>
                            <option value="large">Large (12+ people)</option>
                        </select>

                        <select
                            value={equipmentFilter}
                            onChange={(e) => setEquipmentFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Any Equipment</option>
                            <option value="projector">Projector</option>
                            <option value="video conference">Video Conference</option>
                            <option value="wifi">WiFi</option>
                            <option value="whiteboard">Whiteboard</option>
                            <option value="smart tv">Smart TV</option>
                            <option value="sound system">Sound System</option>
                            <option value="ac">AC</option>
                            <option value="lighting">Lighting</option>
                            <option value="chair">Chair</option>
                            <option value="desk">Desk</option>
                            <option value="long table">Long Table</option>
                            <option value="microphone">Microphone</option>
                            <option value="speaker">Speaker</option>
                        </select>

                        <div className="flex items-center space-x-2 px-4 py-2">
                            <input
                                type="checkbox"
                                id="availability-check"
                                checked={showAvailableOnly}
                                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <label htmlFor="availability-check" className="text-sm text-gray-700 dark:text-gray-300">
                                Check availability
                            </label>
                        </div>
                    </div>

                    {showAvailableOnly && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    min={getTomorrowDate()}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Start Time *
                                </label>
                                <input
                                    type="time"
                                    value={startTimeFilter}
                                    onChange={(e) => setStartTimeFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    End Time *
                                </label>
                                <input
                                    type="time"
                                    value={endTimeFilter}
                                    onChange={(e) => setEndTimeFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    )}

                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-4 flex items-center">
                        {isCheckingAvailability && (
                            <div className="inline-flex items-center mr-4">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                Checking availability...
                            </div>
                        )}
                        Showing {filteredRooms.length} of {roomsData.length} rooms
                        {showAvailableOnly && dateFilter && startTimeFilter && endTimeFilter && (
                            <span className="ml-2 text-red-600 dark:text-red-400">
                                Available on {new Date(dateFilter).toLocaleDateString()} from {startTimeFilter} to {endTimeFilter}
                            </span>
                        )}
                    </div>
                </div>

                {isLoadingRooms ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Loading rooms...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {filteredRooms.map((room) => {
                            const isAvailable = isRoomAvailable(room.roomid);
                            const canSelect = !showAvailableOnly || isAvailable;

                            return (
                                <div key={room.roomid}
                                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-500 p-6 transition-all duration-300 ${
                                        canSelect 
                                            ? 'border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1' 
                                            : 'border-red-200 dark:border-red-700 opacity-60 cursor-not-allowed'
                                    }`}
                                    >

                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                            {room.roomname}
                                        </h3>
                                        {showAvailableOnly && dateFilter && startTimeFilter && endTimeFilter && (
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                isAvailable
                                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                                                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                                            }`}>
                                                {isAvailable ? 'Available' : 'Occupied'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                            <Building2 className="w-4 h-4 mr-2" />
                                            <span className="text-sm">{room.roomlocation}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                            <Users className="w-4 h-4 mr-2" />
                                            <span className="text-sm">Capacity: {room.capacity} people</span>
                                        </div>
                                        {showAvailableOnly && !isAvailable && (
                                            <div className="flex items-center text-red-600 dark:text-red-400">
                                                <Clock className="w-4 h-4 mr-2" />
                                                <span className="text-sm">Not available at selected time</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Equipment:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {room.equipment.map((item, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRoomSelect(room)}
                                        disabled={!canSelect}
                                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                                            canSelect
                                                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 hover:shadow-lg'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {canSelect ? 'Book Room' : 'Not Available'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!isLoadingRooms && filteredRooms.length === 0 && (
                    <div className="text-center py-12">
                        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                            No rooms found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Try adjusting your search filters or check back later for new rooms.
                        </p>
                    </div>
                )}

                {/* Booking Form Modal */}
                {isBookingFormOpen && selectedRoom && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                    Book {selectedRoom.roomname}
                                </h2>
                                <button
                                    onClick={resetFormAndCloseModal}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Meeting Title *
                                    </label>
                                    <input
                                        type="text"
                                        {...register("title")}
                                        className={`w-full px-4 py-2 border ${
                                            errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
                                        placeholder="Enter meeting title"
                                        maxLength={200}
                                    />
                                    {errors.title && (
                                        <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        {...register("description")}
                                        className={`w-full px-4 py-2 border ${
                                            errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
                                        placeholder="Enter meeting description"
                                        rows={3}
                                    />
                                    {errors.description && (
                                        <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Date *
                                        </label>
                                        <input
                                            type="date"
                                            {...register("date")}
                                            min={getTomorrowDate()}
                                            className={`w-full px-4 py-2 border ${
                                                errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
                                        />
                                        {errors.date && (
                                            <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Start Time *
                                        </label>
                                        <input
                                            type="time"
                                            {...register("starttime")}
                                            className={`w-full px-4 py-2 border ${
                                                errors.starttime ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
                                        />
                                        {errors.starttime && (
                                            <p className="text-xs text-red-500 mt-1">{errors.starttime.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            End Time *
                                        </label>
                                        <input
                                            type="time"
                                            {...register("endtime")}
                                            className={`w-full px-4 py-2 border ${
                                                errors.endtime ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
                                        />
                                        {errors.endtime && (
                                            <p className="text-xs text-red-500 mt-1">{errors.endtime.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Add Attendees
                                    </label>
                                    <div className="relative" ref={dropdownRef}>
                                        <input
                                            type="text"
                                            ref={attendeeInputRef}
                                            value={attendeeSearch}
                                            onChange={handleAttendeeInputChange}
                                            onFocus={handleAttendeeInputFocus}
                                            placeholder="Search for attendees..."
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                        {showAttendeeDropdown && (
                                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                                                {filteredAttendees.length > 0 ? (
                                                    filteredAttendees.map((attendee) => (
                                                        <div
                                                            key={attendee.userid}
                                                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                                            onClick={() => addAttendee(attendee)}
                                                        >
                                                            <div className="font-medium text-gray-800 dark:text-gray-200">
                                                                {attendee.name}
                                                            </div>
                                                            {attendee.email && (
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {attendee.email}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                                                        No attendees found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {formAttendees.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {formAttendees.map((attendee) => (
                                                <div
                                                    key={attendee.userid}
                                                    className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg"
                                                >
                                                    <div>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">
                                                            {attendee.name}
                                                        </span>
                                                        <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full">
                                                            Invited
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttendee(attendee.userid)}
                                                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={resetFormAndCloseModal}
                                        disabled={bookRoomMutation.isPending}
                                        className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={bookRoomMutation.isPending}
                                        className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {bookRoomMutation.isPending ? 'Booking...' : 'Book Room'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </ProtectedRoute>
    );
};

export default BookRoomPage;