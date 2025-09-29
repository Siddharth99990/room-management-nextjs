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
  LampDesk,
  Lightbulb,
  RockingChair,
  Snowflake,
  Table,
  Video,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import React from "react";
import { useRoomStore } from "@/stores/roomStore";

// Capacity Badge Component
const CapacityBadge = ({ capacity }: { capacity: number }) => {
  const getCapacityStyles = (capacity: number) => {
    if (capacity <= 6) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    } else if (capacity <= 12) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    } else {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
  };

  const getCapacityLabel = (capacity: number) => {
    if (capacity <= 6) return "Small";
    if (capacity <= 12) return "Medium";
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

  const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();

    if (lower.includes('wifi') || lower.includes('internet')) {
        return <Wifi className="h-3 w-3 mr-1" />;
    }
    if (lower.includes('projector') || lower.includes('screen') || lower.includes('display')) {
        return <Monitor className="h-3 w-3 mr-1" />;
    }
    if (lower.includes('smart tv') || lower.includes('tv')) {
        return <Monitor className="h-3 w-3 mr-1" />;
    }
    if (lower.includes('sound system') || lower.includes('audio')) {
        return <Volume2 className="h-3 w-3 mr-1" />;
    }
    if (lower.includes('ac') || lower.includes('air conditioner')) {
        return <Snowflake className="h-3 w-3 mr-1" />;
    }
    if (lower.includes('video conference') || lower.includes('conference')) {
        return <Video className="h-3 w-3 mr-1" />;
    }
    if (lower.includes('lighting') || lower.includes('light')) {
        return <Lightbulb className="h-3 w-3 mr-1" />;
    }
    if (lower.includes('whiteboard') || lower.includes('board')) {
        return <Monitor className="h-3 w-3 mr-1" />;
    }
    if (lower.includes('chair')) {
        return <RockingChair className="h-3 w-3 mr-1" />;
    }
    if (lower.includes('desk')) {
        return <LampDesk className="h-3 w-3 mr-1" />;
    }
    if (lower.includes('long table') || lower.includes('table')) {
        return <Table className="h-3 w-3 mr-1" />;
    }
    return <Building2 className="h-3 w-3 mr-1" />;
};


  return (
    <div className="flex flex-wrap gap-1">
      {amenities.slice(0, 4).map((amenity, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-500 text-white dark:bg-red-900 dark:text-white"
        >
          {getAmenityIcon(amenity)}
          <span className="ml-1 truncate max-w-20">{amenity}</span>
        </span>
      ))}
      {amenities.length > 4 && (
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
    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-600 to-pink-600 dark:bg-gradient-to-br dark:from-red-900 dark:to-pink-900 rounded-lg text-white font-semibold text-sm shadow-md dark:text-red-500">
      <Building2 className="h-6 w-6" />
    </div>
    <div className="min-w-0 flex-1 space-y-1">
      <p className="font-semibold text-gray-900 dark:text-white truncate">
        {room.roomname.charAt(0).toUpperCase()+room.roomname.slice(1)}
      </p>
    </div>
  </div>
);

export const getRoomColumns = (
  onEdit: (roomid: number) => void,
  onDelete: (roomid: number) => void,
  isAdmin: boolean = false
): ColumnDef<Room>[] => {

  const ActionButtons = ({ row }: { row: any }) => {
    const room = row.original as Room;
    const { deleteRoom } = useRoomStore();
    const [confirming, setConfirming] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);


    const handleDelete = async () => {
        setIsDeleting(true);
        const success = await deleteRoom(room.roomid!);
        if (!success) {
            toast.error(`Failed to delete room: ${room.roomname}`);
        }
        setIsDeleting(false);
        setConfirming(false);
    }

    if (confirming) {
      return (
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 px-3 text-red-900 bg-red-400 dark:text-red-300 dark:bg-red-500 hover:bg-red-600"
              >
                {isDeleting ? "Deleting..." : "Confirm"}
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
          disabled={isDeleting}
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
      accessorKey: "roomlocation",
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
        const location = row.getValue("roomlocation") as string;
        return (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            <span>{location || 'Not specified'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "equipment",
      header: "Amenities",
      cell: ({ row }) => <Amenities amenities={row.getValue("equipment")} />,
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