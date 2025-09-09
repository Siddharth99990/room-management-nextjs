'use client'
import React, { useEffect, useState, useRef } from "react";
import { Clock, Users, Building2, Search, Filter, X, Check, ChevronDown } from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import { roomService, type Room } from "../../api/room.service";
import { bookingService, type CreateBookingRequest } from "../../api/booking.service";
import { userService } from "../../api/user.service";
import Link from "next/link";
import ProtectedRoute from "@/context/ProtectedRoute";

interface BookingForm {
    roomid: number | null;
    date: string;
    starttime: string;
    endtime: string;
    title: string;
    description: string;
    attendees: AttendeeData[];
}

interface AttendeeData {
    userid: number;
    name: string;
    status?: 'invited' | 'accepted' | 'declined';
}

interface AttendeeOption {
    userid: number;
    name: string;
    email?: string;
}

const BookRoomPage: React.FC = () => {
    const { user } = useAuth();
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [roomsData, setRoomsData] = useState<Room[]>([]);
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [availableAttendees, setAvailableAttendees] = useState<AttendeeOption[]>([]);
    const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);

    const attendeeInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [bookingForm, setBookingForm] = useState<BookingForm>({
        roomid: null,
        date: "",
        starttime: "",
        endtime: "",
        title: "",
        description: "",
        attendees: []
    });

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await roomService.getAllRooms();
                setRoomsData(response.rooms);
            } catch (err: any) {
                console.error("Error fetching rooms:", err);
                setRoomsData([]);
                setError("Failed to fetch rooms. Please refresh the page.");
            } finally {
                setIsLoadingRooms(false);
            }
        };
        fetchRooms();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!user) return;
            
            setIsLoadingAttendees(true);
            try {
                const users = await userService.getUsers();
                const filteredUsers = users
                    .filter(u => u.userid !== user.userid)
                    .map(u => ({
                        userid: u.userid!,
                        name: u.name,
                        email: u.email
                    }));
                setAvailableAttendees(filteredUsers);
            } catch (err: any) {
                console.error("Error fetching users:", err);
                setAvailableAttendees([]);
            } finally {
                setIsLoadingAttendees(false);
            }
        };
        fetchUsers();
    }, [user]);

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

    useEffect(() => {
        const checkAvailability = async () => {
            if (showAvailableOnly && dateFilter && startTimeFilter && endTimeFilter) {
                setIsCheckingAvailability(true);
                try {
                    const startDateTime = new Date(`${dateFilter}T${startTimeFilter}`);
                    const endDateTime = new Date(`${dateFilter}T${endTimeFilter}`);
                    
                    const response = await bookingService.getAvailableRooms(
                        startDateTime.toISOString(),
                        endDateTime.toISOString()
                    );
                    
                    if (response.success && response.data) {
                        setAvailableRooms(response.data);
                    } else {
                        setAvailableRooms([]);
                    }
                } catch (err: any) {
                    console.error("Error checking availability:", err);
                    setAvailableRooms([]);
                } finally {
                    setIsCheckingAvailability(false);
                }
            } else {
                setAvailableRooms([]);
            }
        };

        checkAvailability();
    }, [showAvailableOnly, dateFilter, startTimeFilter, endTimeFilter]);

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
        setBookingForm(prev => ({
            ...prev,
            roomid: room.roomid,
            date: dateFilter || prev.date,
            starttime: startTimeFilter || prev.starttime,
            endtime: endTimeFilter || prev.endtime
        }));
        setIsBookingFormOpen(true);
        setError('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBookingForm(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const addAttendee = (attendee: AttendeeOption) => {
        const attendeeData: AttendeeData = {
            userid: attendee.userid,
            name: attendee.name,
            status: 'invited'
        };

        if (!bookingForm.attendees.some(a => a.userid === attendee.userid)) {
            setBookingForm(prev => ({
                ...prev,
                attendees: [...prev.attendees, attendeeData]
            }));
        }
        setAttendeeSearch("");
        setShowAttendeeDropdown(false);
    };

    const removeAttendee = (attendeeId: number) => {
        setBookingForm(prev => ({
            ...prev,
            attendees: prev.attendees.filter(a => a.userid !== attendeeId)
        }));
    };

    const filteredAttendees = availableAttendees.filter(attendee =>
        attendee.name.toLowerCase().includes(attendeeSearch.toLowerCase()) &&
        !bookingForm.attendees.some(a => a.userid === attendee.userid)
    );

    const handleAttendeeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAttendeeSearch(value);
        setShowAttendeeDropdown(value.length > 0 || availableAttendees.length > 0);
    };

    const handleAttendeeInputFocus = () => {
        setShowAttendeeDropdown(true);
    };

    const validateForm = (): boolean => {
        if (!bookingForm.title.trim()) {
            setError("Meeting title is required");
            return false;
        }

        if (!bookingForm.date) {
            setError("Date is required");
            return false;
        }

        if (!bookingForm.starttime || !bookingForm.endtime) {
            setError("Start and end times are required");
            return false;
        }

        if (bookingForm.starttime >= bookingForm.endtime) {
            setError("End time must be after start time");
            return false;
        }
        const startDateTime = new Date(`${bookingForm.date}T${bookingForm.starttime}`);
        if (startDateTime < new Date()) {
            setError("Cannot book rooms in the past");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) return;
        if (!user) {
            setError("User authentication required");
            return;
        }

        setIsSubmitting(true);

        try {
            const startDateTime = new Date(`${bookingForm.date}T${bookingForm.starttime}`);
            const endDateTime = new Date(`${bookingForm.date}T${bookingForm.endtime}`);

            const bookingData: CreateBookingRequest = {
                title: bookingForm.title.trim(),
                description: bookingForm.description.trim() || undefined,
                starttime: startDateTime.toISOString(),
                endtime: endDateTime.toISOString(),
                roomid: bookingForm.roomid!,
                attendees: bookingForm.attendees.length > 0 ? bookingForm.attendees : undefined
            };

            console.log('Sending booking data:', bookingData);

            const response = await bookingService.bookRoom(bookingData);

            if (response.success) {
                console.log('Booking successful:', response);
                setSuccess(true);

                setBookingForm({
                    roomid: null,
                    date: "",
                    starttime: "",
                    endtime: "",
                    title: "",
                    description: "",
                    attendees: []
                });
                setSelectedRoom(null);

                if (showAvailableOnly && dateFilter && startTimeFilter && endTimeFilter) {
                    const startDateTime = new Date(`${dateFilter}T${startTimeFilter}`);
                    const endDateTime = new Date(`${dateFilter}T${endTimeFilter}`);
                    
                    try {
                        const availabilityResponse = await bookingService.getAvailableRooms(
                            startDateTime.toISOString(),
                            endDateTime.toISOString()
                        );
                        
                        if (availabilityResponse.success && availabilityResponse.data) {
                            setAvailableRooms(availabilityResponse.data);
                        }
                    } catch (err) {
                        console.error("Error refreshing availability:", err);
                    }
                }

                setTimeout(() => {
                    setSuccess(false);
                    setIsBookingFormOpen(false);
                }, 2000);
            } else {
                setError(response.message || "Failed to book room");
            }
        } catch (err: any) {
            console.error("Error booking room:", err);
            setError(err.message || "Network error. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setIsBookingFormOpen(false);
        setSelectedRoom(null);
        setBookingForm({
            roomid: null,
            date: "",
            starttime: "",
            endtime: "",
            title: "",
            description: "",
            attendees: []
        });
        setError("");
        setSuccess(false);
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

                {success && (
                    <div className="mb-8 max-w-md mx-auto">
                        <div className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg p-4">
                            <div className="flex items-center">
                                <Check className="w-5 h-5 text-green-600 dark:text-green-300 mr-2" />
                                <p className="text-green-700 dark:text-green-300 font-medium">
                                    Room booked successfully
                                </p>
                            </div>
                        </div>
                    </div>
                )}

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
                                                <span className="text-sm">Conflict at requested time</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-1">
                                            {room.equipment.slice(0, 3).map((equipment, index) => (
                                                <span key={index}
                                                    className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 text-xs rounded-md">
                                                    {equipment}
                                                </span>
                                            ))}
                                            {room.equipment.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">
                                                    +{room.equipment.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button 
                                        disabled={!canSelect}
                                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                                            canSelect
                                                ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-105'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                        onClick={() => canSelect && handleRoomSelect(room)}>
                                        {canSelect ? 'Select Room' : 'Unavailable'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!isLoadingRooms && roomsData.length===0 &&(
                    <div className="text-center py-12">
                        <X className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">No rooms present in the database</p>
                        {
                            user?.role==='admin'?(
                                <Link href='/registerroom'
                                 className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                                    Register Room
                                </Link>
                            ):(
                                <p className="text-gray-500 dark:text-gray-500">Please contact an admin to add rooms</p>
                            )
                        }
                    </div>
                )}
                
                {!isLoadingRooms&&  filteredRooms.length===0 &&(
                    <div className="text-center py-12">
                        <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">No rooms match your criteria</p>
                        <p className="text-gray-500 dark:text-gray-500">Try adjusting your search filters</p>
                    </div>
                )}

                {isBookingFormOpen && selectedRoom && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                    Book {selectedRoom.roomname}
                                </h2>
                                <button
                                    onClick={resetForm}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {error && (
                                    <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg p-4">
                                        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Meeting Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={bookingForm.title}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter meeting title"
                                        maxLength={200}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{bookingForm.title.length}/200 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description (optional)
                                    </label>
                                    <textarea
                                        name="description"
                                        value={bookingForm.description}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter meeting description"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={bookingForm.date}
                                            onChange={handleInputChange}
                                            min={getTomorrowDate()}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Start Time *
                                        </label>
                                        <input
                                            type="time"
                                            name="starttime"
                                            value={bookingForm.starttime}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            End Time *
                                        </label>
                                        <input
                                            type="time"
                                            name="endtime"
                                            value={bookingForm.endtime}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Attendees (optional)
                                    </label>

                                    <div className="relative">
                                        <input
                                            ref={attendeeInputRef}
                                            type="text"
                                            value={attendeeSearch}
                                            onChange={handleAttendeeInputChange}
                                            onFocus={handleAttendeeInputFocus}
                                            placeholder="Search and add attendees..."
                                            className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            {isLoadingAttendees ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                            ) : (
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showAttendeeDropdown ? 'rotate-180' : ''}`} />
                                            )}
                                        </div>
                                    </div>

                                    {bookingForm.attendees.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {bookingForm.attendees.map((attendee) => (
                                                <div
                                                    key={attendee.userid}
                                                    className="flex items-center bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm"
                                                >
                                                    <span>{attendee.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttendee(attendee.userid)}
                                                        className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-0.5"
                                                        aria-label={`Remove ${attendee.name}`}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {showAttendeeDropdown && (
                                        <div 
                                            ref={dropdownRef}
                                            className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                        >
                                            {isLoadingAttendees ? (
                                                <div className="flex items-center justify-center py-4">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                                                    <span className="ml-2 text-gray-500">Loading attendees...</span>
                                                </div>
                                            ) : filteredAttendees.length > 0 ? (
                                                <>
                                                    <div className="sticky top-0 bg-gray-50 dark:bg-gray-600 px-4 py-2 border-b border-gray-200 dark:border-gray-500">
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                            {filteredAttendees.length} attendee{filteredAttendees.length !== 1 ? 's' : ''} available
                                                        </span>
                                                    </div>
                                                    {filteredAttendees.map((attendee) => (
                                                        <button
                                                            key={attendee.userid}
                                                            type="button"
                                                            onClick={() => addAttendee(attendee)}
                                                            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600 focus:outline-none border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                                                        >
                                                            <div className="flex items-center">
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-gray-800 dark:text-gray-200">
                                                                        {attendee.name}
                                                                    </div>
                                                                    {attendee.email && (
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                            {attendee.email}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Users className="w-4 h-4 text-gray-400 ml-2" />
                                                            </div>
                                                        </button>
                                                    ))}
                                                </>
                                            ) : (
                                                <div className="px-4 py-6 text-center">
                                                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {attendeeSearch ? 'No attendees match your search' : 'No attendees available'}
                                                    </p>
                                                    {attendeeSearch && (
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                            Try adjusting your search terms
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedRoom && bookingForm.attendees.length + 1 > selectedRoom.capacity && (
                                        <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                                                        <strong>Capacity Warning:</strong> Total attendees ({bookingForm.attendees.length + 1} including you) exceeds room capacity ({selectedRoom.capacity})
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {bookingForm.attendees.length > 0 && (
                                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">
                                                {bookingForm.attendees.length + 1} total attendee{bookingForm.attendees.length + 1 !== 1 ? 's' : ''} 
                                            </span>
                                            <span className="text-gray-500"> (including you)</span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Selected Room Details</h3>
                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center">
                                            <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                                            <span className="font-medium">Room:</span> 
                                            <span className="ml-1">{selectedRoom.roomname}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="font-medium">Location:</span> 
                                            <span className="ml-1">{selectedRoom.roomlocation}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 mr-2 text-gray-500" />
                                            <span className="font-medium">Capacity:</span> 
                                            <span className="ml-1">{selectedRoom.capacity} people</span>
                                        </div>
                                        <div className="flex items-start">
                                            <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <div>
                                                <span className="font-medium">Equipment:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {selectedRoom.equipment.map((eq, index) => (
                                                        <span key={index} className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">
                                                            {eq}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        disabled={isSubmitting}
                                        className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Booking...
                                            </div>
                                        ) : (
                                            'Book Room'
                                        )}
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
