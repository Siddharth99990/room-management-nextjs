"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/api/user.service"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "@/api/user.service"
import toast from "react-hot-toast"
import EmployeeRowCard from "../EmployeeRowCard"

export const getEmployeeColumns = (
  onEdit: (userid: number) => void
): ColumnDef<User>[] => {

  const ActionCell = ({ row }: { row: any }) => {
    const queryClient = useQueryClient();
    const user = row.original as User;

    const deleteMutation = useMutation({
        mutationFn: () => userService.deleteUser(user.userid!),
        onSuccess: () => {
          toast.success(`User "${user.name}" deleted.`);
          queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
        onError: (err: any) => {
          toast.error(`Failed to delete user: ${err.message}`);
        }
      });

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onEdit(user.userid!)}>
            Edit User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${user.name}"?`)) {
                    deleteMutation.mutate();
                }
            }}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete User"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
  return [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Employee Details
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <EmployeeRowCard employee={row.original} />
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ActionCell,
    },
  ]
};