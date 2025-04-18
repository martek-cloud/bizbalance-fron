import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import usersStore from "@/store/usersStore";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown, Pencil, Trash2, Plus, ShieldPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import roleStore from "@/store/roleStore";
import authStore from "@/store/authStore";

export default function Users() {
  const { hasPermission, fetchUserPermissions } = roleStore();
  const { user } = authStore();
  const navigate = useNavigate();
  const {
    users,
    roles,
    loading,
    roleLoading,
    fetchUsers,
    fetchRoles,
    deleteUser,
    updateUserRole,
  } = usersStore();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [display, setDisplay] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const [userToDelete, setUserToDelete] = useState(null);

  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    const initializePermissions = async () => {
      if (user?.role_id) {
        // Call fetchUserPermissions only once
        const permissions = await fetchUserPermissions(user.role_id);
      }
    };

    initializePermissions();
  }, [user]);

  // useEffect(() => {
  //   if (display <= 768) {
  //     setColumnVisibility({
  //       lastName: false,
  //       email: false,
  //       UserPhoto: false,
  //       status: false,
  //     });
  //   } else {
  //     setColumnVisibility({
  //       lastName: true,
  //       email: true,
  //       UserPhoto: true,
  //       status: true,
  //     });
  //   }

  //   const updateDisplay = () => {
  //     setDisplay(window.innerWidth);
  //   };

  //   window.addEventListener("resize", updateDisplay);
  //   return () => window.removeEventListener("resize", updateDisplay);
  // }, [display]);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      const success = await deleteUser(userToDelete.id);
      if (success) {
        setUserToDelete(null);
      }
    }
  };

  const columns = [
    {
      accessorKey: "UserPhoto",
      header: "User Photo",
      cell: ({ row }) => {
        const photoUrl = row.original.profile_picture
          ? `${import.meta.env.VITE_API_URL}/storage/${row.original.profile_picture}`
          : null;
        return (
          <div className="flex lg:ml-4">
            <Avatar>
              <AvatarImage
                src={photoUrl}
                alt={`${row.original.first_name} ${row.original.last_name}`}
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = ""; // Clear source on error to show fallback
                }}
              />
              <AvatarFallback>
                {row.original?.first_name?.charAt(0).toUpperCase()}
                {row.original?.last_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        );
      },
    },
    {
      accessorKey: "first_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="capitalize ml-4">{row.getValue("first_name")}</div>
      ),
    },
    {
      accessorKey: "last_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="capitalize lg:ml-4">{row.getValue("last_name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="lowercase lg:ml-4">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <Badge
            variant={row.original.status === "Active" ? "default" : "secondary"}
          >
            {row.original.status}
          </Badge>
        </div>
      ),
    },
    ...(user.role_type === "admin"
      ? [
          {
            accessorKey: "comptable_key",
            header: ({ column }) => (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                  }
                >
                  Accountant Key
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ),
            cell: ({ row }) => (
              <div className="text-center">
                {row.original.comptable_key ? row.original.comptable_key : "__"}
              </div>
            ),
          },
        ]
      : []),
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {hasPermission("users", "edit") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedUser(row.original);
                setSelectedUserId(row.original.id);
                setShowPermissionsDialog(true);
              }}
            >
              <ShieldPlus className="h-4 w-4" />
            </Button>
          )}
          {hasPermission("users", "edit") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/dashboard/users/${row.original.id}`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {hasPermission("users", "delete") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  if (loading && !users.length) {
    return (
      <Card className="m-4 p-4">
        <CardHeader className="px-0">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="w-full">
            <div className="flex items-center py-4">
              <Skeleton className="h-10 w-[300px]" />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Skeleton className="h-4 w-[40px]" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex lg:ml-4">
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[180px]" />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Skeleton className="h-4 w-[60px]" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <Skeleton className="h-4 w-[200px]" />
              <div className="space-x-2">
                <Skeleton className="h-8 w-[80px] inline-block" />
                <Skeleton className="h-8 w-[80px] inline-block" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="m-4 p-4">
      <CardHeader className="px-0">
        <div className="flex justify-between items-center">
          <CardTitle>Users Management</CardTitle>
          {hasPermission("users", "create") && (
            <Button
              onClick={() => navigate("/dashboard/users/add")}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add User
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter emails..."
              value={table.getColumn("email")?.getFilterValue() ?? ""}
              onChange={(event) =>
                table.getColumn("email")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog
        open={showPermissionsDialog}
        onOpenChange={(open) => {
          setShowPermissionsDialog(open);
          if (!open) {
            setSelectedUser(null);
            setSelectedPermission("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>User Permissions</DialogTitle>
            <DialogDescription>
              Assign appropriate role to {selectedUser?.first_name}{" "}
              {selectedUser?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Select
                value={selectedPermission}
                onValueChange={setSelectedPermission}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Roles</SelectLabel>
                    {roles
                      .filter(
                        (role) => role.role_type === selectedUser?.role_type
                      )
                      .map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.role_name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              onClick={async () => {
                if (!selectedPermission) {
                  toast.error("Please select a role");
                  return;
                }
                const success = await updateUserRole(
                  selectedUser.id,
                  selectedPermission
                );
                if (success) {
                  setShowPermissionsDialog(false);
                  fetchUsers(); // Refresh the users list
                }
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this user?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user
              {userToDelete
                ? ` ${userToDelete.first_name} ${userToDelete.last_name}`
                : ""}
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
