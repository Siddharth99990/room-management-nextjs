import api from "../config/axios.config";

export interface User{
    userid?:number;
    name:string;
    email:string;
    role:'admin'|'employee';
    isTemporaryPassword?:boolean;
    createdAt?:string;
    updatedAt?:string;
}

export interface userResponses{
    success:boolean;
    message:string;
    data:{
        user:User[];
    }
}

export interface UpdateUserData{
    name?:string;
    email?:string;
    role?:'admin'|'employee';
}

export interface updateUserResponse{
    success:boolean;
    message:string;
    data:{
        user:User;
    }
}

export interface ApiError{
    success:false;
    message:string;
    error:string[]|string;
}

export interface DeleteUserResponse{
    message:string;
    deletedUser:string;
}

class UserService{
    
    async registeruser(Information:User):Promise<userResponses>{
        try{
            const response=await api.post<userResponses>('/users/v1/user',Information);
            return response.data;
        }catch(err:any){
            console.error("User Registration error:",err);
            throw this.handleApiError(err);
        }
    }

    async getUsers():Promise<User[]>{
        try{
            const response=await api.get<User[]>('/users/v1/users');
            return response.data;
        }catch(err:any){
            console.error("Error getting users:",err);
            throw this.handleApiError(err);
        }
    }

    async updateUser(userid:number,updateData:UpdateUserData):Promise<updateUserResponse>{
        try{
            const response=await api.put<updateUserResponse>(`/users/v1/${userid}`,updateData);
            return response.data;
        }catch(err:any){
            console.error("Error updating user:",err);
            throw this.handleApiError(err);
        }
    }

    async deleteUser(userid:number):Promise<DeleteUserResponse>{
        try{
            const response=await api.delete<DeleteUserResponse>(`/users/v1/${userid}`);
            return response.data;
        }catch(err:any){
            console.error("Error deleting user:",err);
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
}

export const userService=new UserService();