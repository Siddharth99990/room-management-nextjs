'use client'
import React, { useState} from "react";
import { Plus, Building2 } from "lucide-react";
import Link from "next/link";
import UpdateRoomModal from '../../components/UpdateRoom';
import ProtectedRoute from "@/context/ProtectedRoute";
import { DataTable } from "@/components/DataTable";
import { getRoomColumns } from "@/components/columns/RoomColumns";
import { useAuthStore } from "@/stores/authStore";
import { useRoomStore } from "@/stores/roomStore";
import { roomService } from "@/api/room.service";
import { useQueryClient ,useQuery,useMutation} from "@tanstack/react-query";

const RoomsPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient=useQueryClient();
  const {deleteRoom } = useRoomStore();
  
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [editRoomId, setEditRoomId] = useState<number | null>(null);

  const {data:rooms=[],isLoading:isLoadingRooms,error:roomsError}=useQuery({
    queryKey:['rooms'],
    queryFn:()=>roomService.getAllRooms().then(res=>res.rooms)
  });

  const deleteRoomMutation=useMutation({
    mutationFn:deleteRoom,
    onSuccess:()=>{
      queryClient.invalidateQueries({queryKey:['rooms']});
    },
  });

  const handleRoomUpdate = (roomid: number) => {
    setEditRoomId(roomid);
    setIsUpdateOpen(true);
  };

  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries({queryKey:['rooms']});
    setTimeout(() => {
      handleCloseUpdate();
    }, 1000);
  };

  const handleCloseUpdate = () => {
    setIsUpdateOpen(false);
    setEditRoomId(null);
  };

  const handleRoomDelete = (deletedRoomId: number) => {
    deleteRoom(deletedRoomId);
  };

  // Stats calculations
  const stats = React.useMemo(() => {
    const totalCapacity = rooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
    return {
      total: rooms.length,
      totalCapacity,
    };
  }, [rooms]);

  const roomColumns = getRoomColumns(handleRoomUpdate, handleRoomDelete, user?.role === 'admin');

  if (roomsError) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{(roomsError as Error).message}</p>
          {user?.role === 'admin' && (
            <Link
              href="/registerroom"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              Create the first room
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-800 dark:to-red-900 transition-all duration-500">
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
            
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Browse through
                    {user?.role === 'admin' && (
                      <>
                      <br/>
                      <span className="bg-gradient-to-br from-red-600 to-pink-600 bg-clip-text text-transparent">
                        &
                      </span>
                      </>
                    )}
                    <br/>
                    <span className="bg-gradient-to-br from-red-600 to-pink-600 bg-clip-text text-transparent">
                      {user?.role === 'admin' ? 'Manage Rooms' : 'Available Rooms'}
                    </span>
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {user?.role === 'admin' 
                      ? 'View, edit, and manage all rooms in the system' 
                      : 'Browse through rooms listed on the platform'}
                  </p>
                </div>
                {user?.role === 'admin' && (
                  <Link
                    href='/registerroom'
                    className='inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                  >
                    <Plus className='w-5 h-5 mr-2' />
                    Add Room
                  </Link>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-red-300 dark:border-red-700 hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <Building2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-white">Total Rooms</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Data Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:text-white p-4 dark:border-red-700 dark:border-2 border-2 border-red-300">
              <DataTable 
                columns={roomColumns}
                data={rooms}
                filterPlaceholder="Search rooms by name, location..."
                isLoading={isLoadingRooms}
                enableColumnVisibility={false}
                enableGlobalSearch={true}
                pageSize={10}
              />
            </div>
          </div>
        </div>
        
        {isUpdateOpen && editRoomId && (
          <UpdateRoomModal
            isOpen={isUpdateOpen}
            onClose={handleCloseUpdate}
            roomid={editRoomId}
            onUpdateSuccess={handleUpdateSuccess}
          />
        )}
      </>
    </ProtectedRoute>
  );
};

export default RoomsPage;
