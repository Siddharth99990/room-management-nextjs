"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Room } from "@/api/room.service";
import {
  ArrowUpDown,
  Edit,
  Trash2,
  Building2,
  Users,
  MapPin,
  Wifi,
  Monitor,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomService } from "@/api/room.service";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import React from "react";

// Capacity Badge Component
const CapacityBadge = ({ capacity }: { capacity: number }) => {
  const getCapacityStyles = (capacity: number) => {
    if (capacity <= 5) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    } else if (capacity <= 15) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    } else {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    }
  };

  const getCapacityLabel = (capacity: number) => {
    if (capacity <= 5) return "Small";
    if (capacity <= 15) return "Medium";
    return "Large";
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      getCapacityStyles(capacity)
    )}>
      <Users className="h-3 w-3 mr-1" />
      {capacity} ({getCapacityLabel(capacity)})
    </span>
  );
};

// Amenities Component
const Amenities = ({ amenities }: { amenities?: string[] }) => {
  if (!amenities || amenities.length === 0) {
    return (
      <span className="text-sm text-gray-500 dark:text-gray-400">
        No amenities listed
      </span>
    );
  }

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi') || lower.includes('internet')) {
      return <Wifi className="h-3 w-3" />;
    }
    if (lower.includes('projector') || lower.includes('screen') || lower.includes('display')) {
      return <Monitor className="h-3 w-3" />;
    }
    if (lower.includes('coffee') || lower.includes('refreshment')) {
      return <Coffee className="h-3 w-3" />;
    }
    return <Building2 className="h-3 w-3" />;
  };

  return (
    <div className="flex flex-wrap gap-1">
      {amenities.slice(0, 3).map((amenity, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        >
          {getAmenityIcon(amenity)}
          <span className="ml-1 truncate max-w-20">{amenity}</span>
        </span>
      ))}
      {amenities.length > 3 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          +{amenities.length - 3} more
        </span>
      )}
    </div>
  );
};

// Room Details Component
const RoomDetails = ({ room }: { room: Room }) => (
  <div className="flex items-center space-x-3 py-2">
    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg text-white font-semibold text-sm shadow-md">
      <Building2 className="h-6 w-6" />
    </div>
    <div className="min-w-0 flex-1 space-y-1">
      <p className="font-semibold text-gray-900 dark:text-white truncate">
        {room.roomname}
      </p>
      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
        <MapPin className="h-3 w-3 mr-1.5 flex-shrink-0" />
        <span className="truncate">{room.roomlocation || 'Location not specified'}</span>
      </div>
    </div>
  </div>
);

export const getRoomColumns = (
  onEdit: (roomid: number) => void,
  onDelete: (roomid: number) => void,
  isAdmin: boolean = false
): ColumnDef<Room>[] => {

  const ActionButtons = ({ row }: { row: any }) => {
    const queryClient = useQueryClient();
    const room = row.original as Room;
    const [confirming, setConfirming] = React.useState(false);

    const deleteMutation = useMutation({
      mutationFn: () => roomService.deleteRoom(room.roomid!),
      onSuccess: () => {
        toast.success(`Room "${room.roomname}" deleted successfully.`);
        queryClient.invalidateQueries({ queryKey: ['rooms'] });
      },
      onError: (err: any) => {
        toast.error(`Failed to delete room: ${err.message}`);
      }
    });

    if (confirming) {
      return (
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="h-8 px-3 text-red-900 bg-red-400 dark:text-red-300 dark:bg-red-500 hover:bg-red-600"
              >
                {deleteMutation.isPending ? "Deleting..." : "Confirm"}
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

    if (!isAdmin) {
      return (
        <p className="text-sm text-gray-500">View only</p>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(room.roomid!)}
          className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900 dark:hover:text-red-300"
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirming(true)}
          disabled={deleteMutation.isPending}
          className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900 dark:hover:text-red-300"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </div>
    );
  };

  const baseColumns: ColumnDef<Room>[] = [
    {
      accessorKey: "roomname",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold hover:bg-transparent -ml-1"
        >
          Room Details
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <RoomDetails room={row.original} />,
      size: 300,
    },
    {
      accessorKey: "capacity",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          Capacity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <CapacityBadge capacity={row.getValue("capacity")} />,
      sortingFn: "basic",
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          Location
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const location = row.getValue("location") as string;
        return (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            <span>{location || 'Not specified'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "amenities",
      header: "Amenities",
      cell: ({ row }) => <Amenities amenities={row.getValue("amenities")} />,
      enableSorting: false,
    },
  ];

  // Add actions column only for admins
  if (isAdmin) {
    baseColumns.push({
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ActionButtons,
      size: 200,
    });
  }

  return baseColumns;
};