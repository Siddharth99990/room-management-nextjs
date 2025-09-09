'use client'
import React,{useContext,createContext,useState,useEffect} from "react";
import { authService,type User } from "../api/auth.service";

interface AuthContextType{
    user:User|null;
    login:(email:string,password:string)=>Promise<{success:boolean,message?:string}>;
    logout:()=>Promise<void>;
    changePassword:(email:string,oldPassword:string,newPassword:string)=>Promise<{success:boolean,message?:string}>;
    isAuthenticated:boolean;
    isLoading:boolean;
    error:string|null;
    hasTemporaryPassword:boolean;
    clearError:()=>void;
}

const AuthContext=createContext<AuthContextType|undefined>(undefined);

export const AuthProvider:React.FC<{children:React.ReactNode}>=({children})=>{
    const [user,setUser]=useState<User|null>(null);
    const [isLoading,setIsLoading]=useState(true);
    const [error,setError]=useState<string|null>(null);

    const hasTemporaryPassword=user?.isTemporaryPassword||false;

    useEffect(()=>{
        checkAuthStatus();
    },[]);

    const checkAuthStatus=async()=>{
        try{
            setIsLoading(true);

            const response=await authService.checkAuth();
            if(response.success && response.data?.user){
                setUser(response.data.user);
            }
        }catch(err:any){
            console.error("Auth check failed:",err);
            setUser(null);
        }finally{
            setIsLoading(false);
        }
    }

    const login=async(email:string,password:string):Promise<{success:boolean; message?:string}>=>{
        try{
            setIsLoading(true);
            setError(null);

            const response=await authService.login({email,password});

            if(response.success && response.data?.user){
                setUser(response.data.user);
                return {
                    success:true,
                    message:response.message
                }
            }

            return {success:false,message:response.message||"Login failed"};
        }catch(err:any){
            console.error("Login error:",err);
            setError(err.message||'An unexpected error occurred');
            return {success:false,message:err.message};
        }finally{
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await authService.logout();
        } catch (err: any) {
            console.error("Logout error:", err);
        } finally {
            setUser(null);
            setIsLoading(false);
        }
    };

    const changePassword=async (email:string,oldPassword:string,newPassword:string):Promise<{success:boolean,message?:string}>=>{
        try{
            setIsLoading(true);
            setError('');
            const response=await authService.changePassword({email,oldPassword,newPassword});

            if(response.success){
                setUser({...response.data.user,isTemporaryPassword:false});
                return{
                    success:true,
                    message:response.message
                };
            }

            return {success:false,message:response.message||"Change password failed"};
        }catch(err:any){
            console.error("Change password error:",err);
            setError(err.message||"An unexpected error occurred");
            return{success:false,message:err.message};
        }finally{
            setIsLoading(false);
        }
    }

    const clearError=()=>{
        setError(null);
    }

    const value={
        user,
        login,
        logout,
        changePassword,
        isAuthenticated:!!user,
        isLoading,
        error,
        clearError,
        hasTemporaryPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth=()=>{
    const context=useContext(AuthContext);
    if(context===undefined){
        throw new Error("useAuth must be user within an AuthProvider");
    }
    return context;
};