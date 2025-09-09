'use client'
import React, { useEffect, useState } from "react";
import RoomCard from "../../components/RoomCard";
import { roomService, type Room } from "../../api/room.service";
import { Building2, Cog, Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import UpdateRoomModal from '../../components/UpdateRoom';
import ProtectedRoute from "@/context/ProtectedRoute";

const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [editRoomId, setEditRoomId] = useState<number | null>(null);
  const { user } = useAuth();

  const features = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Browse Rooms",
      description: "Freely browse through listed rooms on the platform"
    },
    ...(user?.role === 'admin' ? [{
      icon: <Cog className='w-6 h-6' />,
      title: "Manage Roooms",
      description: 'Maintain rooms,delete,update or change rooms as needed'
    }] : [])
  ];

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomService.getAllRooms();
        setRooms(response.rooms);
      } catch (err: any) {
        setError(err.message || 'failed to load rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleRoomUpdate = (roomid: number) => {
    setEditRoomId(roomid);
    setIsUpdateOpen(true);
  };

  const handleUpdateSuccess = (updatedRoom: Room) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.roomid === updatedRoom.roomid ? updatedRoom : room
      )
    );
  };

  const handleCloseUpdate = () => {
    setIsUpdateOpen(false);
    setEditRoomId(null);
  };

  const handleRoomDelete = (deletedRoomId: number) => {
    setRooms(prevRooms =>
      prevRooms.filter(room => room.roomid !== deletedRoomId)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-red-500 dark:text-red-500 animate-spin rounded-full"></div>
      </div>
    );
  }

 if (error) {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex flex-col items-center space-y-4">
        <p className="text-red-500">{error}</p>
        {user?.role === 'admin' && (
          <Link
            href="/registerroom"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Create a room now
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
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-14">
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6 mt-20">
                {user?.role === 'admin' ? (
                  <>
                  <Link 
                    href='/registerroom'
                    className='inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-md hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                  >
                    <Plus className='w-5 h-5 mr-2'/>
                    Register a new room
                  </Link>  
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">
                    Browse through
                    <span className="block bg-gradient-to-r from-red-600 to-gray-600 bg-clip-text text-transparent">
                      &
                    </span>
                    <span className="block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      Edit Rooms
                    </span>
                  </h1>
                  </>
                ) : (
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">
                    Browse through
                    <span className="block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      Listed Rooms
                    </span>
                  </h1>
                )}
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Browse through rooms listed on the platform and find the perfect space for your meetings
                </p>

                <div className="space-y-4 sm:space-y-6">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rooms.map((room) => (
                  <RoomCard 
                    key={room.roomid} 
                    room={room} 
                    onDelete={handleRoomDelete}
                    onUpdate={handleRoomUpdate}
                  />
                ))}
              </div>
            </div>
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