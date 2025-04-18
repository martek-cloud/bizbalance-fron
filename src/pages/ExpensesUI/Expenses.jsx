import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, ChevronDown, Eye, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useNavigate } from 'react-router-dom';
import useExpenseTypeStore from '@/store/typeStore'
import AddType from './TypeUI/AddType';
import AddLabel from './LabelUI/AddLabel';
import roleStore from '@/store/roleStore';

const Expenses = () => {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rangeFilter, setRangeFilter] = useState('all');
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);

  const {
    types,
    loading,
    fetchTypes,
    deleteType,
    fetchTypeById,
    hasPermissiontype
  } = useExpenseTypeStore();
  const { hasPermission } = roleStore()
  const navigate = useNavigate();

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleEdit = async (id) => {
    const typeData = await fetchTypeById(id);
    if (typeData) {
      setSelectedType(typeData);
      setIsTypeDialogOpen(true);
    }
  };
  // Clear resetting functions
  const handleTypeDialogClose = () => {
    setIsTypeDialogOpen(false);
    setSelectedType(null); // Clear type data
  };

  const handleLabelDialogClose = () => {
    setIsLabelDialogOpen(false);
    setSelectedLabel(null); // Clear label data
  };

  const handleDeleteClick = (type) => {
    setTypeToDelete(type);
  };

  const handleDeleteConfirm = async () => {
    if (typeToDelete) {
      await deleteType(typeToDelete.id);
      setTypeToDelete(null);
    }
  };

  const filteredData = React.useMemo(() => {
    return types.filter(item =>
      rangeFilter === 'all' ? true : item.range === rangeFilter
    );
  }, [types, rangeFilter]);

  const columns = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "range",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Range
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant={row.getValue("range") === "vehicle" ? "outline" : row.getValue("range") === "home_office" ? "secondary" : "default"}>
          {row.getValue("range")}
        </Badge>
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
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/dashboard/types&labels/${row.original.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
         {row.original.deletable != 0 && <>
          {hasPermissiontype(row.original) && (
            <>
              {hasPermission("expenses", "edit") && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(row.original.id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {hasPermission("expenses", "delete") && (

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(row.original)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </>
          )}
          </>}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <Card className="m-4 p-4">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by name..."
            value={table.getColumn("name")?.getFilterValue() ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {hasPermission("expenses", "create") && (<>
            <Button onClick={() => setIsLabelDialogOpen(true)}>Add a Label</Button>
            <Button onClick={() => setIsTypeDialogOpen(true)}>Add a Type</Button>
          </>)}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!typeToDelete} onOpenChange={() => setTypeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this type?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the type
              {typeToDelete ? ` "${typeToDelete.name}"` : ""} and all associated data.
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

      {/* Your existing dialogs */}
      <Dialog
        open={isTypeDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleTypeDialogClose();
        }}
      >
        <DialogContent className='min-w-[1000px]'>
          <AddType
            onClose={handleTypeDialogClose}
            editData={selectedType}
            isEditing={!!selectedType}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isLabelDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleLabelDialogClose();
        }}
      >
        <DialogContent >
          <AddLabel
            onClose={handleLabelDialogClose}
            editData={selectedLabel}
            isEditing={!!selectedLabel}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Expenses;