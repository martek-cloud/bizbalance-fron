import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Car, Plus, Edit, Trash2, Search, RefreshCcw, LayoutGrid, LayoutList, ChevronDown, ArrowUpDown, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import useVehicleStore from "@/store/vehicleStore";
import useVehicleUsageStore from "@/store/vehicleUsageStore"; // Import the vehicle usage store
import AddVehicle from './AddVehicle';
import EditVehicle from './EditVehicle';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const AddMileageDialog = ({ open, onOpenChange, onSubmit, vehicleId }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mileage, setMileage] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ 
      usage_date: date, 
      mileage: parseFloat(mileage), 
      notes: note,
      vehicleId 
    });
    onOpenChange(false);
    // Reset form
    setMileage('');
    setNote('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Mileage Record</DialogTitle>
          <DialogDescription>
            Enter the mileage details for this vehicle
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mileage">Mileage</Label>
            <Input
              id="mileage"
              type="number"
              placeholder="Enter mileage"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this mileage record"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Record</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const VehicleCard = ({ vehicle, onEdit, onDelete }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMileageDialog, setShowMileageDialog] = useState(false);
  const navigate = useNavigate();
  
  // Use the vehicle usage store
  const { 
    addUsage, 
    fetchUsages, 
    getTotalMilesForVehicle, 
    usages 
  } = useVehicleUsageStore();

  // Fetch usage data for this vehicle when the component mounts
  useEffect(() => {
    if (vehicle?.id) {
      fetchUsages(vehicle.id);
    }
  }, [vehicle?.id, fetchUsages]);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(vehicle.id);
    setShowDeleteDialog(false);
  };

  const handleMileageSubmit = async (mileageData) => {
    // Call the addUsage method from the store with the correct data
    const success = await addUsage(mileageData.vehicleId, {
      usage_date: mileageData.usage_date,
      mileage: mileageData.mileage,
      notes: mileageData.notes
    });
    
    if (success) {
      // Refresh usage data
      fetchUsages(vehicle.id);
    }
  };

  // Calculate the current odometer reading
  const calculateCurrentReading = () => {
    // Start with January miles
    const janMiles = vehicle.jan_miles || 0;
    
    // Add total miles from usage records
    const totalUsageMiles = getTotalMilesForVehicle(vehicle.id) || 0;
    
    return janMiles + totalUsageMiles;
  };

  return (
    <Card className="relative group hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2 p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{vehicle.vehicle_make}</CardTitle>
              <CardDescription>
                Added on {new Date(vehicle.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit(vehicle)}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDeleteClick}
              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Cost</p>
              <p className="text-base font-semibold">
                {vehicle.cost ? `$${vehicle.cost.toLocaleString()}` : 'Not set'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Date in Service</p>
              <p className="text-lg font-semibold">
                {vehicle.date_placed_in_service ? 
                  new Date(vehicle.date_placed_in_service).toLocaleDateString() : 
                  'Not set'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">January Miles</p>
              <p className="text-base font-semibold">
                {vehicle.jan_miles ? `${vehicle.jan_miles.toLocaleString()} miles` : 'Not set'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Personal Miles</p>
              <p className="text-base font-semibold">
                {vehicle.personal_miles ? `${vehicle.personal_miles.toLocaleString()} miles` : '0 miles'}
              </p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Last Odometer Reading</p>
              <p className="text-base font-semibold">
                {`${Math.round(
                  parseFloat(vehicle.jan_miles || 0) + 
                  parseFloat(getTotalMilesForVehicle(vehicle.id) || 0)
                ).toLocaleString()} miles`}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {vehicle.ownership_type && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                {vehicle.ownership_type}
              </span>
            )}
            {vehicle.deduction_type && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                {vehicle.deduction_type}
              </span>
            )}
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Business:</span>
              <span className="text-sm font-medium">{vehicle.business?.business_name || 'Not set'}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMileageDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Mileage
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/dashboard/vehicle/${vehicle.id}/usage`, { state: { vehicle } })}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Usage History
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vehicle
              "{vehicle.vehicle_make}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddMileageDialog
        open={showMileageDialog}
        onOpenChange={setShowMileageDialog}
        onSubmit={handleMileageSubmit}
        vehicleId={vehicle.id}
      />
    </Card>
  );
};

const VehicleTable = ({ vehicles, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { addUsage, fetchUsages } = useVehicleUsageStore();
  const [showMileageDialog, setShowMileageDialog] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  // Fetch usage data for all vehicles when the component mounts
  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      vehicles.forEach(vehicle => {
        if (vehicle.id) {
          fetchUsages(vehicle.id);
        }
      });
    }
  }, [vehicles, fetchUsages]);

  const handleAddMileage = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setShowMileageDialog(true);
  };

  const handleMileageSubmit = async (mileageData) => {
    // Call the addUsage method from the store with the correct data
    const success = await addUsage(mileageData.vehicleId, {
      usage_date: mileageData.usage_date,
      mileage: mileageData.mileage,
      notes: mileageData.notes
    });
    
    if (success) {
      // Refresh usage data
      fetchUsages(mileageData.vehicleId);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <div className="flex items-center space-x-2">
                  <span>Vehicle Make</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Business</TableHead>
              <TableHead>
                <div className="flex items-center space-x-2">
                  <span>Cost</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Date in Service</TableHead>
              <TableHead>
                <div className="flex items-center space-x-2">
                  <span>January Miles</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Settings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Car className="w-4 h-4 text-primary" />
                    </div>
                    <span>{vehicle.vehicle_make}</span>
                  </div>
                </TableCell>
                <TableCell>{vehicle.business?.business_name || 'Not set'}</TableCell>
                <TableCell>
                  {vehicle.cost ? `$${vehicle.cost.toLocaleString()}` : 'Not set'}
                </TableCell>
                <TableCell>
                  {vehicle.date_placed_in_service ? 
                    new Date(vehicle.date_placed_in_service).toLocaleDateString() : 
                    'Not set'}
                </TableCell>
                <TableCell>
                  {vehicle.jan_miles ? `${vehicle.jan_miles.toLocaleString()} miles` : 'Not set'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.ownership_type && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                        {vehicle.ownership_type}
                      </span>
                    )}
                    {vehicle.deduction_type && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                        {vehicle.deduction_type}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddMileage(vehicle.id)}
                      className="h-8 w-8 p-0 hover:bg-muted"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/dashboard/vehicle/${vehicle.id}/usage`, { 
                          state: { vehicle } 
                      })}
                      className="h-8 w-8 p-0 hover:bg-muted"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(vehicle)}
                      className="h-8 w-8 p-0 hover:bg-muted"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(vehicle.id)}
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedVehicleId && (
        <AddMileageDialog
          open={showMileageDialog}
          onOpenChange={setShowMileageDialog}
          onSubmit={handleMileageSubmit}
          vehicleId={selectedVehicleId}
        />
      )}
    </>
  );
};

const Vehicle = () => {
  const { vehicles, fetchVehicles, deleteVehicle, loading } = useVehicleStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'table'
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleDelete = async (id) => {
    const success = await deleteVehicle(id);
    if (success) {
      fetchVehicles();
    }
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditDialogOpen(false);
    setSelectedVehicle(null);
    fetchVehicles();
  };

  const handleCloseAdd = () => {
    setIsAddDialogOpen(false);
    fetchVehicles();
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicle_make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vehicle.business?.business_name && vehicle.business.business_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Vehicles</h1>
          <p className="text-muted-foreground mt-1">
            Manage your vehicle fleet and track expenses
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[250px]"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewType(viewType === 'grid' ? 'table' : 'grid')}
            className="h-10 w-10"
          >
            {viewType === 'grid' ? (
              <LayoutList className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
                <DialogDescription>
                  Fill in the vehicle details below
                </DialogDescription>
              </DialogHeader>
              <AddVehicle onClose={handleCloseAdd} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading vehicles...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Car className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">No vehicles found</p>
        </div>
      ) : viewType === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <VehicleTable
          vehicles={filteredVehicles}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Update the vehicle details below
            </DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <EditVehicle 
              vehicle={selectedVehicle} 
              onClose={handleCloseEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vehicle;