import {create} from 'zustand'
import {persist} from 'zustand/middleware';
import { authService,User } from '@/api/auth.service';

interface AuthState{
    user:User|null;
    isAuthenticated:boolean;
    isLoading:boolean;
    error:string|null;
    hasTemporaryPassword:boolean;
    login:(email:string,password:string)=>Promise<{success:boolean;message?:string}>;
    logout:()=>Promise<void>;
    checkAuthStatus:()=>Promise<void>;
    changePassword:(email:string,newPassword:string,oldPassword:string)=>Promise<{success:boolean;message?:string}>
    clearError:()=>void;
};

export const useAuthStore=create(persist<AuthState>(((set,get)=>({
    user:null,
    isAuthenticated:false,
    isLoading:true,
    error:null,

    hasTemporaryPassword:false,

    checkAuthStatus:async()=>{
        try{
            set({isLoading:true});
            const response=await authService.checkAuth();
            if(response.success && response.data?.user){
                set({user:response.data.user,isAuthenticated:true,error:null,hasTemporaryPassword:response.data.user.isTemporaryPassword});
            }else{
                set({user:null,isAuthenticated:false});
            }
        }catch(err:any){
            set({user:null,isAuthenticated:false,hasTemporaryPassword:false});
        }finally{
            set({isLoading:false});
        }
    },

    login:async(email,password)=>{
        try{
            set({isLoading:true,error:null});
            const response=await authService.login({email,password});
            if(response.success && response.data?.user){
                set({user:response.data.user,isAuthenticated:true,isLoading:false,hasTemporaryPassword:response.data.user.isTemporaryPassword});
                return {
                    success:true,
                    message:response.message
                };
            }
            throw new Error(response.message||'Login failed');
        }catch(err:any){
            set({error:err.message,isAuthenticated:false,isLoading:false,user:null,hasTemporaryPassword:false});
            return{
                success:false,
                message:err.message
            };
        }
    },

    logout:async()=>{
        try{
            await authService.logout();
        }catch(err:any){
            console.error("Logout failed:",err);
        }finally{
            set({user:null,isAuthenticated:false,error:null});
        }
    },

    changePassword:async(email,newPassword,oldPassword)=>{
        try{
            set({isLoading:true,error:null});
            const response=await authService.changePassword({email,oldPassword,newPassword});

            if(response.success){
                set(state=>({
                    user:{...state.user!,isTemporaryPassword:false},
                    hasTemporaryPassword:false,
                    isLoading:false
                }));
                return {
                    success:true,
                    message:response.message
                };
            }
            throw new Error(response.message||"Failed to change password");
        }catch(err:any){
            set({error:err.message,isLoading:false});
            return{
                success:false,
                message:err.message
            }
        }
    },

    clearError:()=>{
        set({error:null})
    }
})),{name:"Auth"}));