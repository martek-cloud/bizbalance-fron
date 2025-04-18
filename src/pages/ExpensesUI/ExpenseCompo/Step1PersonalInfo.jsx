// Step1PersonalInfo.jsx
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CarIcon, HomeIcon, Building, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import useVehicleStore from '@/store/vehicleStore';
import useBusinessStore from '@/store/businessStore';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Step1PersonalInfo = ({ formData, setFormData, setStepValid }) => {
  const [errors, setErrors] = useState({});
  const { vehicles, fetchVehicles, loading: vehiclesLoading, loading } = useVehicleStore();
  const { fetchOldestBusiness, oldestBusiness, loading: businessLoading } = useBusinessStore();
  
  // useEffect(() => {
  //   // Fetch oldest business on component mount
  //   fetchOldestBusiness();
  // }, []); // Empty dependency array means run only on mount
  
  // // This runs on every render, which is useful for debugging
  // console.log('oldestBusiness in render:', oldestBusiness.ownership_type);
  // Fetch vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);
 
  
  // Validate form fields on change
  useEffect(() => {
    validateStep();
  }, [formData.range, formData.vehicleId]);

  const handleRangeChange = (value) => {
    // Reset vehicleId when range changes
    if (value !== formData.range) {
      setFormData({
        ...formData,
        range: value,
        vehicleId: '',
        // Clear vehicle details when range changes
        vehicleDetails: null
      });
    } else {
      setFormData({
        ...formData,
        range: value
      });
    }
  };

  const handleVehicleChange = (value) => {
    // Find the selected vehicle to store its details
    const selectedVehicle = vehicles.find(v => v.id.toString() === value);
    
    setFormData({
      ...formData,
      vehicleId: value,
      // Store complete vehicle details for use in step 3
      vehicleDetails: selectedVehicle
    });
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (!formData.range) {
      newErrors.range = 'Range selection is required';
    }
    
    if (formData.range === 'vehicle' && !formData.vehicleId) {
      newErrors.vehicleId = 'Vehicle selection is required';
    }
    
    setErrors(newErrors);
    
    // Update step validation status
    const isValid = Object.keys(newErrors).length === 0;
    setStepValid(isValid);
    
    return isValid;
  };

  // Format vehicle display name
  const getVehicleDisplayName = (vehicle) => {
    return `${vehicle.vehicle_make || 'Unknown'} (${vehicle.cost || 'N/A'})`;
  };

  // Check if step is complete
  const isStepComplete = () => {
    if (!formData.range) return false;
    if (formData.range === 'vehicle' && !formData.vehicleId) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header with status */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Choose Range</h3>
          {isStepComplete() ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          )}
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "px-3",
            isStepComplete() 
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          )}
        >
          {isStepComplete() ? "Complete" : "Incomplete"}
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Select the type of expense you want to record. This determines what information will be collected.
      </p>

      {/* Range Selection Card */}
      <Card className="border-l-4 border-l-indigo-500">
        <CardContent className="pt-6">
          <div className="mb-4">
            <h4 className="text-sm font-semibold flex items-center">
              <span className="mr-2">Range Selection</span>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                Required
              </Badge>
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Choose the appropriate category for your expense
            </p>
          </div>

          {/* Range Selection (Radio) */}
          <div className="space-y-4">
            <RadioGroup
              value={formData.range}
              onValueChange={handleRangeChange}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
            >
              <div className={cn(
                "flex items-center justify-between space-x-2 border rounded-md p-4 transition-colors",
                formData.range === 'vehicle' 
                  ? "bg-blue-50 border-blue-200" 
                  : "hover:bg-muted/50"
              )}>
                <div className="flex items-center space-x-2">
                <RadioGroupItem value="vehicle" id="vehicle" disabled={vehicles.length === 0}/>
                <Label htmlFor="vehicle" className="flex items-center cursor-pointer">
                  <CarIcon className="mr-2 h-4 w-4 text-blue-600" />
                  <span>Vehicle</span>
                </Label>
                </div>
                  {loading ? 
                  <span>
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </span>
                  :vehicles.length == 0 &&
                  
                    <Link to="/dashboard/vehicle">
                      <Button className="ml-2">
                        add vehicle
                      </Button>
                    </Link>
                  }
              </div>
              
              <div className={cn(
                "flex items-center space-x-2 border rounded-md p-4 transition-colors",
                formData.range === 'home_office' 
                  ? "bg-purple-50 border-purple-200" 
                  : "hover:bg-muted/50"
              )}>
                <RadioGroupItem value="home_office" id="home_office" />
                <Label htmlFor="home_office" className="flex items-center cursor-pointer">
                  <HomeIcon className="mr-2 h-4 w-4 text-purple-600" />
                  <span>Home Office</span>
                </Label>
              </div>
              
              <div className={cn(
                "flex items-center space-x-2 border rounded-md p-4 transition-colors",
                formData.range === 'operation_expense' 
                  ? "bg-emerald-50 border-emerald-200" 
                  : "hover:bg-muted/50"
              )}>
                <RadioGroupItem value="operation_expense" id="operation_expense" />
                <Label htmlFor="operation_expense" className="flex items-center cursor-pointer">
                  <Building className="mr-2 h-4 w-4 text-emerald-600" />
                  <span>Operation Expense</span>
                </Label>
              </div>
            </RadioGroup>
            
            {errors.range && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
                <p className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                  {errors.range}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conditional Vehicle Selection */}
      {formData.range === 'vehicle' && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="mb-4">
              <h4 className="text-sm font-semibold flex items-center">
                <CarIcon className="mr-2 h-4 w-4 text-blue-600" />
                <span className="mr-2">Vehicle Selection</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Required
                </Badge>
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Select the vehicle associated with this expense
              </p>
            </div>
            
            <div className="space-y-2 pt-2">
              <Select
                value={formData.vehicleId}
                onValueChange={handleVehicleChange}
                disabled={vehiclesLoading}
              >
                <SelectTrigger 
                  id="vehicleId"
                  className={cn(
                    "bg-white",
                    errors.vehicleId ? 'border-destructive' : ''
                  )}
                >
                  <SelectValue placeholder={vehiclesLoading ? "Loading vehicles..." : "Select vehicle"} />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.length === 0 && !vehiclesLoading ? (
                    <div className="py-2 px-2 text-sm text-muted-foreground">
                      No vehicles available
                    </div>
                  ) : (
                    vehicles.map(vehicle => (
                      <SelectItem 
                        key={vehicle.id} 
                        value={vehicle.id.toString()}
                        className="focus:bg-blue-50"
                      >
                        {getVehicleDisplayName(vehicle)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              {errors.vehicleId && (
                <p className="text-xs text-destructive mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.vehicleId}
                </p>
              )}
            </div>
            
            {formData.vehicleId && formData.vehicleDetails && (
              <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-100">
                <h5 className="text-xs font-medium text-blue-800 mb-2">Selected Vehicle Details</h5>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-xs text-blue-700">Make:</span>
                    <p className="text-sm font-medium">{formData.vehicleDetails.vehicle_make}</p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-700">Cost:</span>
                    <p className="text-sm font-medium">${formData.vehicleDetails.cost}</p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-700">Ownership:</span>
                    <p className="text-sm font-medium">{formData.vehicleDetails.ownership_type}</p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-700">Deduction:</span>
                    <p className="text-sm font-medium">{formData.vehicleDetails.deduction_type}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Home Office Info (when selected) */}
      {formData.range === 'home_office' && (
        <div className="bg-purple-50 border border-purple-100 rounded-md p-4">
          <div className="flex gap-2">
            <HomeIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-purple-900 mb-1">Home Office Selected</h5>
              <p className="text-sm text-purple-800">
                You've selected Home Office as your expense range. In the next steps,
                you'll be able to choose specific expense types related to your home office.
              </p>
              
              {/* Display loading state */}
              {businessLoading && (
                <div className="mt-3 flex items-center text-purple-700">
                  <div className="animate-spin mr-2">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  Loading business information...
                </div>
              )}
              
              {/* Display Oldest Business Information (not loading and data exists) */}
              {!businessLoading && oldestBusiness && Object.keys(oldestBusiness).length > 0 ? (
                <div className="mt-4 border-t border-purple-200 pt-3">
                  <h6 className="font-medium text-purple-900 mb-2">Business Information</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-purple-700">Business Name:</p>
                      <p className="text-sm font-medium">{oldestBusiness.business_name || "N/A"}</p>
                    </div>
                    {oldestBusiness.business_use_ratio && (
                      <div>
                        <p className="text-xs text-purple-700">Business Use Ratio:</p>
                        <p className="text-sm font-medium">{oldestBusiness.business_use_ratio}%</p>
                      </div>
                    )}
                    {oldestBusiness.office_square_footage && (
                      <div>
                        <p className="text-xs text-purple-700">Office Area:</p>
                        <p className="text-sm font-medium">{oldestBusiness.office_square_footage} sq ft</p>
                      </div>
                    )}
                    {oldestBusiness.home_square_footage && (
                      <div>
                        <p className="text-xs text-purple-700">Total Home Area:</p>
                        <p className="text-sm font-medium">{oldestBusiness.home_square_footage} sq ft</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : !businessLoading && (
                <div className="mt-3 text-sm text-purple-700">
                  <p>No business information available. Please set up a business with home office details first.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Operation Expense Info (when selected) */}
      {formData.range === 'operation_expense' && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-md p-4">
          <div className="flex gap-2">
            <Building className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-emerald-900 mb-1">Operation Expense Selected</h5>
              <p className="text-sm text-emerald-800">
                You've selected Operation Expense as your expense range. In the next steps,
                you'll be able to choose specific expense types related to business operations.
              </p>
              
              {/* Display loading state */}
              {businessLoading && (
                <div className="mt-3 flex items-center text-emerald-700">
                  <div className="animate-spin mr-2">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  Loading business information...
                </div>
              )}
              
              {/* Display Oldest Business Information (not loading and data exists) */}
              {!businessLoading && oldestBusiness && Object.keys(oldestBusiness).length > 0 ? (
                <div className="mt-4 border-t border-emerald-200 pt-3">
                  <h6 className="font-medium text-emerald-900 mb-2">Business Information</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-emerald-700">Business Name:</p>
                      <p className="text-sm font-medium">{oldestBusiness.business_name || "N/A"}</p>
                    </div>
                    {oldestBusiness.business_use_ratio && (
                      <div>
                        <p className="text-xs text-emerald-700">Business Use Ratio:</p>
                        <p className="text-sm font-medium">{oldestBusiness.business_use_ratio}%</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : !businessLoading && (
                <div className="mt-3 text-sm text-emerald-700">
                  <p>No business information available. Please set up a business first.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1PersonalInfo;