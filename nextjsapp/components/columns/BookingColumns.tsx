"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Booking } from "@/api/booking.service"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { bookingService } from "@/api/booking.service"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"

export const getBookingColumns = (
  onEdit: (bookingid: number) => void,
): ColumnDef<Booking>[] => {
  
  const ActionCell = ({ row }: { row: any }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const booking = row.original as Booking;

    const cancelMutation = useMutation({
      mutationFn: () => bookingService.cancelBooking(booking.bookingid, user!.userid!),
      onSuccess: () => {
        toast.success(`Booking "${booking.title}" cancelled.`);
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
      },
      onError: (err: any) => {
        toast.error(`Failed to cancel booking: ${err.message}`);
      }
    });

    const canModify = user?.userid === booking.createdBy.userid;
    const isPastBooking = new Date(booking.endtime) < new Date();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {canModify && !isPastBooking && (
            <DropdownMenuItem onClick={() => onEdit(booking.bookingid)}>
              Edit Booking
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {canModify && booking.status === 'confirmed' && !isPastBooking && (
            <DropdownMenuItem 
              onClick={() => {
                if (window.confirm(`Are you sure you want to cancel "${booking.title}"?`)) {
                    cancelMutation.mutate();
                }
              }}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900"
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Booking"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return [
    {
      accessorKey: "bookingid",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
        accessorKey: "roomid.roomname",
        header: "Room",
    },
    {
      accessorKey: "createdBy.name",
      header: "Host",
    },
    {
      accessorKey: "starttime",
      header: "Start Time",
      cell: ({ row }) => new Date(row.getValue("starttime")).toLocaleString(),
    },
    {
      accessorKey: "endtime",
      header: "End Time",
      cell: ({ row }) => new Date(row.getValue("endtime")).toLocaleString(),
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      id: "actions",
      cell: ActionCell,
    },
  ]
};