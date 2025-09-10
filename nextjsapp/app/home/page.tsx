'use client'
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { Users, Building2, Calendar, Plus, MapPin, CalendarX, Search } from 'lucide-react';
import Link from 'next/link';
import SmoothCarousel from '../../components/Carousel';
import BookingCard from '../../components/BookingsCard';
import type { Room } from '../../api/room.service';
import RoomCard from '../../components/RoomCard';
import { userService } from '../../api/user.service';
import { roomService } from '../../api/room.service';
import { bookingService, type Booking } from '../../api/booking.service';
import ProtectedRoute from '@/context/ProtectedRoute';

const HomePage = () => {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [bookingIndex, setBookingIndex] = useState(0);
    const [roomIndex, setRoomIndex] = useState(0);
    const [showPreviousBookings, setShowPreviousBookings] = useState(false);

    const { data: userBookings, isLoading: isLoadingBookings } = useQuery({
        queryKey: ['userBookings', user?.userid],
        queryFn: async () => {
            if (!user) return [];

            const createdBookingsResponse = await bookingService.getAllBookings({ createdBy: user.userid, limit: 100 });

            const allBookingsResponse = await bookingService.getAllBookings({ limit: 100 });

            let allUserBookings: Booking[] = [];

            if (createdBookingsResponse.success) {
                allUserBookings.push(...createdBookingsResponse.bookings);
            }

            if (allBookingsResponse.success) {
                const attendeeBookings = allBookingsResponse.bookings
                    .filter(apiBooking =>
                        apiBooking.attendees.some(attendee => attendee.userid === user.userid) &&
                        !allUserBookings.some(existing => existing.bookingid === apiBooking.bookingid)
                    );
                allUserBookings.push(...attendeeBookings);
            }

            return allUserBookings
                .map(b => ({ ...b, starttime: new Date(b.starttime), endtime: new Date(b.endtime) }))
                .sort((a, b) => a.starttime.getTime() - b.starttime.getTime());
        },
        enabled: !!user 
    });

    const { data: roomsData, isLoading: isLoadingRooms } = useQuery({
        queryKey: ['rooms'],
        queryFn: async () => {
            const response = await roomService.getAllRooms();
            return response.rooms;
        }
    });

    const { data: userLength, isLoading: isLoadingCount } = useQuery({
        queryKey: ['userCount'],
        queryFn: async () => {
            const users = await userService.getUsers();
            return users.length;
        },
        enabled: user?.role === 'admin'
    });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getCurrentUserBookings = () => {
        if (!user || !userBookings || userBookings.length === 0) return [];

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        return userBookings.filter(booking => {
            const bookingDate = new Date(booking.starttime);
            bookingDate.setHours(0, 0, 0, 0);

            const dateCondition = showPreviousBookings
                ? bookingDate < currentDate
                : bookingDate >= currentDate;

            return dateCondition;
        });
    };

    const displayBookings = getCurrentUserBookings();
    const featuredRooms = roomsData?.slice(0, 5) ?? [];

    const handlePreviousBooking = () => setBookingIndex((prev) => (prev > 0 ? prev - 1 : prev));
    const handleNextBooking = () => setBookingIndex((prev) => (prev < displayBookings.length - 1 ? prev + 1 : prev));
    const handlePreviousRoom = () => setRoomIndex((prev) => (prev > 0 ? prev - 1 : prev));
    const handleNextRoom = () => setRoomIndex((prev) => (prev < featuredRooms.length - 1 ? prev + 1 : prev));

    const features = [
        {
          icon: <Users className="w-6 h-6" />,
          title: 'Team Collaboration',
          description: "See who's attending and keep everyone in sync.",
        },
        {
          icon: <Building2 className="w-6 h-6" />,
          title: 'Smart Room Management',
          description: 'Easily browse available rooms with real-time updates.',
        },
    ];
    
    const roomFeatures = [
        {
          icon: <Building2 className="w-6 h-6" />,
          title: 'Total Rooms Available',
          description: `Browse through ${roomsData?.length ?? 0} meeting rooms across different floors and capacities.`,
        },
        {
          icon: <MapPin className="w-6 h-6" />,
          title: 'Location & Capacity',
          description: 'Find the perfect room size and location for your meeting needs.',
        },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900 transition-all duration-500">
                <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
                        <div className="space-y-6 sm:space-y-8 ">
                            <div className="space-y-4 sm:space-y-6 mb-10">
                                <h1 className='text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight'>
                                    Welcome,
                                    <span className=" block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                        {user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : ''}
                                    </span>
                                </h1>
                            </div>
                        </div>
                        <div className='hidden md:flex flex-col items-end text-right space-y-6 sm:space-y-8 '>
                            <div className='space-y-4 sm:space-y-6'>
                                <div className='flex flex-col items-end space-y-2'>
                                    <div className='text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight '>
                                        {currentTime.toLocaleTimeString('en-IN',{
                                            hour:'2-digit',
                                            minute:'2-digit',
                                            second:'2-digit'
                                        })}
                                    </div>
                                    <div className='text-lg text-xl leading-relaxed block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent'>
                                        {currentTime.toLocaleDateString('en-IN',{
                                            weekday:'short',
                                            year:'numeric',
                                            month:'short',
                                            day:'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {user?.role === 'admin' && (
                        <div className='grid md:grid-cols-2 gap-6 mb-8'>
                            <div className='bg-white dark:bg-gray-800 backdrop-blur-xl rounded-2xl shadow-lg border border-red-500 dark:border-red-900 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300'>
                                <div className='flex items-center justify-between mb-4'>
                                    <div className='flex items-center space-x-3'>
                                        <div className='w-12 h-12 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center'>
                                            <Users className='w-6 h-6 text-white'/>
                                        </div>
                                        <div>
                                            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Users</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-2xl font-bold text-gray-900 dark:text-white'>
                                        {isLoadingCount?
                                        (<span className='animate-pulse'>Loading...</span>)
                                        :`Currently active employees: ${userLength ?? 0}`} 
                                    </span>
                                    <Link href='/registeremployee' className='bg-red-100 dark:bg-red-500 dark:text-white p-2 rounded-lg hover:bg-red-300 dark:hover:bg-red-800 transition-colors'>
                                        <Plus className='w-4 h-4'/>
                                    </Link>
                                </div>
                            </div>
                           <div className='bg-white dark:bg-gray-800 backdrop-blur-xl rounded-2xl shadow-lg border border-red-500 dark:border-red-900 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300'>
                                <div className='flex items-center justify-between mb-4'>
                                    <div className='flex items-center space-x-3'>
                                        <div className='w-12 h-12 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center'>
                                            <Building2 className='w-6 h-6 text-white'/>
                                        </div>
                                        <div>
                                            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Rooms</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-2xl font-bold text-gray-900 dark:text-white'>
                                        {isLoadingRooms?
                                        (<span className='animate-pulse'>Loading...</span>)
                                        :`Currently active rooms: ${roomsData?.length ?? 0}`} 
                                    </span>
                                    <Link href='/registerroom' className='bg-red-100 dark:bg-red-500 dark:text-white p-2 rounded-lg hover:bg-red-300 dark:hover:bg-red-800 transition-colors'>
                                        <Plus className='w-4 h-4'/>
                                    </Link>
                                </div>
                            </div> 
                        </div>
                    )}

                    <div className='grid lg:grid-cols-2 lg:gap-16'>
                        <div className='order-1 lg:order-1'>
                            <div className='flex items-center justify-between mb-6'>
                                <h2 className='text-2xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white leading-tight'>
                                    {showPreviousBookings ? 'Previous ' : 'Upcoming '}
                                    <span className=" block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                        Bookings
                                    </span>
                                </h2>
                                <div className='flex items-center space-x-2'>
                                    <button
                                        onClick={() => setShowPreviousBookings(!showPreviousBookings)}
                                        className='px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                                    >
                                        <div className='flex items-center space-x-2'>
                                            <CalendarX className='w-4 h-4'/>
                                            <span>
                                                {showPreviousBookings ? 'View Upcoming' : 'View Previous'}
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {isLoadingBookings ? (
                                <div className='text-center py-8'>
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                                    <p className='text-lg text-gray-600 dark:text-gray-400'>Loading bookings...</p>
                                </div>
                            ) : displayBookings.length > 0 ? (
                                <SmoothCarousel
                                    title=""
                                    items={displayBookings}
                                    currentIndex={bookingIndex}
                                    onPrevious={handlePreviousBooking}
                                    onNext={handleNextBooking}
                                    renderCard={(item, index, currentIndex) => (
                                        <BookingCard
                                            booking={item as Booking}
                                            isActive={index === currentIndex}
                                            showActions={false}
                                        />
                                    )}
                                />
                            ) : (
                            <div className='text-center py-8'>
                                <Calendar className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                                <p className='text-lg text-gray-600 dark:text-gray-400 mb-2'>
                                    {showPreviousBookings ? 'No previous bookings found' : 'No upcoming bookings'}
                                </p>
                                <p className='text-gray-500 dark:text-gray-500 mb-4'>
                                    {showPreviousBookings 
                                        ? 'You haven\'t had any bookings yet'
                                            : 'Book a room to see your upcoming meetings'
                                    }
                                </p>
                            </div>
                            )}
                        </div>
                        <div className='order-2 lg:order-2 space-y-6 sm:space-y-8'>
                            <div className='space-y-4 sm:space-y-6 '>
                                <Link 
                                href='/bookroom'
                                className='inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] mb-2 mt-4'
                                >
                                <Plus className='w-5 h-5 mr-2'/>
                                Book a Room now
                                </Link>
                                <br/>
                                <Link 
                                    href='/bookings'
                                    className='bg-gradient-to-r from-red-600 to-pink-600 text-white px-5 py-3  rounded-xl inline-flex intems-center justify-center font-semibold shadow-md hover:from-red-900 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]'>
                                        <Search className='w-6 h-6 mr-2'/>
                                        View all bookings        
                                </Link>  
                                <h1 className="text-xl sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                                    View Your
                                    <span className="block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                        Meetings 
                                    </span>
                                </h1>
                                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                                    Quickly view your upcoming and past room bookings.
                                </p>
                            </div> 
                            <div className="space-y-4 sm:space-y-6">
                                {features.map((feature, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                                    >
                                        <div className="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                                            {feature.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
                                                {feature.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>  
                        </div>
                    </div>

                    <div className='grid lg:grid-cols-2 lg:gap-16 mt-16 '>
                        <div className='order-2 lg:order-2'>
                            <div className='flex items-center justify-between mb-6'> 
                                <h2 className='text-2xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white leading-tight'>
                                    Featured
                                    <span className=" block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                        Rooms
                                    </span>
                                </h2>
                            </div>
                            {isLoadingRooms ? (
                                <div className='text-center py-8'>
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                                    <p className='text-lg text-gray-600 dark:text-gray-400'>Loading rooms...</p>
                                </div>
                            ) : featuredRooms.length > 0 ? (
                                <SmoothCarousel
                                    title=""
                                    items={featuredRooms}
                                    currentIndex={roomIndex}
                                    onPrevious={handlePreviousRoom}
                                    onNext={handleNextRoom}
                                    renderCard={(item) => (
                                        <RoomCard
                                            room={item as Room}
                                        />
                                    )}
                                />
                            ) : (
                            <div className='text-center py-8'>
                                <Building2 className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                                <p className='text-lg text-gray-600 dark:text-gray-400 mb-2'>
                                    No rooms available
                                </p>
                                <p className='text-gray-500 dark:text-gray-500 mb-4'>
                                    Contact your administrator to add rooms to the system
                                </p>
                            </div>
                            )}
                            
                        </div>
                        <div className='order-1 lg:order-1 space-y-6 sm:space-y-8'>
                            <div className='space-y-4 sm:space-y-6 '>
                                <h1 className="text-xl sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                                    Explore Listed
                                    <span className="block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                       Spaces
                                    </span>
                                </h1>
                                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                                    Browse our meeting rooms and find the perfect space for your next collaboration.
                                </p>
                            </div> 
                            <div className="space-y-4 sm:space-y-6">
                                {roomFeatures.map((feature, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                                    >
                                        <div className="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                                            {feature.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
                                                {feature.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                             <Link 
                                href='/rooms'
                                className='inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                            >
                                <Search className='w-5 h-5 mr-2'/>
                                View All Rooms
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

export default HomePage;