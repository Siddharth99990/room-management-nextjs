import {create} from 'zustand';
import { userService,type User,type UpdateUserData } from '@/api/user.service';
import toast from 'react-hot-toast';

interface EmployeeState{
    addEmployee:(userData:Omit<User,'userid'>)=>Promise<boolean>;
    updateEmployee:(userid:number,updateData:UpdateUserData)=>Promise<boolean>;
    deleteEmployee:(userid:number)=>Promise<boolean>;
}

export const useEmployeeStore= create<EmployeeState>((set,get)=>({

    addEmployee:async(userData)=>{
        try{
            await userService.registeruser(userData as User);
            toast.success("Employee registered successfully");
            return true;
        }catch(err:any){
            toast.error(`Failed to register employee: ${err.message}`);
            return false;
        }
    },

    updateEmployee: async (userid, userData) => {
        try {
            await userService.updateUser(userid, userData);
            toast.success("Employee updated successfully");
            return true;
        } catch (err: any) {
            toast.error(`Failed to update employee: ${err.message}`);
            return false;
        }
    },
    
    deleteEmployee: async (userid) => {
        try {
            await userService.deleteUser(userid);
            toast.success("Employee deleted successfully");
            return true;
        } catch (err: any) {
            toast.error(`Failed to delete employee: ${err.message}`);
            return false;
        }
    }
}))