// Step3AccountSetup.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  InfoIcon, 
  CheckCircle2, 
  AlertTriangle,
  Car,
  Home,
  Building,
  DollarSign,
  Clock,
  Tag,
  MapPin,
  Loader2,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import useExpenseTypeStore from '@/store/typeStore';
import useLabelStore from '@/store/labelStore';
import useMainExpenseStore from '@/store/expenseStore';
import { Textarea } from '@/components/ui/textarea';

const Step3AccountSetup = ({ formData, setFormData, setStepValid }) => {
  const [errors, setErrors] = useState({});
  const [expenseMethod, setExpenseMethod] = useState(null);
  const [initialOdometerReading, setInitialOdometerReading] = useState('');
  const [lastMileageInfo, setLastMileageInfo] = useState(null);
  const { getTypeById } = useExpenseTypeStore();
  const { labels } = useLabelStore();
  const { getLastMileageInfo } = useMainExpenseStore();

  // Get selected label details
  useEffect(() => {
    if (formData.expenseLabelId && labels.length > 0) {
      const selectedLabel = labels.find(
        label => label.id.toString() === formData.expenseLabelId
      );
      
      if (selectedLabel) {
        setExpenseMethod(selectedLabel.expense_method);
      }
    }
  }, [formData.expenseLabelId, labels]);

  // Fetch last mileage info when vehicle is selected and expense method is mileage
  useEffect(() => {
    const fetchLastMileageInfo = async () => {
      if (expenseMethod === 'mileage' && formData.vehicleId) {
        const info = await getLastMileageInfo(formData.vehicleId);
        setLastMileageInfo(info);
        
        if (info) {
          let startingReading;
          if (info.has_previous_mileage) {
            startingReading = info.last_odometer_reading;
            setFormData(prev => ({
              ...prev,
              startingOdometerReading: startingReading.toString()
            }));
          } else {
            startingReading = info.january_miles;
            setFormData(prev => ({
              ...prev,
              startingOdometerReading: startingReading.toString()
            }));
          }
          setInitialOdometerReading(startingReading.toString());
        }
      }
    };

    fetchLastMileageInfo();
  }, [expenseMethod, formData.vehicleId]);

  // Validate form fields whenever they change
  useEffect(() => {
    validateStep();
  }, [
    formData.expenseDate,
    formData.expenseAmount,
    formData.odometerReading,
    formData.businessMiles,
    expenseMethod
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateFormData(name, value);
  };

  const handleDateChange = (date) => {
    updateFormData('expenseDate', date);
  };

  const updateFormData = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (!formData.expenseDate) {
      newErrors.expenseDate = 'Date is required';
    }
    
    if (expenseMethod === 'amount') {
      if (!formData.expenseAmount) {
        newErrors.expenseAmount = 'Amount is required';
      } else if (isNaN(parseFloat(formData.expenseAmount)) || parseFloat(formData.expenseAmount) <= 0) {
        newErrors.expenseAmount = 'Please enter a valid amount';
      }
    } else if (expenseMethod === 'mileage') {
      if (!formData.odometerReading) {
        newErrors.odometerReading = 'Odometer reading is required';
      } else if (isNaN(parseFloat(formData.odometerReading)) || parseFloat(formData.odometerReading) < 0) {
        newErrors.odometerReading = 'Please enter a valid odometer reading';
      }
      
      if (!formData.businessMiles) {
        newErrors.businessMiles = 'Business miles is required';
      } else if (isNaN(parseFloat(formData.businessMiles)) || parseFloat(formData.businessMiles) <= 0) {
        newErrors.businessMiles = 'Please enter valid business miles';
      }
    }
    
    setErrors(newErrors);
    
    // Update step validation status
    const isValid = Object.keys(newErrors).length === 0;
    setStepValid(isValid);
    
    return isValid;
  };

  // Get type name
  const getTypeName = () => {
    if (!formData.expenseTypeId) return 'Not selected';
    const type = getTypeById(parseInt(formData.expenseTypeId));
    return type ? type.name : 'Not found';
  };

  // Get label name
  const getLabelName = () => {
    if (!formData.expenseLabelId || labels.length === 0) return 'Not selected';
    const label = labels.find(l => l.id.toString() === formData.expenseLabelId);
    return label ? (label.label_name || label.name) : 'Not found';
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Check if step is complete
  const isStepComplete = () => {
    if (!formData.expenseDate) return false;
    
    if (expenseMethod === 'amount') {
      if (!formData.expenseAmount) return false;
      if (isNaN(parseFloat(formData.expenseAmount)) || parseFloat(formData.expenseAmount) <= 0) return false;
    } else if (expenseMethod === 'mileage') {
      if (!formData.odometerReading || !formData.businessMiles) return false;
      if (isNaN(parseFloat(formData.odometerReading)) || parseFloat(formData.odometerReading) < 0) return false;
      if (isNaN(parseFloat(formData.businessMiles)) || parseFloat(formData.businessMiles) <= 0) return false;
    } else {
      return false; // No valid expense method
    }
    
    return true;
  };

  // Update the mileage summary display
  const renderMileageSummary = () => {
    if (formData.odometerReading && formData.businessMiles && !errors.odometerReading && !errors.businessMiles) {
      return (
        <div className="p-3 bg-blue-50 rounded-md border border-blue-100 mt-2">
          <h5 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
            <InfoIcon className="h-4 w-4 mr-1.5" />
            Mileage Summary
          </h5>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="grid grid-cols-2 gap-x-4 mb-1">
              <div>
                <span className="text-blue-700">Starting Reading:</span>
                <p className="font-medium">
                  {lastMileageInfo?.has_previous_mileage 
                    ? `${lastMileageInfo.last_odometer_reading} miles (Last recorded)`
                    : `${lastMileageInfo?.january_miles || 0} miles (January)`}
                </p>
              </div>
              <div>
                <span className="text-blue-700">Business Miles:</span>
                <p className="font-medium">{parseFloat(formData.businessMiles).toFixed(1)} miles</p>
              </div>
            </div>
            <div className="h-px bg-blue-200 my-1" />
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <span className="text-blue-700">Personal Miles:</span>
                <p className="font-medium">{formData.vehicleDetails?.personal_miles || '0.0'} miles</p>
              </div>
              <div>
                <span className="text-blue-700">Final Reading:</span>
                <p className="font-medium text-blue-900">
                  {(parseFloat(formData.odometerReading) + 
                    parseFloat(formData.businessMiles) + 
                    (lastMileageInfo?.has_previous_mileage ? parseFloat(formData.vehicleDetails?.personal_miles || 0) : 0)
                  ).toFixed(1)} miles
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with status */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Expense Details</h3>
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
        {expenseMethod === 'amount' 
          ? 'Enter the expense amount and date'
          : expenseMethod === 'mileage'
          ? 'Enter odometer reading, business miles, and date'
          : 'Complete the required expense information'}
      </p>

      {/* Main content grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Card */}
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
                {formData.range === 'vehicle' ? (
                  <Car className="h-5 w-5 text-blue-500" />
                ) : formData.range === 'home_office' ? (
                  <Home className="h-5 w-5 text-purple-500" />
                ) : formData.range === 'operation_expense' ? (
                  <Building className="h-5 w-5 text-emerald-500" />
                ) : (
                  null
                )}
                <CardTitle className="text-base">Expense Summary</CardTitle>
              </div>
              <CardDescription>
                Overview of your selected expense options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Range</Label>
                  <p className="font-medium flex items-center">
                    <Badge className={cn(
                      "mr-2",
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
                  </p>
                </div>
                
                {formData.range === 'vehicle' && formData.vehicleDetails && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Vehicle</Label>
                    <p className="text-sm font-medium flex items-center">
                      <Car className="h-4 w-4 text-blue-600 mr-1.5" />
                      {formData.vehicleDetails.vehicle_make || 'N/A'}
                    </p>
                  </div>
                )}
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Expense Type</Label>
                  <p className="text-sm font-medium flex items-center">
                    <Tag className="h-4 w-4 text-emerald-600 mr-1.5" />
                    {getTypeName()}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Expense Label</Label>
                  <p className="text-sm font-medium">{getLabelName()}</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Expense Method</Label>
                  <p className="text-sm">
                    <Badge 
                      className={cn(
                        expenseMethod === 'amount'
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : expenseMethod === 'mileage'
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : "bg-gray-100"
                      )}
                    >
                      {expenseMethod ? expenseMethod.charAt(0).toUpperCase() + expenseMethod.slice(1) : 'Not specified'}
                    </Badge>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Form Card */}
        <div className="lg:col-span-2">
          <Card className={cn(
            "border-l-4 h-full",
            expenseMethod === 'amount'
              ? "border-l-green-500"
              : expenseMethod === 'mileage'
                ? "border-l-blue-500"
                : "border-l-gray-300"
          )}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {expenseMethod === 'amount' ? (
                  <DollarSign className="h-5 w-5 text-green-500" />
                ) : expenseMethod === 'mileage' ? (
                  <MapPin className="h-5 w-5 text-blue-500" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-500" />
                )}
                <CardTitle className="text-base">
                  {expenseMethod === 'amount'
                    ? 'Amount Details'
                    : expenseMethod === 'mileage'
                      ? 'Mileage Details'
                      : 'Expense Details'}
                </CardTitle>
              </div>
              <CardDescription>
                {expenseMethod === 'amount'
                  ? 'Enter the expense amount and date'
                  : expenseMethod === 'mileage'
                    ? 'Enter your odometer reading and business miles'
                    : 'Enter the required details for your expense'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                {/* Date Field - Always Required */}
                <div className="space-y-2">
                  <Label htmlFor="expenseDate" className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-indigo-500 mr-1.5" />
                    Date <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="expenseDate"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white",
                          !formData.expenseDate && "text-muted-foreground",
                          errors.expenseDate && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expenseDate ? (
                          format(new Date(formData.expenseDate), "PPP")
                        ) : (
                          <span>Select date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.expenseDate ? new Date(formData.expenseDate) : undefined}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.expenseDate && (
                    <p className="text-xs text-destructive mt-1 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {errors.expenseDate}
                    </p>
                  )}
                </div>

                {/* Amount Field - Only for 'amount' expense method */}
                {expenseMethod === 'amount' && (
                  <div className="space-y-2">
                    <Label htmlFor="expenseAmount" className="flex items-center">
                      <DollarSign className="h-4 w-4 text-green-600 mr-1.5" />
                      Amount <span className="text-destructive ml-1">*</span>
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="expenseAmount"
                        name="expenseAmount"
                        type="number"
                        step="0.01"
                        value={formData.expenseAmount || ''}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className={cn(
                          "pl-9 bg-white",
                          errors.expenseAmount ? 'border-destructive' : ''
                        )}
                      />
                    </div>
                    {errors.expenseAmount && (
                      <p className="text-xs text-destructive mt-1 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {errors.expenseAmount}
                      </p>
                    )}
                  </div>
                )}

                {/* Mileage Fields - Only for 'mileage' expense method */}
                {expenseMethod === 'mileage' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="odometerReading" className="flex items-center">
                          <MapPin className="h-4 w-4 text-blue-600 mr-1.5" />
                          Last Odometer Reading <span className="text-destructive ml-1">*</span>
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="sr-only">Odometer info</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-blue-50 border-blue-200">
                              <p className="text-blue-800 text-sm">
                                {formData.vehicleDetails?.expenses?.length > 0
                                  ? "This reading is calculated as: Last recorded odometer"
                                  : "This reading is calculated as: January miles"}
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                This method follows standard accounting practices for vehicle expense tracking.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="odometerReading"
                          name="odometerReading"
                          type="number"
                          step="0.01"
                          value={formData.odometerReading || ''}
                          onChange={handleInputChange}
                          placeholder={initialOdometerReading || "Enter odometer reading"}
                          className={cn(
                            "pl-9 bg-white",
                            errors.odometerReading ? 'border-destructive' : ''
                          )}
                        />
                      </div>
                      {initialOdometerReading && (
                        <div className="p-2 bg-blue-50 rounded-md border border-blue-100 mt-2">
                          <p className="text-xs text-blue-700 flex items-center">
                            <InfoIcon className="h-3 w-3 mr-1" />
                            Suggested value: <span className="font-medium ml-1">{initialOdometerReading} miles</span>
                          </p>
                        </div>
                      )}
                      {errors.odometerReading && (
                        <p className="text-xs text-destructive mt-1 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {errors.odometerReading}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessMiles" className="flex items-center">
                        <Car className="h-4 w-4 text-blue-600 mr-1.5" />
                        Business Miles <span className="text-destructive ml-1">*</span>
                      </Label>
                      <div className="relative">
                        <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="businessMiles"
                          name="businessMiles"
                          type="number"
                          step="0.1"
                          value={formData.businessMiles || ''}
                          onChange={handleInputChange}
                          placeholder="0.0"
                          className={cn(
                            "pl-9 bg-white",
                            errors.businessMiles ? 'border-destructive' : ''
                          )}
                        />
                      </div>
                      {errors.businessMiles && (
                        <p className="text-xs text-destructive mt-1 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {errors.businessMiles}
                        </p>
                      )}
                    </div>
                    
                    {renderMileageSummary()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notes Card - Full width */}
      <div className="mt-6">
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-base">Additional Notes</CardTitle>
            </div>
            <CardDescription>
              Add any additional information about this expense
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="note" className="flex items-center">
                <FileText className="h-4 w-4 text-indigo-500 mr-1.5" />
                Note <span className="text-muted-foreground ml-1">(Optional)</span>
              </Label>
              <Textarea
                id="note"
                name="note"
                placeholder="Enter any additional notes about this expense..."
                value={formData.note || ''}
                onChange={handleInputChange}
                className="min-h-[100px] bg-white"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add details like: purpose of expense, who was present, or any other relevant information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Method Not Set Warning */}
      {!expenseMethod && (
        <div className="p-4 border rounded-md bg-amber-50 border-amber-200 animate-pulse mt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 text-sm mb-1">Expense Method Missing</h4>
              <p className="text-sm text-amber-700">
                Expense method not detected. Please go back to Step 2 and select a valid expense label.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Completion Message */}
      {isStepComplete() && (
        <div className="p-4 border rounded-md bg-green-50 border-green-200 mt-6">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800 text-sm mb-1">All Details Complete</h4>
              <p className="text-sm text-green-700">
                You've successfully entered all required expense details. 
                Continue to the next step to review your expense information.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3AccountSetup;