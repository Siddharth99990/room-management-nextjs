'use client';
import React, { useState } from "react";
import { Wifi, Volume2, MapPin, Users, Monitor, Lightbulb, Snowflake, Video,RockingChair,LampDesk,Table, Trash2, Building2 } from 'lucide-react';
import { roomService, type Room } from "../api/room.service";
import { useAuth } from "../context/AuthContext";

interface RoomCardProps{
    room:Room;
    onDelete?:(roomid:number)=>void;
    onUpdate?:(roomid:number)=>void;
}

const getEquipmentIcon = (equipment: string) => {
    switch (equipment.toLowerCase()) {
        case 'wifi':
            return <Wifi className="w-3 h-3 mr-1" />;
        case 'projector':
            return <Monitor className="w-3 h-3 mr-1" />;
        case 'smart tv':
            return <Monitor className="w-3 h-3 mr-1" />;
        case 'sound system':
            return <Volume2 className="w-3 h-3 mr-1" />;
        case 'ac':
            return <Snowflake className="w-3 h-3 mr-1" />;
        case 'video conference':
            return <Video className="w-3 h-3 mr-1" />;
        case 'lighting':
            return <Lightbulb className="w-3 h-3 mr-1" />;
        case 'whiteboard':
            return <Monitor className="w-3 h-3 mr-1" />;
        case 'chair':
            return <RockingChair className="w-3 h-3 mr-1"/>;
        case 'desk':
            return <LampDesk className="w-3 h-3 mr-1"/>;
        case 'long table':
            return <Table className="w-3 h-3 mr-1"/>;
        default:
            return null;
    }
};

const RoomCard: React.FC<RoomCardProps> = ({ room,onDelete,onUpdate }) => {
    const [isDeleting,setIsDeleting]=useState(false);
    const [showConfirm,setShowConfirm]=useState(false);
    const {user}=useAuth();

    const handleDelete=async()=>{
        if(!room.roomid){
            console.error("No room to delete");
            return;
        }

        setIsDeleting(true);
        try{
            await roomService.deleteRoom(room.roomid);
            if(onDelete){
                onDelete(room.roomid);
            }
            console.log(`Room: ${room.roomname} deleted successfully`);
        }catch(err:any){
            console.error("Failed to delete room",err.message);
        }finally{
            setIsDeleting(false);
            setShowConfirm(false);
        }
    }

    const handleDeleteClick=()=>{
        setShowConfirm(true);
    }

    const handleCancel=()=>{
        setShowConfirm(false);
    }

    const handleUpdateClick=()=>{
        if(onUpdate && room.roomid){
            onUpdate(room.roomid);
        }
    }

    return (
        <div className='bg-white dark:bg-gray-800 backdrop-blur-xl rounded-xl shadow-lg border border-red-500 dark:border-red-900 p-6 transition-all duration-300 hover:scale-[1.02] flex flex-col h-full'>
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-white dark:text-gray-400 bg-red-500 dark:bg-gray-700 px-2 py-1 rounded transition-colors duration-300">
                            ID:{room.roomid}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1 transition-colors duration-300 mt-3">
                        <span className="flex items-center gap-2">
                            <Building2 className="w-6 h-6 mr-2 flex-shrink-0"/>
                            {room.roomname.charAt(0).toUpperCase()+room.roomname.slice(1)}
                        </span>
                    </h3>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-800 dark:text-white transition-colors duration-300">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{room.roomlocation}</span>
                </div>
                <div className="flex items-center text-gray-800 dark:text-white transition-colors duration-300">
                    <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">Capacity: {room.capacity} people</span>
                </div>
            </div>

            <div className="mb-6 flex-grow">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2 transition-colors duration-300">
                    Equipment ({room.equipment.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                    {room.equipment.map((equipment, index) => (
                        <span key={index}
                            className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-white text-xs rounded-md flex items-center transition-all duration-300 hover:bg-red-200 dark:hover:bg-red-800">
                            {getEquipmentIcon(equipment)}
                            {equipment}
                        </span>
                    ))}
                </div>
            </div>

            {(onDelete && onUpdate && user?.role==="admin" )&& (
                <div className="mt-auto">
                    {showConfirm?(
                        <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                                Delete {room.roomname}?
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-all duration-300 text-sm disabled:opacity-50"
                                >
                                    {isDeleting ? "Deleting..." : "Yes"}
                                </button>
                                <button 
                                    onClick={handleCancel}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all duration-300 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ):
                    (
                        <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button 
                                onClick={handleUpdateClick}
                                className="flex-1 bg-gradient-to-br from-red-600 to-pink-600 dark:from-red-700 dark:to-pink-700 text-white py-2 px-4 rounded-lg transition-all duration-300 hover:brightness-110 dark:hover:brightness-75">
                                Edit Room
                            </button>
                            <button 
                                onClick={handleDeleteClick}
                                className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-all duration-300"
                                title="Delete Room"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
            
        </div>
    );
};

export default RoomCard;