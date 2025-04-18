import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useVehicleUsageStore from "@/store/vehicleUsageStore";
import { ArrowLeft, RefreshCcw, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
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

const UsageForm = ({ onSubmit, initialData = null, onCancel }) => {
    const [formData, setFormData] = useState({
        usage_date: initialData?.usage_date ? formatDateForInput(initialData.usage_date) : new Date().toISOString().split('T')[0],
        mileage: initialData?.mileage || '',
        notes: initialData?.notes || ''
    });

    // Helper function to format date string for input
    function formatDateForInput(dateString) {
        if (!dateString) return new Date().toISOString().split('T')[0];
        
        // If dateString is already in YYYY-MM-DD format, return it
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
        
        // Otherwise parse it and format it
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="usage_date">Date</Label>
                <Input
                    id="usage_date"
                    type="date"
                    value={formData.usage_date}
                    onChange={(e) => setFormData({ ...formData, usage_date: e.target.value })}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="mileage">Mileage</Label>
                <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any notes about this usage record..."
                />
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    {initialData ? 'Update' : 'Add'} Record
                </Button>
            </div>
        </form>
    );
};

const VehicleUsage = () => {
    const { vehicleId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const vehicle = location.state?.vehicle;
    
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedUsage, setSelectedUsage] = useState(null);

    const {
        usages,
        loading,
        fetchUsages,
        addUsage,
        updateUsage,
        deleteUsage,
        getTotalMileage
    } = useVehicleUsageStore();

    useEffect(() => {
        if (vehicleId) {
            fetchUsages(vehicleId);
        }
    }, [vehicleId, fetchUsages]);

    const handleAddUsage = async (data) => {
        const success = await addUsage(vehicleId, data);
        if (success) {
            setShowAddDialog(false);
            fetchUsages(vehicleId);
        }
    };

    const handleEditUsage = async (data) => {
        if (selectedUsage) {
            const success = await updateUsage(vehicleId, selectedUsage.id, data);
            if (success) {
                setShowEditDialog(false);
                setSelectedUsage(null);
                fetchUsages(vehicleId);
            }
        }
    };

    const handleDeleteConfirm = async () => {
        if (selectedUsage) {
            const success = await deleteUsage(vehicleId, selectedUsage.id);
            if (success) {
                setShowDeleteDialog(false);
                setSelectedUsage(null);
                fetchUsages(vehicleId);
            }
        }
    };

    // Helper function to format dates for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    // Helper function to format date and time for display
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="space-y-4 p-8">
            <div className="flex items-center justify-between">
                <Button 
                    variant="outline" 
                    onClick={() => navigate('/dashboard/vehicle')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Vehicles
                </Button>

                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add Usage Record
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Usage Record</DialogTitle>
                        </DialogHeader>
                        <UsageForm 
                            onSubmit={handleAddUsage}
                            onCancel={() => setShowAddDialog(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Vehicle Usage History - {vehicle?.vehicle_make}</span>
                        <span className="text-sm text-muted-foreground">
                            Total Mileage: {getTotalMileage().toLocaleString()} miles
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <RefreshCcw className="h-6 w-6 animate-spin" />
                        </div>
                    ) : usages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No usage records found for this vehicle
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Mileage</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usages.map((usage) => (
                                    <TableRow key={usage.id}>
                                        <TableCell>
                                            {formatDate(usage.usage_date)}
                                        </TableCell>
                                        <TableCell>{parseFloat(usage.mileage).toLocaleString()} miles</TableCell>
                                        <TableCell>{usage.notes || '-'}</TableCell>
                                        <TableCell>
                                            {formatDateTime(usage.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUsage(usage);
                                                        setShowEditDialog(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUsage(usage);
                                                        setShowDeleteDialog(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Usage Record</DialogTitle>
                    </DialogHeader>
                    {selectedUsage && (
                        <UsageForm 
                            initialData={selectedUsage}
                            onSubmit={handleEditUsage}
                            onCancel={() => setShowEditDialog(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            usage record from {selectedUsage ? formatDate(selectedUsage.usage_date) : ''}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default VehicleUsage;