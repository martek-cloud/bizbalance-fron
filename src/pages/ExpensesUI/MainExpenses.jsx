// MainExpenses.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpDown,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { format } from "date-fns";
import useMainExpenseStore from "@/store/expenseStore";
import authStore from "@/store/authStore";
import roleStore from "@/store/roleStore";
import { Link } from "react-router-dom";
import ExpensesSummary from "@/components/ExpensesSummary";
import axios from '@/lib/axios';
import MonthlyExpensesView from "./MonthlyExpensesView";

const MainExpenses = () => {
  const { user } = authStore();
  const { hasPermission: checkPermission } = roleStore();
  const { expenses, loading, error, fetchExpenses, deleteExpense } =
    useMainExpenseStore();
  const { hasPermission } = roleStore();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rangeFilter, setRangeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [summaryData, setSummaryData] = useState([]);
  const [viewMode, setViewMode] = useState('monthly');

  // Fetch expenses on component mount
  useEffect(() => {
    fetchExpenses({ expense_method: 'amount' });
  }, [fetchExpenses]);

  // Fetch summary data
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get('/api/expense-summary');
        if (response.data && response.data.expensesSummary) {
          setSummaryData(response.data.expensesSummary);
        } else {
          setSummaryData([]);
        }
      } catch (error) {
        console.error('Failed to fetch summary data:', error);
        setSummaryData([]);
      }
    };

    fetchSummary();
  }, []);

  const handleDelete = (item) => {
    setItemToDelete(item);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      const success = await deleteExpense(itemToDelete.id);
      if (success) {
        setItemToDelete(null);
      }
    }
  };


  const columns = [
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="flex items-center justify-center w-full"
            >
              Type
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="text-center flex justify-center items-center">
          {row.getValue("type")}
        </div>
      ),
    },
    {
      accessorKey: "range",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="flex items-center justify-center w-full"
            >
              Range
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="flex justify-center items-center">
          <Badge
            variant={
              row.getValue("range") === "vehicle" ? "default" : "secondary"
            }
          >
            {row.getValue("range") === "home_office"
              ? "Home Office"
              : "Vehicle"}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "label",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="flex items-center justify-center w-full"
            >
              Label
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="text-center flex justify-center items-center">
          {row.getValue("label")}
        </div>
      ),
    },
    {
      id: "value",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center justify-center w-full"
            >
              Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="text-center flex justify-center items-center">
            <span>${parseFloat(row.original.amount).toFixed(2)}</span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        return parseFloat(rowA.original.amount) - parseFloat(rowB.original.amount);
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="flex items-center justify-center w-full"
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="text-center flex justify-center items-center">
          {format(new Date(row.getValue("date")), "PP")}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleView(expense)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <>
              {/* {user.role_type === "user" &&
                hasPermission("mainExpenses", "edit") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(expense)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )} */}
              {user.role_type === "user" &&
                hasPermission("mainExpenses", "delete") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(expense)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
            </>
          </div>
        );
      },
    },
  ];

  const filteredData = React.useMemo(() => {
    return expenses.filter(
      (item) =>
        rangeFilter === "all" ||
        (rangeFilter === "operation" && item.range === "operation") ||
        (rangeFilter === "home_office" && item.range === "home_office") ||
        (rangeFilter === "vehicle" && item.range === "vehicle")
    );
  }, [expenses, rangeFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
    enableSorting: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading && !expenses.length) {
    return (
      <Card className="m-4 p-4">
        <div className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  const totalPages = Math.ceil(
    table.getFilteredRowModel().rows.length / pageSize
  );

  // Define colors for each tab
  const tabColors = {
    all: "bg-purple-100 border-purple-300",
    operation: "bg-blue-100 border-blue-300",
    home_office: "bg-green-100 border-green-300",
    vehicle: "bg-orange-100 border-orange-300",
  };

  // Placeholder for business use ratio
  const businessUseRatio = 0.2; // Example ratio

  // Placeholder variables for expenses
  const mortgageInterestTotal = 1000;
  const realEstateTaxesTotal = 500;
  const insuranceTotal = 300;
  const rentTotal = 800;
  const repairsTotal = 200;
  const utilitiesTotal = 150;
  const otherExpensesTotal = 100;
  const depreciationTotal = 1000;

  // Calculate indirect expenses
  const mortgageInterestIndirect = mortgageInterestTotal * businessUseRatio;
  const realEstateTaxesIndirect = realEstateTaxesTotal * businessUseRatio;
  const insuranceIndirect = insuranceTotal * businessUseRatio;
  const rentIndirect = rentTotal * businessUseRatio;
  const repairsIndirect = repairsTotal * businessUseRatio;
  const utilitiesIndirect = utilitiesTotal * businessUseRatio;
  const otherExpensesIndirect = otherExpensesTotal * businessUseRatio;

  const totalHomeOfficeExpenseIndirect =
    mortgageInterestIndirect +
    realEstateTaxesIndirect +
    insuranceIndirect +
    rentIndirect +
    repairsIndirect +
    utilitiesIndirect +
    otherExpensesIndirect;

  const depreciationIndirect = depreciationTotal * businessUseRatio;
  const totalIndirect = totalHomeOfficeExpenseIndirect + depreciationIndirect;

  return (
    <div className="flex flex-col w-full">
      <Card className="m-4 p-4 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">       
            {user.role_type === "user" &&
            hasPermission("mainExpenses", "create") && (
              <Link to="/dashboard/expenses/add" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">Add Expense</Button>
              </Link>
            )}
          </div>

        </div>

        {viewMode === 'table' ? (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-3/5">
              <div className={`rounded-md border ${tabColors[rangeFilter]}`}>
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
            </div>
            {summaryData.length > 0 && (
              <div className="w-full lg:w-2/5">
                <ExpensesSummary summaryData={summaryData} />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <MonthlyExpensesView />
          </div>
        )}

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogTitle>Expense Details</DialogTitle>
            <DialogDescription>
              View the details of your expense entry
            </DialogDescription>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">Expense Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Range</p>
                    <p className="font-medium">
                      {selectedItem?.range === "home_office"
                        ? "Home Office"
                        : "Vehicle"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{selectedItem?.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Label</p>
                    <p className="font-medium">{selectedItem?.label}</p>
                  </div>
                  {selectedItem?.range === "vehicle" && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Computable</p>
                        <p className="font-medium">
                          {selectedItem?.computable}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expense Method</p>
                        <p className="font-medium">
                          {selectedItem?.expense_method}
                        </p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">
                      {selectedItem?.expense_method === "mileage"
                        ? "Mileage"
                        : "Amount"}
                    </p>
                    <p className="font-medium">
                      {selectedItem?.expense_method === "mileage"
                        ? `${parseFloat(selectedItem?.mileage || 0).toFixed(
                            2
                          )} mi`
                        : `$${parseFloat(selectedItem?.amount || 0).toFixed(2)}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {selectedItem?.date
                        ? format(new Date(selectedItem.date), "PPP")
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
};

export default MainExpenses;
