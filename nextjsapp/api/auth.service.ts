import api from '../config/axios.config';

export interface LoginCredentials{
    email:string;
    password:string;
}

export interface User{
    userid:number;
    name:string;
    email:string;
    role:'admin'|'employee';
    isTemporaryPassword?:boolean;
    createdAt?:string;
    updatedAt?:string;
}

export interface LoginResponse{
    success:boolean;
    message:string;
    data:{
        user:User;
    }
}

export interface CheckAuthResponse{
    success: boolean;
    message?: string;
    data?: {
        user: User;
    };
}

export interface LogoutResponse{
    success: boolean;
    message: string;
}

export interface ChangePassword{
    email:string,
    oldPassword:string,
    newPassword:string
}

export interface ApiError{
    success:false;
    message:string;
    error:string[]|string;
}

class AuthService{
    async login(credentials:LoginCredentials):Promise<LoginResponse>{
        try{
            const response=await api.post<LoginResponse>('/auth/v1/login',credentials);
            return response.data;
        }catch(err:any){
            console.error("Login service error:",err);
            throw this.handleApiError(err);
        }
    }

    async logout():Promise<LogoutResponse>{
        try{
            const response=await api.post<LogoutResponse>('/auth/v1/logout');
            return response.data;
        }catch(err:any){
            console.error("Logout service error:",err);
            throw this.handleApiError(err);
        }
    }

    private handleApiError(err:any):Error{
        if(err.response?.data){
            const apiError:ApiError=err.response.data;
            const errorMessage=Array.isArray(apiError.error)
            ? apiError.error.join(', ')
            :apiError.error||apiError.message;
            return new Error(errorMessage);
        }

        if(err.request){
            return new Error('Network error- please check the connection');
        }

        return new Error(err.message||'An unexpected error occurred');
    }

    async checkAuth():Promise<CheckAuthResponse>{
        try{
            const response=await api.get<CheckAuthResponse>('/auth/v1/check');
            return response.data;
        }catch(err:any){
            console.error("Auth check service error:",err);
            throw this.handleApiError(err);
        }
    }

    async changePassword(credentials:ChangePassword):Promise<LoginResponse>{
        try{
            const response=await api.put<LoginResponse>('/auth/v1/changepassword',credentials);
            return response.data;
        }catch(err:any){
            console.error("Change password error:",err);
            throw this.handleApiError(err);
        }
    }
}

export const authService=new AuthService();