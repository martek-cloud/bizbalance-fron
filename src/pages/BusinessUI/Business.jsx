import React, { useEffect, useState } from "react";
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
import { ArrowUpDown, Pencil, Trash2, Plus, Eye } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import useBusinessStore from "@/store/businessStore";
import BusinessForm from "./BusinessForm";
import {
  Building2,
  Building,
  Briefcase,
  MapPin,
  DollarSign,
  Calculator,
  Percent,
  FileText,
  Calendar,
  Info,
  Users,
  HashIcon,
  Loader2,
} from "lucide-react";

import roleStore from "@/store/roleStore";
import useAuthStore from "@/store/authStore";

const Business = () => {

  const { hasPermission } = roleStore();
  const {
    businesses,
    loading,
    error,
    fetchBusinesses,
    addBusiness,
    updateBusiness,
    deleteBusiness,
  } = useBusinessStore();

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [dialogType, setDialogType] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const truncateText = (text, limit = 10) => {
    if (!text) return "";
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
  };

  const columns = [
    {
      accessorKey: "business_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Business Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div title={row.getValue("business_name")} className="text-center">
          {truncateText(row.getValue("business_name"))}
        </div>
      ),
    },
    {
      accessorKey: "business_address",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Address
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div title={row.getValue("business_address")} className="text-center">
          {truncateText(row.getValue("business_address"))}
        </div>
      ),
    },
    {
      accessorKey: "city_state_zip",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Location
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div title={row.getValue("city_state_zip")} className="text-center">
          {truncateText(row.getValue("city_state_zip"))}
        </div>
      ),
    },
    {
      accessorKey: "ein",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          EIN
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div title={row.getValue("ein")} className="text-center">
          {truncateText(row.getValue("ein"))}
        </div>
      ),
    },
    {
      accessorKey: "accounting_method",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Accounting Method
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div title={row.getValue("accounting_method")} className="text-center">
          {truncateText(row.getValue("accounting_method"))}
        </div>
      ),
    },
    {
      accessorKey: "business_start_date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div title={formatDate(row.getValue("business_start_date"))} className="text-center">
          {truncateText(formatDate(row.getValue("business_start_date")))}
        </div>
      ),
    },
    {
      accessorKey: "required_1099",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          1099 Required
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="capitalize text-center" title={row.getValue("required_1099")}>
          {row.getValue("required_1099")}
        </div>
      ),
    },
    {
      accessorKey: "income_tax_rate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tax Rate
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center" >{row.getValue("income_tax_rate")}%</div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {hasPermission("business", "view") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAction("view", row.original)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}

          {user.role_type === "user" && hasPermission("business", "edit") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAction("edit", row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}

          {user.role_type === "user" && hasPermission("business", "delete") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAction("delete", row.original)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: businesses,
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

  const handleAction = (type, business = null) => {
    setDialogType(type);
    setSelectedBusiness(business);
  };

  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      let success = false;

      if (dialogType === "add") {
        success = await addBusiness(data);
      } else if (dialogType === "edit" && selectedBusiness) {
        success = await updateBusiness(selectedBusiness.id, data);
      }

      if (success) {
        setDialogType(null);
        await fetchBusinesses();
      }
    } catch (error) {
      console.error("Failed to save business:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      if (selectedBusiness) {
        const success = await deleteBusiness(selectedBusiness.id);
        if (success) {
          setDialogType(null);
          setSelectedBusiness(null);
          await fetchBusinesses();
        }
      }
    } catch (error) {
      console.error("Failed to delete business:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !businesses.length) {
    return (
      <Card className="m-4 p-4">
        <CardHeader className="px-0">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-10 w-[150px]" />
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
                    {columns.map((_, index) => (
                      <TableHead key={index}>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="m-4 p-4">
        <div className="text-center text-red-500">{error}</div>
      </Card>
    );
  }

  return (
    <Card className="m-4 p-4">
      <CardHeader className="px-0">
        <div className="flex justify-between items-center">
          <CardTitle>Business Management</CardTitle>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">View Columns</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id.replace(/_/g, " ")}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {user.role_type === "user" && hasPermission("business", "create") && (
            <Button onClick={() => handleAction("add")}>
              <Plus className="w-4 h-4 mr-2" /> Add Business
            </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter business names..."
            value={table.getColumn("business_name")?.getFilterValue() ?? ""}
            onChange={(event) =>
              table
                .getColumn("business_name")
                ?.setFilterValue(event.target.value)
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
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogType === "add" || dialogType === "edit"}
        onOpenChange={() => setDialogType(null)}
      >
        <DialogContent className="max-w-[900px]">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "edit" ? "Edit" : "Add"} Business
            </DialogTitle>
          </DialogHeader>
          <BusinessForm
            initialData={selectedBusiness}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogType(null)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
      {/* View Dialog */}
      <Dialog
        open={dialogType === "view"}
        onOpenChange={() => setDialogType(null)}
      >
        <DialogContent className="max-w-[900px]">
        <ScrollArea className="h-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Business Details
            </DialogTitle>
          </DialogHeader>
          {selectedBusiness && (
            <div className="mt-6 space-y-6">
              {/* Company Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg text-orange-500 font-semibold flex items-center gap-2 pb-2 border-b">
                  <Building className="h-5 w-5" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Business Name</p>
                      <p className="text-muted-foreground">
                        {selectedBusiness.business_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Business Address</p>
                      <p className="text-muted-foreground">
                        {selectedBusiness.business_address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg text-orange-500 font-semibold flex items-center gap-2 pb-2 border-b">
                  <DollarSign className="h-5 w-5" />
                  Financial Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <Calculator className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Accounting Method</p>
                      <p className="text-muted-foreground">
                        {selectedBusiness.accounting_method}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Percent className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Tax Rate</p>
                      <p className="text-muted-foreground">
                        {selectedBusiness.income_tax_rate
                          ? `${selectedBusiness.income_tax_rate}%`
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Required 1099</p>
                      <p className="text-muted-foreground capitalize">
                        {selectedBusiness.required_1099 || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HashIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">EIN</p>
                      <p className="text-muted-foreground">
                        {selectedBusiness.ein || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Start Date</p>
                      <p className="text-muted-foreground">
                        {selectedBusiness.business_start_date
                          ? format(
                              new Date(selectedBusiness.business_start_date),
                              "PPP"
                            )
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg text-orange-500 font-semibold flex items-center gap-2 pb-2 border-b">
                  <Info className="h-5 w-5" />
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Material Participation</p>
                      <p className="text-muted-foreground">
                        {selectedBusiness.material_participation ||
                          "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Home Office Use Ratio Section */}
              <div className="space-y-4">
                <h3 className="text-lg text-orange-500 font-semibold flex items-center gap-2 pb-2 border-b">
                  <Building className="h-5 w-5" />
                  Home Office Use Ratio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 text-muted-foreground mt-0.5">📏</div>
                    <div>
                      <p className="font-medium">Office Square Footage</p>
                      <p className="text-muted-foreground">
                        {selectedBusiness.office_square_footage
                          ? `${selectedBusiness.office_square_footage} sq ft`
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 text-muted-foreground mt-0.5">🏠</div>
                    <div>
                      <p className="font-medium">Home Square Footage</p>
                      <p className="text-muted-foreground">
                        {selectedBusiness.home_square_footage
                          ? `${selectedBusiness.home_square_footage} sq ft`
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Percent className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Business Use Ratio</p>
                      <p className="text-muted-foreground">
                        {selectedBusiness.business_use_ratio
                          ? `${selectedBusiness.business_use_ratio}%`
                          : "Not calculated"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Ownership Section */}
              <div className="space-y-4">
                <h3 className="text-lg text-orange-500 font-semibold flex items-center gap-2 pb-2 border-b">
                  <Building2 className="h-5 w-5" />
                  Property Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 text-muted-foreground mt-0.5">🔑</div>
                    <div>
                      <p className="font-medium">Ownership Type</p>
                      <p className="text-muted-foreground capitalize">
                        {selectedBusiness.ownership_type || "Not specified"}
                      </p>
                    </div>
                  </div>

                  {selectedBusiness.ownership_type === "own" && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Total Basis</p>
                        <p className="text-muted-foreground">
                          {selectedBusiness.total_basis
                            ? `$${Number(selectedBusiness.total_basis).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                            : "Not calculated"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedBusiness.ownership_type === "own" && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Purchase Price</p>
                        <p className="text-muted-foreground">
                          {selectedBusiness.purchase_price
                            ? `$${Number(selectedBusiness.purchase_price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Cost of Purchase</p>
                        <p className="text-muted-foreground">
                          {selectedBusiness.cost_of_purchase
                            ? `$${Number(selectedBusiness.cost_of_purchase).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Land Value</p>
                        <p className="text-muted-foreground">
                          {selectedBusiness.land_value
                            ? `$${Number(selectedBusiness.land_value).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Improvements</p>
                        <p className="text-muted-foreground">
                          {selectedBusiness.improvements
                            ? `$${Number(selectedBusiness.improvements).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mortgage Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg text-orange-500 font-semibold flex items-center gap-2 pb-2 border-b">
                  <FileText className="h-5 w-5" />
                  Mortgage Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Mortgage Interest</p>
                      <p className="text-muted-foreground">
                        {selectedBusiness.mortgage_interest
                          ? `$${Number(selectedBusiness.mortgage_interest).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Total Mortgage Interest</p>
                      <p className="text-muted-foreground">
                        {selectedBusiness.total_mortgage_interest
                          ? `$${Number(selectedBusiness.total_mortgage_interest).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={dialogType === "delete"}
        onOpenChange={() => setDialogType(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">
                {selectedBusiness?.business_name}
              </span>
              ? This action cannot be undone and will remove all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default Business;
