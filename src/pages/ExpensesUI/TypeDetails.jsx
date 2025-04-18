import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Pencil, Trash2, ArrowLeft, Loader2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import useExpenseTypeStore from '@/store/typeStore';
import useLabelStore from '@/store/labelStore';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { useTypeGuard } from '@/routes/typeAccessGuard';

const EditLabel = ({ label, types, onClose, onSubmit }) => {
    const [loading, setLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(z.object({
            name: z.string().min(2, "Name must be at least 2 characters"),
            type_id: z.string().nonempty("Type is required")
        })),
        defaultValues: {
            name: label.label_name,
            type_id: label.expense_type_id.toString()
        }
    });

    const handleSubmit = async (values) => {
        setLoading(true);
        const success = await onSubmit(values);
        setLoading(false);
        if (success) onClose();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base">Label Name</FormLabel>
                            <FormControl>
                                <Input {...field} disabled={loading} className="h-10" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="type_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base">Type</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={loading}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="w-24"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-24"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            'Save'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
const TypeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [labelToDelete, setLabelToDelete] = useState(null);
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [nameFilter, setNameFilter] = useState('');
    const { hasPermissiontype } = useExpenseTypeStore();
    const { fetchTypeById, currentType, types, fetchTypes, loading: typeLoading } = useExpenseTypeStore();
    const { fetchLabelsByType, labels, deleteLabel, updateLabel, loading: labelLoading } = useLabelStore();
    useTypeGuard(id);


    useEffect(() => {
        fetchTypes();
        if (id) {
            fetchTypeById(id);
            fetchLabelsByType(id);
        }
    }, [id]);

    const columns = [
        {
            accessorKey: "label_name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-muted/50"
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-medium">{row.getValue("label_name")}</div>,
        },
        {
            accessorKey: "created_by",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-muted/50"
                >
                    Created By
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-muted/50"
                >
                    Created At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="text-muted-foreground">
                    {new Date(row.getValue("created_at")).toLocaleDateString()}
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-muted/50"
                        onClick={() => handleView(row.original)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    {hasPermissiontype(row.original) && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-muted/50"
                                onClick={() => handleEdit(row.original)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-destructive/10 text-destructive"
                                onClick={() => handleDelete(row.original)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button></>)}
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: labels,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
    });

    const handleView = (label) => {
        setSelectedLabel(label);
        setIsViewDialogOpen(true);
    };

    const handleEdit = (label) => {
        setSelectedLabel(label);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (label) => {
        setLabelToDelete(label);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (labelToDelete) {
            const success = await deleteLabel(labelToDelete.id);
            if (success) {
                setIsDeleteDialogOpen(false);
                setLabelToDelete(null);
                fetchLabelsByType(id);
            }
        }
    }; if (typeLoading) {
        return (
            <Card className="m-4 p-6  flex justify-center items-center">
                <Loader2 className={'animate-spin'} />
            </Card>
        );
    }

    if (!currentType) return <Card className="m-4 p-6  flex justify-center items-center">
        <Loader2 className={'animate-spin'} />
    </Card>;

    return (
        <Card className="m-4 p-6">
            <div className="space-y-6">
                <div className='flex justify-between items-center mb-6'>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="hover:bg-muted/50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-2xl font-bold">{currentType.name}</h2>
                    </div>

                    <Badge
                        variant={currentType.range === "vehicle" ? "default" : "secondary"}
                        className="text-sm px-3 py-1"
                    >
                        {currentType.range}
                    </Badge>
                </div>

                <p className="text-muted-foreground pl-12">{currentType.description}</p>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Labels</h3>
                        <div className="flex gap-4">
                            <Input
                                placeholder="Filter labels..."
                                value={nameFilter}
                                onChange={(e) => {
                                    setNameFilter(e.target.value);
                                    table.getColumn('label_name')?.setFilterValue(e.target.value);
                                }}
                                className="w-64"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {labelLoading ? (
                                    [...Array(3)].map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Skeleton className="h-8 w-8" />
                                                    <Skeleton className="h-8 w-8" />
                                                    <Skeleton className="h-8 w-8" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} className="hover:bg-muted/50">
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                            No labels found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-end space-x-2 py-4">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="w-24"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="w-24"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Label Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div>
                            <h4 className="font-semibold text-sm text-muted-foreground">Name</h4>
                            <p className="mt-1">{selectedLabel?.label_name}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-muted-foreground">Created By</h4>
                            <p className="mt-1">{selectedLabel?.created_by}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-muted-foreground">Created At</h4>
                            <p className="mt-1">{selectedLabel?.created_at && new Date(selectedLabel.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Label</DialogTitle>
                    </DialogHeader>
                    {selectedLabel && (
                        <EditLabel
                            label={selectedLabel}
                            types={types}
                            onClose={() => setIsEditDialogOpen(false)}
                            onSubmit={async (values) => {
                                const success = await updateLabel(selectedLabel.id, {
                                    name: values.name,
                                    type_id: values.type_id
                                });
                                if (success) fetchLabelsByType(id);
                                return success;
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Label</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the label "{labelToDelete?.label_name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setLabelToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};

export default TypeDetails;