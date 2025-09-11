"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/api/user.service";
import { 
  ArrowUpDown, 
  Mail, 
  Shield,
  User as UserIcon,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/api/user.service";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import React from "react";
import { useAuthStore } from "@/stores/authStore";


// Role Badge Component
const RoleBadge = ({ role }: { role: string }) => {
  const getRoleStyles = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'employee':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Shield className="h-3 w-3 mr-1" />;
      case 'manager':
        return <UserIcon className="h-3 w-3 mr-1" />;
      default:
        return <UserIcon className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
      getRoleStyles(role)
    )}>
      {getRoleIcon(role)}
      {role}
    </span>
  );
};

// Employee Card Component (Enhanced)
const EmployeeCard = ({ employee }: { employee: User }) => {
  const initials = employee.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center space-x-3 py-2">
      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full text-white font-semibold text-sm shadow-md">
        {initials}
      </div>
      
      {/* Employee Info */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center space-x-2">
          <p className="font-semibold text-gray-900 dark:text-white truncate text-md">
            {employee.name.charAt(0).toUpperCase()+employee.name.slice(1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export const getEmployeeColumns = (
  onEdit: (userid: number) => void,
  currentUserId:number|null
): ColumnDef<User>[] => {

  const ActionButtons = ({ row }: { row: any }) => {
    const queryClient = useQueryClient();
    const user = row.original as User;
    const { user: currentUser } = useAuthStore();


    const deleteMutation = useMutation({
      mutationFn: () => userService.deleteUser(user.userid!),
      onSuccess: () => {
        toast.success(`User "${user.name}" deleted successfully.`);
        queryClient.invalidateQueries({ queryKey: ['employees'] });
      },
      onError: (err: any) => {
        toast.error(`Failed to delete employee: ${err.message}`);
      }
    });

    const [confirming,setConfirming]=React.useState(false);
    const isSelf=user.userid===currentUserId;


    if(confirming){
      return(
        <div className="flex items-center gap-2">
          {
            !isSelf ?(
              <>
              <Button
                variant="destructive"
                size='sm'
                onClick={()=>deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="h-8 px-3 text-red-900 bg-red-400 dark:text-red-300 dark:bg-red-500 hover:bg-red-600"
                >{deleteMutation.isPending?"Deleting...":"Confirm"}</Button>
              <Button 
                variant="outline"
                size='sm'
                onClick={()=>setConfirming(false)}
                className="h-8 px-3"
              >
                Cancel
              </Button>
            </>
            ):
            ([])
          }
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(user.userid!)}
          className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900 dark:hover:text-red-300"
        >
          {
            !isSelf?(
              <>
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </>
            ):(
              <span className="flex items-center justify-center w-32">
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </span>
            )
          }
        </Button>
        
        {!isSelf?(
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
              setConfirming(true)
              }}
              disabled={deleteMutation.isPending}
              className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900 dark:hover:text-red-300"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </>
        ):[]}
      </div>
    );
  };

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold hover:bg-transparent -ml-1"
        >
          Employee Details
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <EmployeeCard employee={row.original} />,
      size: 400,
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
    },
    {
      accessorKey: "email",
      header: "Contact",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="space-y-1">
            {user.email && (
              <div className="flex items-center text-sm text-gray-900 dark:text-white">
                <Mail className="h-3 w-3 mr-1.5 text-gray-500 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ActionButtons,
      size: 200,
    },
  ];
};