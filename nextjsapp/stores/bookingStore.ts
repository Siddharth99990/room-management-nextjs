import {create} from 'zustand';
import { bookingService, type Booking, type CreateBookingRequest, type UpdateBookingRequest} from '@/api/booking.service';
import toast from 'react-hot-toast';

interface BookingState{
  addBooking:(bookingData:CreateBookingRequest)=>Promise<boolean>;
  updateBooking:(bookingid:number,bookingData:UpdateBookingRequest)=>Promise<boolean>;
  cancelBooking:(bookingid:number,userid:number)=>Promise<boolean>;    
};

export const useBookingStore=create<BookingState>((set,get)=>({
  addBooking:async(bookingData)=>{
    try{
      await bookingService.bookRoom(bookingData);
      return true
    }catch(err:any){
      toast.error(`Booking failed: ${err.message}`);
      return false;
    }
  },

  updateBooking: async(bookingid,bookingData)=>{
    try{
      await bookingService.updateBooking(bookingid,bookingData);
      return true;
    }catch(err:any){
      toast.error(`Failed to update booking: ${err.message}`);
      return false;
    }
  },

  cancelBooking: async(bookingid,userid)=>{
    try{
      await bookingService.cancelBooking(bookingid,userid);
      toast.success("Booking cancelled successfully");
      return true;
    }catch(err:any){
      toast.error(`Failed to cancel booking: ${err.message}`);
      return false;
    }
  }
}));