import {create} from 'zustand';
import { bookingService, type Booking, type CreateBookingRequest, type UpdateBookingRequest} from '@/api/booking.service';
import toast from 'react-hot-toast';

interface BookingState{
  bookings:Booking[];
  isLoadingBookings:boolean;
  errorBookings:string|null;
  fetchBookings:()=>Promise<void>;
  addBooking:(bookingData:CreateBookingRequest)=>Promise<boolean>;
  updateBooking:(bookingid:number,bookingData:UpdateBookingRequest)=>Promise<boolean>;
  cancelBooking:(bookingid:number,userid:number)=>Promise<boolean>;    
};

export const useBookingStore=create<BookingState>((set,get)=>({
  bookings:[],
  isLoadingBookings:false,
  errorBookings:null,
  fetchBookings:async()=>{
    set({isLoadingBookings:true,errorBookings:null});
    try{
      const response=await bookingService.getAllBookings();
      const bookingsWithDateObjects=response.bookings.map(booking=>({
        ...booking,
        starttime:new Date(booking.starttime),
        endtime:new Date(booking.endtime)
      }));
      set({bookings:bookingsWithDateObjects,isLoadingBookings:false})
    }catch(err:any){
      set({errorBookings: err.message,isLoadingBookings:false});
      toast.error(`Failed to fetch booking: ${err.message}`);
    }
  },

  addBooking:async(bookingData)=>{
    try{
      await bookingService.bookRoom(bookingData);
      await get().fetchBookings();
      return true
    }catch(err:any){
      toast.error(`Booking failed: ${err.message}`);
      return false;
    }
  },

  updateBooking: async(bookingid,bookingData)=>{
    try{
      await bookingService.updateBooking(bookingid,bookingData);
      await get().fetchBookings();
      return true;
    }catch(err:any){
      toast.error(`Failed to update booking: ${err.message}`);
      return false;
    }
  },

  cancelBooking: async(bookingid,userid)=>{
    try{
      await bookingService.cancelBooking(bookingid,userid);
      await get().fetchBookings();
      toast.success("Booking cancelled successfully");
      return true;
    }catch(err:any){
      toast.error(`Failed to cancel booking: ${err.message}`);
      return false;
    }
  }
}));