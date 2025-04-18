// Step2ContactDetails.jsx
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Car, 
  Home, 
  Tag, 
  Layers, 
  Loader2,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useExpenseTypeStore from '@/store/typeStore';
import useLabelStore from '@/store/labelStore';
import useBusinessStore from '@/store/businessStore';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


const Step2ContactDetails = ({ formData, setFormData, setStepValid }) => {
  const [errors, setErrors] = useState({});
  const { fetchOldestBusiness, oldestBusiness, loading: businessLoading } = useBusinessStore();
  useEffect(() => {
    fetchOldestBusiness();
  }, []);
  
  // Get type and label store methods and state
  const { 
    types,
    loading: typesLoading,
    fetchTypes,
    getTypesByRange
  } = useExpenseTypeStore();
  
  const {
    labels,
    loading: labelsLoading,
    fetchLabelsByType,
    fetchLabelsByTypeAndMethod // Assuming this method exists or we'll filter locally
  } = useLabelStore();
  
  // Local state for filtered types and labels
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [filteredLabels, setFilteredLabels] = useState([]);

  // Fetch all types on component mount
  useEffect(() => {
    const loadTypes = async () => {
      await fetchTypes();
    };
    loadTypes();
    
    // Initialize method with default value if not set
    if (!formData.method) {
      console.log("Initializing method with default 'direct'");
      setFormData((prevData) => ({
        ...prevData,
        method: 'direct'
      }));
    }
  }, [fetchTypes]);

  // Update filtered types whenever types change or range changes
  useEffect(() => {
    if (formData.range && types.length > 0) {
      const typesForRange = getTypesByRange(formData.range);
      setFilteredTypes(typesForRange);
    }
  }, [formData.range, types, getTypesByRange]);

  // Set default method when selecting expense type and label
  useEffect(() => {
    if (formData.expenseTypeId && formData.expenseLabelId && !formData.method) {
      console.log("Setting default method to 'direct' after type/label selection");
      setFormData((prevData) => ({
        ...prevData,
        method: 'direct'
      }));
    }
  }, [formData.expenseTypeId, formData.expenseLabelId]);

  // Fetch labels when expense type is selected
  useEffect(() => {
    if (formData.expenseTypeId) {
      // Option 1: If we have a method that can filter by expense_method
      if (typeof fetchLabelsByTypeAndMethod === 'function') {
        fetchLabelsByTypeAndMethod(formData.expenseTypeId, 'amount');
      } 
      // Option 2: Fetch all labels for the type and filter locally
      else {
        const fetchAndFilterLabels = async () => {
          const allLabels = await fetchLabelsByType(formData.expenseTypeId);
          
          // If the API doesn't filter by method, filter the results locally
          if (Array.isArray(allLabels)) {
            const amountLabels = allLabels.filter(label => label.expense_method === 'amount');
            setFilteredLabels(amountLabels);
          }
        };
        
        fetchAndFilterLabels();
      }
    } else {
      // Clear filtered labels when no expense type is selected
      setFilteredLabels([]);
    }
  }, [formData.expenseTypeId, fetchLabelsByType, fetchLabelsByTypeAndMethod]);

  // Validate fields when they change
  useEffect(() => {
    validateStep();
  }, [formData.expenseTypeId, formData.expenseLabelId, formData.method, labels, filteredLabels]);

  const handleExpenseTypeChange = (value) => {
    // Clear label when type changes
    setFormData({
      ...formData,
      expenseTypeId: value,
      expenseLabelId: '',
    });
  };

  const handleExpenseLabelChange = (value) => {
    setFormData({
      ...formData,
      expenseLabelId: value,
    });
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (!formData.expenseTypeId) {
      newErrors.expenseTypeId = 'Expense type is required';
    }
    
    if (!formData.expenseLabelId) {
      newErrors.expenseLabelId = 'Expense label is required';
    }
    
    if (formData.expenseTypeId && formData.expenseLabelId && !formData.method) {
      newErrors.method = 'Expense method is required';
    }
    
    setErrors(newErrors);
    
    // Update step validation status
    const isValid = Object.keys(newErrors).length === 0;
    setStepValid(isValid);
    
    return isValid;
  };

  // Check if step is complete
  const isStepComplete = () => {
    return formData.expenseTypeId && formData.expenseLabelId && formData.method;
  };

  // Get range icon
  const getRangeIcon = () => {
    if (formData.range === 'vehicle') {
      return <Car className="h-5 w-5 text-blue-500" />;
    } else if (formData.range === 'home_office') {
      return <Home className="h-5 w-5 text-purple-500" />;
    } else if (formData.range === 'operation_expense') {
      return <Building className="h-5 w-5 text-emerald-500" />;
    }
    return null;
  };

  // Determine which labels array to use
  const labelsToShow = typeof fetchLabelsByTypeAndMethod === 'function' ? 
    labels : // If using the API method, use the store's labels state
    filteredLabels; // If filtering locally, use our filtered state

  return (
    <div className="space-y-6">
      {/* Header with status */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Expense Type Details</h3>
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
      
      <p className="text-sm text-muted-foreground mb-4">
        {formData.range === 'vehicle' 
          ? 'Select the specific type of vehicle expense and its category'
          : formData.range === 'home_office'
            ? 'Select the specific type of home office expense and its category'
            : formData.range === 'operation_expense'
              ? 'Select the specific type of operation expense and its category'
              : 'Select the specific type of expense and its category'}
      </p>

      {/* Main content grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Range Summary Card */}
        <div className="lg:col-span-1">
          <Card className={cn(
            "border-l-4 h-full",
            formData.range === 'vehicle' 
              ? "border-l-blue-500" 
              : formData.range === 'home_office'
                ? "border-l-purple-500"
                : formData.range === 'operation_expense'
                  ? "border-l-emerald-500"
                  : "border-l-gray-300"
          )}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {getRangeIcon()}
                <CardTitle className="text-base">Selected Range</CardTitle>
              </div>
              <CardDescription>
                {formData.range === 'vehicle'
                  ? 'Vehicle expense information'
                  : formData.range === 'home_office'
                    ? 'Home office expense information'
                    : formData.range === 'operation_expense'
                      ? 'Operation expense information'
                      : 'Expense information'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    formData.range === 'vehicle' 
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                      : formData.range === 'home_office'
                        ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                        : formData.range === 'operation_expense'
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-800"
                  )}>
                    {formData.range === 'vehicle' 
                      ? 'Vehicle' 
                      : formData.range === 'home_office'
                        ? 'Home Office'
                        : formData.range === 'operation_expense'
                          ? 'Operation Expense'
                          : 'Unknown Range'}
                  </Badge>
                  
                  {formData.range === 'vehicle' && formData.vehicleDetails && (
                    <span className="text-sm font-medium">
                      {formData.vehicleDetails.vehicle_make}
                    </span>
                  )}
                </div>
                
                {formData.range === 'vehicle' && formData.vehicleDetails && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 bg-blue-50 rounded-md text-sm">
                    <div>
                      <span className="text-xs text-blue-700">Cost:</span>
                      <p className="font-medium">${formData.vehicleDetails.cost}</p>
                    </div>
                    <div>
                      <span className="text-xs text-blue-700">Ownership:</span>
                      <p className="font-medium">{formData.vehicleDetails.ownership_type}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Type Selection Card */}
        <div className="lg:col-span-2">
          <Card className="border-l-4 border-l-emerald-500 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-base">Expense Type Selection</CardTitle>
              </div>
              <CardDescription>
                Choose the category of expense you're recording
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="expenseTypeId" className="flex items-center">
                    Expense Type <span className="text-destructive ml-1">*</span>
                    {typesLoading && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </Label>
                  
                  <Select
                    value={formData.expenseTypeId}
                    onValueChange={handleExpenseTypeChange}
                    disabled={typesLoading || !formData.range}
                  >
                    <SelectTrigger 
                      id="expenseTypeId"
                      className={cn(
                        "bg-white",
                        errors.expenseTypeId ? 'border-destructive' : ''
                      )}
                    >
                      <SelectValue 
                        placeholder={
                          !formData.range ? "First select a range in Step 1" :
                          typesLoading ? "Loading expense types..." : 
                          filteredTypes.length === 0 ? "No types available for this range" :
                          "Select expense type"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTypes.length === 0 && !typesLoading ? (
                        <div className="py-2 px-2 text-sm text-muted-foreground">
                          No expense types found for {formData.range}
                        </div>
                      ) : (
                        // Filter the types based on oldestBusiness ownership type
                        filteredTypes
                          .filter(type => {
                            // If oldestBusiness exists and ownership_type is 'own',
                            // filter out expense types with name 'rent'
                            if (oldestBusiness && oldestBusiness.ownership_type === 'own') {
                              return type.name.toLowerCase() !== 'rent';
                            }
                            // Otherwise, show all expense types
                            return true;
                          })
                          .map(type => (
                            <SelectItem 
                              key={type.id} 
                              value={type.id.toString()}
                              className="focus:bg-emerald-50"
                            >
                              {type.name}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                  
                  {errors.expenseTypeId && (
                    <p className="text-xs text-destructive mt-1 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {errors.expenseTypeId}
                    </p>
                  )}
                </div>

                {/* Selected Type Info */}
                {formData.expenseTypeId && !labelsLoading && (
                  <div className="p-3 bg-emerald-50 rounded-md border border-emerald-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-900">
                        Type Selected
                      </span>
                    </div>
                    <p className="text-sm text-emerald-800">
                      Now select a specific label from the available options below.
                    </p>
                  </div>
                )}

                {/* Expense Label Selection */}
                {formData.expenseTypeId && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="expenseLabelId" className="flex items-center">
                      Expense Label <span className="text-destructive ml-1">*</span>
                      {labelsLoading && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </Label>
                    
                    <Select
                      value={formData.expenseLabelId}
                      onValueChange={handleExpenseLabelChange}
                      disabled={labelsLoading || !formData.expenseTypeId}
                    >
                      <SelectTrigger 
                        id="expenseLabelId"
                        className={cn(
                          "bg-white",
                          errors.expenseLabelId ? 'border-destructive' : ''
                        )}
                      >
                        <SelectValue 
                          placeholder={
                            labelsLoading ? "Loading amount labels..." : 
                            labelsToShow.length === 0 ? "No amount labels available for this type" :
                            "Select label"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {labelsToShow.length === 0 && !labelsLoading ? (
                          <div className="py-2 px-2 text-sm text-muted-foreground">
                            No amount labels found for this expense type
                          </div>
                        ) : (
                          labelsToShow.map(label => (
                            <SelectItem 
                              key={label.id} 
                              value={label.id.toString()}
                              className="focus:bg-emerald-50"
                            >
                              {label.label_name || label.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    
                    {errors.expenseLabelId && (
                      <p className="text-xs text-destructive mt-1 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {errors.expenseLabelId}
                      </p>
                    )}
                  </div>
                )}

                {/* Method Selection (Direct/Indirect) */}
                {formData.expenseTypeId && formData.expenseLabelId && (
                  <div className="space-y-2 pt-4 mt-4 border-t border-emerald-100">
                    <Label htmlFor="method" className="flex items-center">
                      Expense Method <span className="text-destructive ml-1">*</span>
                    </Label>
                    
                    <div className="flex flex-col space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Select whether this is a direct or indirect expense
                      </p>
                      
                      <RadioGroup
                        value={formData.method || 'direct'}
                        onValueChange={(value) => {
                          console.log("Method changed to:", value);
                          setFormData({
                            ...formData,
                            method: value
                          });
                        }}
                        className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <div className={cn(
                          "flex items-center space-x-2 border rounded-md p-3 transition-colors",
                          (formData.method === 'direct' || !formData.method) 
                            ? "bg-emerald-50 border-emerald-200" 
                            : "hover:bg-muted/50"
                        )}>
                          <RadioGroupItem value="direct" id="direct" />
                          <Label htmlFor="direct" className="flex items-center cursor-pointer">
                            <span>Direct</span>
                          </Label>
                        </div>
                        
                        <div className={cn(
                          "flex items-center space-x-2 border rounded-md p-3 transition-colors",
                          formData.method === 'indirect' 
                            ? "bg-emerald-50 border-emerald-200" 
                            : "hover:bg-muted/50"
                        )}>
                          <RadioGroupItem value="indirect" id="indirect" />
                          <Label htmlFor="indirect" className="flex items-center cursor-pointer">
                            <span>Indirect</span>
                          </Label>
                        </div>
                      </RadioGroup>
                      
                      {errors.method && (
                        <p className="text-xs text-destructive mt-1 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {errors.method}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Helpful guidance or errors */}
      {formData.expenseTypeId && labelsToShow.length === 0 && !labelsLoading && (
        <div className="p-4 border rounded-md bg-amber-50 border-amber-200 mt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 text-sm mb-1">No Amount Labels Available</h4>
              <p className="text-sm text-amber-700">
                No labels with expense method "amount" found for this expense type. Please select a different type or contact your administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success guidance */}
      {formData.expenseTypeId && formData.expenseLabelId && (
        <div className="p-4 border rounded-md bg-green-50 border-green-200 mt-6">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800 text-sm mb-1">Selection Complete</h4>
              <p className="text-sm text-green-700">
                You've successfully selected an expense type and label. 
                In the next step, you'll be able to provide more details for your expense.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2ContactDetails;