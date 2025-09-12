'use client';

import { useEffect,useRef } from "react";
import { useAuthStore } from "@/stores/authStore";

export function AuthInitializer(){
    const checkAuthStatus=useAuthStore((state)=>state.checkAuthStatus);
    const isInitialized=useRef(false);

    useEffect(()=>{
        if(!isInitialized.current){
            checkAuthStatus();
            isInitialized.current=true;
        }
    },[checkAuthStatus]);
    return null;
}