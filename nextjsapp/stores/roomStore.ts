import {create}from 'zustand';
import { roomService,type Room ,type UpdateRoomData} from '@/api/room.service';
import toast from 'react-hot-toast';

interface RoomState{
    rooms:Room[];
    isLoadingRooms:boolean;
    errorRooms:boolean|null;
    getRooms:()=>Promise<void>;
    addRoom:(roomData:Omit<Room,'roomid'>)=>Promise<boolean>;
    updateRoom:(roomid:number,roomData:UpdateRoomData)=>Promise<boolean>;
    deleteRoom:(roomid:number)=>Promise<boolean>;
}

export const useRoomStore=create<RoomState>((set,get)=>({
    rooms:[],
    isLoadingRooms:false,
    errorRooms:null,
    getRooms:async()=>{
        set({isLoadingRooms:true,errorRooms:null});
        try{
            const response=await roomService.getAllRooms();
            set({rooms:response.rooms,isLoadingRooms:false});
        }catch(err:any){
            set({errorRooms:err.message,isLoadingRooms:false});
            toast.error(`Failed to get rooms: ${err.message}`);
        }
    },

    addRoom:async(roomData)=>{
        try{
            await roomService.registerRoom(roomData as Room);
            await get().getRooms();
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
            await get().getRooms();
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
            set((state)=>({rooms:state.rooms.filter((r)=>r.roomid !==roomid),}));
            toast.success("Room deleted successfully");
            return true;
        }catch(err:any){
            toast.error(`Failed to delete room: ${err.message}`);
            return false;
        }
    }
}))