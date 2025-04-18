import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import roleStore from "@/store/roleStore";
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
import { ArrowUpDown, Pencil, Trash2, Plus, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import authStore from "@/store/authStore";

export default function Roles() {
  const { user } = authStore();
  const navigate = useNavigate();
  const {
    roles,
    loading,
    fetchRoles,
    deleteRole,
    addRole,
    updateRole,
    hasPermission,
    fetchUserPermissions,
  } = roleStore();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [roleToEdit, setRoleToEdit] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    role_name: "",
    role_type: "",
    description: "",
  });

  useEffect(() => {
    fetchRoles();
    const initializePermissions = async () => {
      if (user?.role_id) {
        // Call fetchUserPermissions only once
        const permissions = await fetchUserPermissions(user.role_id);
      }
    };

    initializePermissions();
  }, [user]);

  // Validation function
  const validateField = (name, value) => {
    switch (name) {
      case "role_name":
        return !value.trim() ? "Role name is required" : "";
      case "role_type":
        return !value ? "Role type is required" : "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error for this field
  };

  const handleEditClick = (role) => {
    setRoleToEdit(role);
    setFormData({
      role_name: role.role_name,
      role_type: role.role_type || "",
      description: role.description || "",
    });
    setErrors({});
    setIsUpdateDialogOpen(true);
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
  };

  // Update handleSubmit with new validation approach:
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validation on all fields
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);

    // If there are errors, stop submission
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const success = await addRole(formData);
    if (success) {
      setIsAddDialogOpen(false);
      setFormData({ role_name: "", role_type: "", description: "" });
      setErrors({});
      await fetchRoles();
    }
  };

  // Similarly update handleUpdate:
  const handleUpdate = async (e) => {
    e.preventDefault();

    // Run validation on all fields
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);

    // If there are errors, stop submission
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const success = await updateRole(roleToEdit.id, formData);
    if (success) {
      setIsUpdateDialogOpen(false);
      setRoleToEdit(null);
      setFormData({ role_name: "", role_type: "", description: "" });
      setErrors({});
      await fetchRoles();
    }
  };

  const handleDeleteConfirm = async () => {
    if (roleToDelete) {
      const success = await deleteRole(roleToDelete.id);
      if (success) {
        setRoleToDelete(null);
        await fetchRoles();
      }
    }
  };

  const columns = [
    {
      accessorKey: "role_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("role_name")}</div>
      ),
    },
    {
      accessorKey: "role_type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[500px]">{row.getValue("description")}</div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {hasPermission("roles", "edit") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                navigate(`/dashboard/roles/permissions/${row.original.id}`)
              }
              title="Manage Permissions"
            >
              <Shield className="h-4 w-4" />
            </Button>
          )}
          {hasPermission("roles", "edit") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {hasPermission("roles", "delete") && (
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
    data: roles,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <Card className="m-4 p-4">
      <CardHeader className="px-0">
        <div className="flex justify-between items-center">
          <CardTitle>Roles Management</CardTitle>
          {(hasPermission("roles", "create")) && (

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Role
          </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-0">
        {/* Table content same as before */}
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter role names..."
              value={table.getColumn("role_name")?.getFilterValue() ?? ""}
              onChange={(event) =>
                table.getColumn("role_name")?.setFilterValue(event.target.value)
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24">
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-6 w-6 text-primary"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
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

      {/* Create Role Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setFormData({ role_name: "", role_type: "", description: "" });
            setErrors({});
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Add a new role by providing the name, type and description below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role_name">Role Name</Label>
                <Input
                  id="role_name"
                  value={formData.role_name}
                  onChange={(e) => handleChange("role_name", e.target.value)}
                  placeholder="Enter role name"
                  maxLength={50}
                  className={errors.role_name ? "border-red-500" : ""}
                />
                {errors.role_name && (
                  <p className="text-sm text-red-500">{errors.role_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role_type">Role Type</Label>
                <Select
                  value={formData.role_type}
                  onValueChange={(value) => handleChange("role_type", value)}
                >
                  <SelectTrigger
                    className={errors.role_type ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select role type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="comptable">Accountant</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role_type && (
                  <p className="text-sm text-red-500">{errors.role_type}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Enter role description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog
        open={isUpdateDialogOpen}
        onOpenChange={(open) => {
          setIsUpdateDialogOpen(open);
          if (!open) {
            setRoleToEdit(null);
            setFormData({ role_name: "", role_type: "", description: "" });
            setErrors({});
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Role</DialogTitle>
            <DialogDescription>
              Update the role details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="update_role_name">Role Name</Label>
                <Input
                  id="update_role_name"
                  value={formData.role_name}
                  onChange={(e) => handleChange("role_name", e.target.value)}
                  placeholder="Enter role name"
                  maxLength={50}
                  className={errors.role_name ? "border-red-500" : ""}
                />
                {errors.role_name && (
                  <p className="text-sm text-red-500">{errors.role_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="update_role_type">Role Type</Label>
                <Select
                  value={formData.role_type}
                  onValueChange={(value) => handleChange("role_type", value)}
                >
                  <SelectTrigger
                    className={errors.role_type ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select role type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="comptable">Accountant</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role_type && (
                  <p className="text-sm text-red-500">{errors.role_type}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="update_description">Description</Label>
                <textarea
                  id="update_description"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Enter role description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!roleToDelete}
        onOpenChange={() => setRoleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this role?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              role
              {roleToDelete ? ` "${roleToDelete.role_name}"` : ""}
              and remove it from our servers.
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
