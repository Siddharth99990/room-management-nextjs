import api from '../config/axios.config';

export interface Booking{
    title: string;
    description?: string;
    bookingid: number;
    starttime: Date; 
    endtime: Date ;
    roomid: {
        roomid: number;
        roomname: string;
        roomlocation: string;
        capacity: number;
    };
    createdBy: {
        userid: number;
        name: string;
    };
    status: 'confirmed' | 'cancelled';
    attendees: {
        userid: number;
        name: string;
    }[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateBookingRequest {
    title: string;
    description?: string;
    starttime: string; 
    endtime: string;   
    roomid: number;
    attendees?: {
        userid: number;
        name: string;
    }[];
}

export interface BookRoomResponse {
    success: boolean;
    message: string;
    data: {
        createdBy: {
            userid: number;
            name: string;
        };
        title: string;
        description: string;
        bookingid: number;
        starttime: string;
        endtime: string;
        roomid: {
            roomid: number;
            roomname: string;
            roomlocation: string;
            capacity: number;
        };
        status: 'confirmed' | 'cancelled';
        attendees: {
            userid: number;
            name: string;
        }[];
        createdAt: string;
        updatedAt?: string;
    };
}

export interface ApiError {
    success: false;
    message: string;
    error?: string;
    errors?: string[];
}

export interface BookingsResponse {
    success: boolean;
    message: string;
    bookings: Booking[];
    pagination?: {
        currentpage: number;
        totalpages: number;
        totalBookings: number;
    };
}

export interface AvailableRoomsResponse {
    success: boolean;
    message: string;
    data: {
        roomid: number;
        roomname: string;
        roomlocation: string;
        capacity: number;
        equipment: string[];
    }[];
}

export interface DeleteBookingResponse{
    success:boolean;
    message:string;
    data:{
        booking:Booking;
    }
}

export interface UpdateBookingRequest {
    title?: string;
    description?: string;
    starttime?: string;
    endtime?: string;
    status?: 'confirmed' | 'cancelled';
    attendees?: {
        userid: number;
        name: string;
    }[];
}

class BookingService {
    async bookRoom(bookingData: CreateBookingRequest): Promise<BookRoomResponse> {
        try {
            const response = await api.post<BookRoomResponse>('/booking/v1/booking', bookingData);
            return response.data;
        } catch (err: any) {
            console.error("Book room service error", err);
            throw this.handleApiError(err);
        }
    }

    async getAllBookings(params?: {
        roomid?: number;
        createdBy?: number;
        status?: 'confirmed' | 'cancelled';
        date?: string;
        starttime?: string;
        endtime?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<BookingsResponse> {
        try {
            const queryParams = new URLSearchParams();
            
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParams.append(key, value.toString());
                    }
                });
            }

            const url = `/booking/v1/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await api.get<BookingsResponse>(url);
            return response.data;
        } catch (err: any) {
            console.error("Get Bookings service error:", err);
            throw this.handleApiError(err);
        }
    }

    async cancelBooking(bookingid: number, userid: number): Promise<DeleteBookingResponse> {
        try {
            const response = await api.delete<DeleteBookingResponse>(`/booking/v1/${bookingid}`, {
                data: { userid }
            });
            return response.data;
        } catch (err: any) {
            console.error("Cancel booking service error:", err);
            throw this.handleApiError(err);
        }
    }

    async getBookingById(bookingid: number): Promise<{ success: boolean; message: string; booking: Booking }> {
        try {
            const response = await api.get(`/booking/v1/${bookingid}`);
            return response.data;
        } catch (err: any) {
            console.error("Get booking by ID service error:", err);
            throw this.handleApiError(err);
        }
    }

    async updateBooking(bookingid: number, updateData: UpdateBookingRequest): Promise<{ success: boolean; message: string; data: Booking }> {
        try {
            const response = await api.put(`/booking/v1/${bookingid}`, updateData);
            return response.data;
        } catch (err: any) {
            console.error("Update booking service error:", err);
            throw this.handleApiError(err);
        }
    }

    async getAvailableRooms(starttime: string, endtime: string): Promise<AvailableRoomsResponse> {
        try {
            const response = await api.get<AvailableRoomsResponse>(`/booking/v1/availablerooms?starttime=${encodeURIComponent(starttime)}&endtime=${encodeURIComponent(endtime)}`);
            return response.data;
        } catch (err: any) {
            console.error("Get available rooms service error:", err);
            throw this.handleApiError(err);
        }
    }

    private handleApiError(err: any): Error {
        if (err.response?.data) {
            const apiError: ApiError = err.response.data;
            let errorMessage = apiError.message || 'An error occurred';
            
            if (apiError.errors && Array.isArray(apiError.errors)) {
                errorMessage = apiError.errors.join(', ');
            } else if (apiError.error) {
                errorMessage = typeof apiError.error === 'string' ? apiError.error : apiError.error;
            }
            
            return new Error(errorMessage);
        }

        if (err.request) {
            return new Error('Network error - please check the connection');
        }

        return new Error(err.message || 'An unexpected error occurred');
    }
}

export const bookingService = new BookingService();