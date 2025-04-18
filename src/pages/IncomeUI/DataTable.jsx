import React, { useState, useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown, Eye, Trash2, Plus } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useIncomeStore from "@/store/incomeStore";
import useBusinessStore from "@/store/businessStore";
import useAuthStore from "@/store/authStore";
import InvoiceViewer from "./InvoiceViewer";
import roleStore from "@/store/roleStore";
import { CalendarDateRangePicker } from "@/pages/DashboardUI/calendar-date-range-picker";
import { format, startOfMonth, endOfMonth } from "date-fns";

const formSchema = z.object({
  business_id: z.string().min(1, "Business ID is required"),
  gross_receipts_sales: z.number().min(0, "Must be a positive number"),
  returns: z.number().min(0, "Must be a positive number"),
  cost_of_goods_sold: z.number().min(0, "Must be a positive number"),
  income_date: z.string().min(1, "Date is required"),
  gross_income: z.number(),
});

export default function DataTable() {
  // Store hooks
  const { businesses, fetchBusinesses } = useBusinessStore();
  const user = useAuthStore((state) => state.user);
  const {
    incomes,
    loading,
    fetchIncomes,
    createIncome,
    deleteIncome,
    setSelectedIncome,
    dateRange,
    setDateRange,
  } = useIncomeStore();

  // Local state
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedGrossIncome, setCalculatedGrossIncome] = useState(0);

  // Initialize with current month and fetch data
  useEffect(() => {
    setDateRange({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    });
    fetchBusinesses();
  }, []);

  // Fetch data when date range changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchIncomes();
    }
  }, [dateRange]);

  const { hasPermission } = roleStore();

  // Form setup
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      business_id: "",
      gross_receipts_sales: 0,
      returns: 0,
      cost_of_goods_sold: 0,
      income_date: "",
      gross_income: 0,
    },
  });

  // Watch form fields for automatic calculation
  const grossReceiptsSales = form.watch("gross_receipts_sales");
  const returns = form.watch("returns");
  const costOfGoodsSold = form.watch("cost_of_goods_sold");

  // Update gross income whenever relevant fields change
  useEffect(() => {
    const grossReceiptsTotal = grossReceiptsSales;
    const returnsTotal = returns;
    const costOfGoodsSoldTotal = costOfGoodsSold;
    const grossIncome = grossReceiptsTotal - returnsTotal - costOfGoodsSoldTotal;
    setCalculatedGrossIncome(grossIncome);
    form.setValue("gross_income", grossIncome);
  }, [grossReceiptsSales, returns, costOfGoodsSold]);

  // Form submission handler
  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const newRecord = {
        ...values,
        gross_income: calculatedGrossIncome,
        created_by: user.id,
      };

      await createIncome(newRecord);
      form.reset();
      setShowAddDialog(false);
    } catch (error) {
      console.error("Failed to create income record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (newDate) => {
    setDateRange(newDate);
  };

  const handleSaveDate = () => {
    if (dateRange?.from && dateRange?.to) {
      console.log("Fetching data for date range:", {
        from: format(dateRange.from, "yyyy-MM-dd"),
        to: format(dateRange.to, "yyyy-MM-dd"),
      });
      fetchIncomes();
    }
  };

  // Table columns definition
  const columns = [
    {
      accessorKey: "business_id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Business
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const business = businesses.find(
          (b) => b.id.toString() === row.getValue("business_id")
        );
        return business?.business_name || row.getValue("business_id");
      },
    },
    {
      accessorKey: "gross_receipts_sales",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price Per Unit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("gross_receipts_sales").toLocaleString()} $
        </div>
      ),
    },
    {
      accessorKey: "returns",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Returns
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {Math.floor(row.getValue("returns")).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "cost_of_goods_sold",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cost of Goods
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("cost_of_goods_sold").toLocaleString()} $
        </div>
      ),
    },
    {
      accessorKey: "gross_income",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Gross Income
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div
          className={`text-center ${row.getValue("gross_income") >= 0
              ? "text-green-600"
              : "text-red-600"
            }`}
        >
          {row.getValue("gross_income").toLocaleString()} $
        </div>
      ),
    },
    {
      accessorKey: "income_date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {hasPermission("income", "view") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedRow(row.original);
                setSelectedIncome(row.original);
                setSheetOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {user.role_type === "user" && hasPermission("income", "delete") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRowToDelete(row.original)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: incomes,
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

  if (loading) {
    return (
      <Card className="mt-4 p-4">
        <CardHeader className="px-0">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-[150px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="w-full">
            <div className="flex items-center py-4">
              <Skeleton className="h-10 w-[250px]" />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column, index) => (
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
            <div className="flex items-center justify-end space-x-2 py-4">
              <Skeleton className="h-8 w-[100px]" />
              <Skeleton className="h-8 w-[100px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 p-4">
      <CardHeader className="px-0">
        <div className="flex justify-between items-center">
          <CardTitle>Income Records</CardTitle>
          <Dialog
            open={showAddDialog}
            onOpenChange={(open) => {
              if (!open) {
                form.reset();
              }
              setShowAddDialog(open);
            }}
          >
            <div className="flex gap-2">
              <div className="flex items-center space-x-2">
                <CalendarDateRangePicker
                  date={dateRange}
                  onDateChange={handleDateChange}
                />
              </div>
              {user.role_type === "user" && hasPermission("income", "create") && (
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                </DialogTrigger>
              )}
            </div>
            <DialogContent
              onClose={() => {
                form.reset();
                setShowAddDialog(false);
              }}
            >
              <DialogHeader>
                <DialogTitle>Add New Record</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new income record.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="business_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a business" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {businesses.map((business) => (
                              <SelectItem
                                key={business.id}
                                value={business.id.toString()}
                              >
                                {business.business_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gross_receipts_sales"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sales income</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="returns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Returns</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cost_of_goods_sold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost of Goods Sold</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gross_income"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gross Income (Auto-calculated)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={calculatedGrossIncome.toFixed(2)}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="income_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Income Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setShowAddDialog(false);
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter by business..."
              value={table.getColumn("business_id")?.getFilterValue() ?? ""}
              onChange={(event) =>
                table
                  .getColumn("business_id")
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

      <InvoiceViewer
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        data={selectedRow}
      />

      <AlertDialog
        open={!!rowToDelete}
        onOpenChange={() => setRowToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this record?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await deleteIncome(rowToDelete.id);
                  setRowToDelete(null);
                } catch (error) {
                  console.error("Failed to delete income record:", error);
                }
              }}
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