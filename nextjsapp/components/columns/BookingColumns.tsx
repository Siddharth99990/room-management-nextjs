"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Booking } from "@/api/booking.service";
import {
  MoreHorizontal,
  ArrowUpDown,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Building2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/api/booking.service";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import React from "react";
import { useAuthStore } from "@/stores/authStore";
import { useBookingStore } from "@/stores/bookingStore";

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
      getStatusStyles(status)
    )}>
      {status}
    </span>
  );
};

// Booking Details Component
const BookingDetails = ({ booking }: { booking: Booking }) => (
  <div className="flex items-center space-x-3 py-2">
    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg text-white font-semibold text-sm shadow-md">
      <Calendar className="h-6 w-6" />
    </div>
    <div className="min-w-0 flex-1 space-y-1">
      <p className="font-semibold text-gray-900 dark:text-white truncate">
        {booking.title}
      </p>
      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
        <Building2 className="h-3 w-3 mr-1.5 flex-shrink-0" />
        <span className="truncate">{booking.roomid.roomname}</span>
      </div>
    </div>
  </div>
);

export const getBookingColumns = (
  onEdit: (bookingid: number) => void,
): ColumnDef<Booking>[] => {

  const ActionButtons = ({ row }: { row: any }) => {
    const { user } = useAuthStore();
    const {cancelBooking}=useBookingStore();
    const booking = row.original as Booking;
    const [confirming, setConfirming] = React.useState(false);
    const [isCancelling,setIsCancelling]=React.useState(false);

    const handleCancel=async()=>{
      if(!user)return;
      setIsCancelling(true);
      await cancelBooking(booking.bookingid,user.userid);
      setIsCancelling(false);
      setConfirming(false);
    }

    const canModify = user?.userid === booking.createdBy.userid;
    const isPastBooking = new Date(booking.endtime) < new Date();

    if (confirming) {
      return (
        <div className="flex items-center gap-2">
          {canModify && !isPastBooking ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                disabled={isCancelling}
                className="h-8 px-3 text-red-900 bg-red-400 dark:text-red-300 dark:bg-red-500 hover:bg-red-600"
              >
                {isCancelling ? "Cancelling..." : "Confirm"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirming(false)}
                className="h-8 px-3"
              >
                Cancel
              </Button>
            </>
          ) : null}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {canModify && !isPastBooking ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(booking.bookingid)}
            className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900 dark:hover:text-red-300"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        ) : null}

        {!canModify ? (
          <p className="text-sm text-gray-500">You cannot edit this booking</p>
        ) : null}

        {canModify && booking.status === 'confirmed' && !isPastBooking ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirming(true)}
            className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900 dark:hover:text-red-300"
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        ) : null}

        {canModify && isPastBooking ? (
          <p className="text-sm text-gray-500">This booking is in the past</p>
        ) : null}
      </div>
    );
  };

  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold hover:bg-transparent -ml-1"
        >
          Booking Details
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <BookingDetails booking={row.original} />,
      size: 300,
    },
    {
      accessorKey: "createdBy.name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          Host
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-gray-500" />
          <span>{row.original.createdBy.name}</span>
        </div>
      ),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "starttime",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          Schedule
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const booking = row.original;
        const startTime = new Date(booking.starttime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(booking.endtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const startDate = new Date(booking.starttime).toLocaleDateString([], { day: '2-digit', month: 'short' });
        return (
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-900 dark:text-white">
              <Calendar className="h-3 w-3 mr-1.5 text-gray-500 flex-shrink-0" />
              <span>{startDate}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-3 w-3 mr-1.5 flex-shrink-0" />
              <span>{startTime} - {endTime}</span>
            </div>
          </div>
        );
      },
      accessorFn: (row) => new Date(row.starttime).getTime(),
      sortingFn: "basic",
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ActionButtons,
      size: 200,
    },
  ];
};
