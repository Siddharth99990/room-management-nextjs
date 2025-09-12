import {create}from 'zustand';
import { roomService,type Room ,type UpdateRoomData} from '@/api/room.service';
import toast from 'react-hot-toast';

interface RoomState{
    addRoom:(roomData:Omit<Room,'roomid'>)=>Promise<boolean>;
    updateRoom:(roomid:number,roomData:UpdateRoomData)=>Promise<boolean>;
    deleteRoom:(roomid:number)=>Promise<boolean>;
}

export const useRoomStore=create<RoomState>((set,get)=>({
    addRoom:async(roomData)=>{
        try{
            await roomService.registerRoom(roomData as Room);
            toast.success("Room registered successfully");
            return true;
        }catch(err:any){
            toast.error(`Failed to register room: ${err.message}`);
            return false;
        }
    },

    updateRoom:async(roomid,roomData)=>{
        try{
            await roomService.updateRoom(roomid,roomData);
            toast.success("Room updated successfully");
            return true;
        }catch(err:any){
            toast.error(`Failed to update room: ${err.message}`);
            return false;
        }
    },

    deleteRoom:async(roomid)=>{
        try{
            await roomService.deleteRoom(roomid);
            toast.success("Room deleted successfully");
            return true;
        }catch(err:any){
            toast.error(`Failed to delete room: ${err.message}`);
            return false;
        }
    }
}))