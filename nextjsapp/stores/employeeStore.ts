import {create} from 'zustand';
import { userService,type User,type UpdateUserData } from '@/api/user.service';
import toast from 'react-hot-toast';

interface EmployeeState{
    employees:User[];
    isLoadingEmployees:boolean;
    errorEmployees:string|null;
    getEmployees:()=>Promise<void>;
    addEmployee:(userData:Omit<User,'userid'>)=>Promise<boolean>;
    updateEmployee:(userid:number,updateData:UpdateUserData)=>Promise<boolean>;
    deleteEmployee:(userid:number)=>Promise<boolean>;
}

export const useEmployeeStore= create<EmployeeState>((set,get)=>({
    employees:[],
    isLoadingEmployees:false,
    errorEmployees:null,
    getEmployees:async()=>{
        set({isLoadingEmployees:true,errorEmployees:null});
        try{
            const employees=await userService.getUsers();
            set({employees,isLoadingEmployees:false});
        }catch(err:any){
            set({errorEmployees:err.message,isLoadingEmployees:false});
            toast.error(`Failed to get employees: ${err.message}`);
        }
    },

    addEmployee:async(userData)=>{
        try{
            await userService.registeruser(userData as User);
            await get().getEmployees();
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
            await get().getEmployees();
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
            set((state) => ({
                employees: state.employees.filter((e) => e.userid !== userid),
            }));
            toast.success("Employee deleted successfully");
            return true;
        } catch (err: any) {
            toast.error(`Failed to delete employee: ${err.message}`);
            return false;
        }
    }
}))