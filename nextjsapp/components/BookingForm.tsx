"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingSchema, type BookingFormData } from "../validator/bookingvalidator";
import { roomService } from "../api/room.service";
import { userService } from "../api/user.service";
import { bookingService, type CreateBookingRequest } from "../api/booking.service";
import { useBookingStore } from "@/stores/bookingStore";
import { useBookingModalStore } from "@/stores/modalStore";
import toast from "react-hot-toast";
import { X } from "lucide-react";

interface AttendeeOption {
    userid: number;
    name: string;
    email?: string;
}

const BookingForm = () => {
  const queryClient = useQueryClient();
  const { activeDraft, setActiveDraft, addDraftBooking } = useBookingStore();
  const { closeModal } = useBookingModalStore();
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [showAttendeeDropdown, setShowAttendeeDropdown] = useState(false);
  const attendeeInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    getValues,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    // Correctly set default values from the active draft
    defaultValues: {
      title: activeDraft?.title || "",
      description: activeDraft?.description || "",
      date: activeDraft?.date || "",
      starttime: activeDraft?.starttime || "",
      endtime: activeDraft?.endtime || "",
      roomid: activeDraft?.roomid || undefined,
      attendees: activeDraft?.attendees || [],
    },
  });

  const formAttendees = watch("attendees") || [];

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomService.getAllRooms().then(res => res.rooms),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(),
  });

  const bookRoomMutation = useMutation({
    mutationFn: (bookingData: CreateBookingRequest) => bookingService.bookRoom(bookingData),
    onSuccess: () => {
      toast.success("Room booked successfully!");
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setActiveDraft(null);
      closeModal();
      reset();
    },
    onError: (error: any) => {
      toast.error(`Failed to book room: ${error.message}`);
    },
  });
  
  // This effect now correctly saves the form data as a draft when the component unmounts
  useEffect(() => {
    return () => {
      const values = getValues();
      if (values.title || values.date || values.starttime || values.endtime || values.roomid) {
        addDraftBooking(values);
        toast.success("Booking saved as a draft!");
      }
      setActiveDraft(null);
    };
  }, [getValues, addDraftBooking, setActiveDraft]);


  const addAttendee = (attendee: AttendeeOption) => {
    if (!formAttendees.some(a => a.userid === attendee.userid)) {
      setValue("attendees", [...formAttendees, { userid: attendee.userid, name: attendee.name }]);
    }
    setAttendeeSearch("");
    setShowAttendeeDropdown(false);
  };

  const removeAttendee = (attendeeId: number) => {
    setValue("attendees", formAttendees.filter(a => a.userid !== attendeeId));
  };

  const onSubmit: SubmitHandler<BookingFormData> = (data) => {
    const startDateTime = new Date(`${data.date}T${data.starttime}`);
    const endDateTime = new Date(`${data.date}T${data.endtime}`);

    const bookingData: CreateBookingRequest = {
      title: data.title,
      description: data.description,
      starttime: startDateTime.toISOString(),
      endtime: endDateTime.toISOString(),
      roomid: data.roomid!,
      attendees: data.attendees,
    };
    bookRoomMutation.mutate(bookingData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          {activeDraft ? "Edit Booking Draft" : "New Booking"}
        </h2>
        <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Form fields from your bookroom page go here... */}
        <div className="flex gap-4 pt-4">
          <button type="button" onClick={closeModal} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg">
            Cancel
          </button>
          <button type="submit" disabled={bookRoomMutation.isPending} className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold">
            {bookRoomMutation.isPending ? "Booking..." : "Book Room"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;