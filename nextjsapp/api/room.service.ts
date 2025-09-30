import api from '../config/axios.config';

export interface Room {
    roomid: number;
    roomname: string;
    roomlocation: string;
    capacity: number;
    equipment: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface RoomsResponse {
    success: boolean;
    message: string;
    rooms: Room[];
}

export interface RoomResponse {
    success: boolean;
    message: string;
    room: Room;
}

export interface DeleteRoomResponse{
    success:boolean;
    message:string;
    deletedRoom:Room;
    deletedAt?:string;
    updatedAt?:string;
}

export interface RegisterRoomResponse{
    success:boolean;
    message:string;
    data:{
        room:Room;
    }
}

export interface UpdateRoomResponse{
    success:boolean;
    message:string;
    updatedData:{
        room:Room;
    }
}

export interface UpdateRoomData{
    roomname:string;
    roomlocation:string;
    capacity:number;
    equipment:string[];
}

export interface ApiError {
    success: false;
    message: string;
    error: string[] | string;
}


class RoomService {

    async registerRoom(Information:Room):Promise<RegisterRoomResponse>{
        try{
            const response=await api.post<RegisterRoomResponse>('/rooms/v1/room',Information);
            return response.data;
        }catch(err:any){
            console.error("Post rooms service error",err);
            throw this.handleApiError(err);
        }
    }

    async getAllRooms(): Promise<RoomsResponse> {
        try {
            const response = await api.get<RoomsResponse>('/rooms/v1/rooms',{withCredentials:true});
            return response.data;
        } catch (err: any) {
            console.error("Get rooms service error:", err);
            throw this.handleApiError(err);
        }
    }

    async getRoomById(roomid: number): Promise<RoomResponse> {
        try {
            const response = await api.get<RoomResponse>(`/rooms/v1/${roomid}`);
            return response.data;
        } catch (err: any) {
            console.error("Get room by ID service error:", err);
            throw this.handleApiError(err);
        }
    }

    async updateRoom(roomid:number,updatedData:UpdateRoomData):Promise<UpdateRoomResponse>{
        try{
            const response=await api.put<UpdateRoomResponse>(`/rooms/v1/${roomid}`,updatedData);
            return response.data;
        }catch(err:any){
            console.error('Error updating room:',err);
            throw this.handleApiError(err);
        }
    }

    async deleteRoom(roomid:number):Promise<DeleteRoomResponse>{
        try{
            const response=await api.delete<DeleteRoomResponse>(`/rooms/v1/${roomid}`);
            return response.data;
        }catch(err:any){
            console.error("Delete Room service error",err);
            throw this.handleApiError(err);
        }
    }

    private handleApiError(err: any): Error {
        if (err.response?.data) {
            const apiError: ApiError = err.response.data;
            const errorMessage = Array.isArray(apiError.error)
                ? apiError.error.join(', ')
                : apiError.error || apiError.message;
            return new Error(errorMessage);
        }

        if (err.request) {
            return new Error('Network error - please check the connection');
        }

        return new Error(err.message || 'An unexpected error occurred');
    }
}

export const roomService = new RoomService();
