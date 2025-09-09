'use client';
import React, { useEffect, useState } from "react";
import { Building2, Cog, Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { bookingService } from "../../api/booking.service";
import BookingCard from "../../components/BookingsCard";
import UpdateBookingModal from "../../components/UpdateBooking";
import { type Booking } from "../../api/booking.service";
import ProtectedRoute from "@/context/ProtectedRoute";

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [editBookingId, setEditBookingId] = useState<number | null>(null);
  const [success,setSuccess]=useState(false);
  const { user } = useAuth();

  const features = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Browse Bookings",
      description: "View all bookings made on the platform"
    },
    ...(user?.role === 'admin' ? [{
      icon: <Cog className='w-6 h-6' />,
      title: "Manage Bookings",
      description: 'Cancel, update or modify bookings as needed'
    }] : [])
  ];

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingService.getAllBookings();
        const bookingsWithDates = response.bookings.map(booking => ({
          ...booking,
          starttime: new Date(booking.starttime),
          endtime: new Date(booking.endtime)
        }));

        setBookings(bookingsWithDates);
      } catch (err: any) {
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleBookingUpdate = (bookingid: number) => {
    setEditBookingId(bookingid);
    setIsUpdateOpen(true);
  };

  const handleUpdateSuccess = async (updatedBooking: Booking) => {
  try {
    const response = await bookingService.getAllBookings();
    const bookingsWithDates = response.bookings.map(booking => ({
      ...booking,
      starttime: new Date(booking.starttime),
      endtime: new Date(booking.endtime)
    }));

    setSuccess(true);
    setBookings(bookingsWithDates);
  } catch (err: any) {
    console.error("Failed to refresh bookings", err);
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.bookingid === updatedBooking.bookingid 
          ? { ...booking, ...updatedBooking }
          : booking
      )
    );
  }
};

  useEffect(()=>{
    if(success){
      setTimeout(()=>{
        setSuccess(false);
        handleCloseUpdate();
      },1000);
    }
  })

  const handleCloseUpdate = () => {
    setIsUpdateOpen(false);
    setEditBookingId(null);
  };

  const handleBookingCancel = (cancelledBookingId: number) => {
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.bookingid === cancelledBookingId 
          ? { ...booking, status: 'cancelled' as const }
          : booking
      )
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-800 dark:to-red-900 transition-all duration-500">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-14">
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6 mt-20">
                {user?.role === 'admin' ? (
                  <>
                  <Link 
                    href='/bookroom'
                    className='inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                  >
                    <Plus className='w-5 h-5 mr-2'/>
                    Make a new booking
                  </Link>  
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">
                    Browse through
                    <span className="block bg-gradient-to-r from-red-600 to-gray-600 bg-clip-text text-transparent">
                      &
                    </span>
                    <span className="block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      Manage Bookings
                    </span>
                  </h1>
                  </>
                ) : (
                  <>
                  <Link 
                    href='/bookroom'
                    className='inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                  >
                    <Plus className='w-5 h-5 mr-2'/>
                    Make a new booking
                  </Link>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">
                    Browse through
                    <span className="block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      Bookings
                    </span>
                  </h1>
                  </>
                )}
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  {user?.role==='admin'?(
                    "View all bookings on the platform"
                  ):
                  (
                    "View and manage your own bookings"
                  )}
                </p>

                <div className="space-y-4 sm:space-y-6">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                    >
                      <div className="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                        {feature.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">No bookings found</p>
                  <p className="text-gray-500 dark:text-gray-500 mb-6">Start by making your first room booking</p>
                  <Link 
                    href='/bookroom'
                    className='inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]'
                  >
                    <Plus className='w-5 h-5 mr-2'/>
                    Book a Room
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookings.map((booking) => (
                    <BookingCard 
                      key={booking.bookingid} 
                      booking={booking} 
                      onDelete={handleBookingCancel}
                      onUpdate={handleBookingUpdate}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </div>
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