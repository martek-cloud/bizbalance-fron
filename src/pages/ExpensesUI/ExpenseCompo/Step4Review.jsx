// Step4Review.jsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertTriangle, Car, DollarSign, CalendarIcon, MapPin, Briefcase, Building, FileText } from 'lucide-react';
import { format } from 'date-fns';
import useExpenseTypeStore from '@/store/typeStore';
import useLabelStore from '@/store/labelStore';
import { cn } from '@/lib/utils';

const Step4Review = ({ formData }) => {
  const { getTypeById } = useExpenseTypeStore();
  const { labels } = useLabelStore();
  const [expenseMethod, setExpenseMethod] = useState(null);

  // Determine expense method from the selected label
  useEffect(() => {
    if (formData.expenseLabelId && labels.length > 0) {
      const selectedLabel = labels.find(
        label => label.id.toString() === formData.expenseLabelId
      );
      
      if (selectedLabel) {
        setExpenseMethod(selectedLabel.expense_method || selectedLabel.method);
      }
    }
  }, [formData.expenseLabelId, labels]);

  // Get selected expense type and label
  const selectedType = formData.expenseTypeId ? getTypeById(parseInt(formData.expenseTypeId)) : null;
  const selectedLabel = formData.expenseLabelId ? 
    labels.find(label => label.id.toString() === formData.expenseLabelId) : null;

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Not specified';
    try {
      return format(new Date(date), 'MMMM d, yyyy');
    } catch (error) {
      return date;
    }
  };

  // Format miles
  const formatMiles = (miles) => {
    if (!miles) return '0 miles';
    return `${parseFloat(miles).toFixed(1)} miles`;
  };

  // Get label name (handle different property structures)
  const getLabelName = () => {
    if (!selectedLabel) return 'Not selected';
    return selectedLabel.label_name || selectedLabel.name || 'Unknown label';
  };

  // Format range name for display
  const formatRangeName = (range) => {
    if (range === 'vehicle') return 'Vehicle';
    if (range === 'home_office') return 'Home Office';
    if (range === 'operation_expense') return 'Operation Expense';
    return 'Unknown Range';
  };

  // Check if we have all required information
  const isComplete = () => {
    // Basic checks for all expense types
    if (!formData.range || !formData.expenseTypeId || !formData.expenseLabelId || !formData.expenseDate) {
      return false;
    }
    
    // Vehicle-specific checks
    if (formData.range === 'vehicle' && !formData.vehicleId) {
      return false;
    }

    // Method-specific checks
    if (expenseMethod === 'amount' && !formData.expenseAmount) {
      return false;
    }
    
    if (expenseMethod === 'mileage' && (!formData.odometerReading || !formData.businessMiles)) {
      return false;
    }
    
    return true;
  };

  // Get status badge
  const getStatusBadge = () => {
    if (isComplete()) {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200 px-3">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          Ready to submit
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3">
          <AlertTriangle className="h-3.5 w-3.5 mr-1" />
          Incomplete
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with status */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          {isComplete() ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          )}
          <h3 className="text-lg font-medium">Review Your Expense</h3>
        </div>
        {getStatusBadge()}
      </div>

      {/* Main content grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Range and Vehicle Information */}
        <div className="lg:col-span-1">
          <Card className={cn(
            "border-l-4 h-full",
            formData.range === 'vehicle' ? "border-l-blue-500" : 
            formData.range === 'home_office' ? "border-l-purple-500" : 
            formData.range === 'operation_expense' ? "border-l-emerald-500" : 
            "border-l-gray-300"
          )}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {formData.range === 'vehicle' ? (
                  <Car className="h-5 w-5 text-blue-500" />
                ) : formData.range === 'home_office' ? (
                  <Briefcase className="h-5 w-5 text-purple-500" />
                ) : formData.range === 'operation_expense' ? (
                  <Building className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Briefcase className="h-5 w-5 text-gray-500" />
                )}
                <CardTitle className="text-base">Range & Vehicle</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Range Type</Label>
                  <p className="font-medium flex items-center">
                    <Badge className={cn(
                      "mr-2",
                      formData.range === 'vehicle' ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : 
                      formData.range === 'home_office' ? "bg-purple-100 text-purple-800 hover:bg-purple-100" : 
                      formData.range === 'operation_expense' ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : 
                      "bg-gray-100"
                    )}>
                      {formatRangeName(formData.range)}
                    </Badge>
                  </p>
                </div>

                {formData.range === 'vehicle' && formData.vehicleDetails && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Vehicle Make</Label>
                      <p className="font-medium">{formData.vehicleDetails.vehicle_make || 'Not specified'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Cost</Label>
                      <p className="font-medium flex items-center">
                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                        {formatCurrency(formData.vehicleDetails.cost)}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Ownership Type</Label>
                      <p className="font-medium">{formData.vehicleDetails.ownership_type || 'Not specified'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">In Service Since</Label>
                      <p className="font-medium">
                        {formData.vehicleDetails.date_placed_in_service ? 
                          formatDate(formData.vehicleDetails.date_placed_in_service) : 
                          'Not specified'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Category Information */}
        <div className="lg:col-span-1">
          <Card className="border-l-4 border-l-emerald-500 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-base">Expense Category</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Expense Type</Label>
                  <p className="font-medium">{selectedType?.name || 'Not selected'}</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Expense Label</Label>
                  <p className="font-medium">{getLabelName()}</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Expense Method</Label>
                  <div className="flex items-center">
                    <Badge className={cn(
                      expenseMethod === 'amount' ? "bg-green-100 text-green-800 hover:bg-green-100" :
                      expenseMethod === 'mileage' ? "bg-blue-100 text-blue-800 hover:bg-blue-100" :
                      "bg-gray-100 text-gray-800"
                    )}>
                      {expenseMethod ? expenseMethod.charAt(0).toUpperCase() + expenseMethod.slice(1) : 'Not specified'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Direct/Indirect</Label>
                  <div className="flex items-center">
                    <Badge className={cn(
                      formData.method === 'direct' ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" :
                      formData.method === 'indirect' ? "bg-amber-100 text-amber-800 hover:bg-amber-100" :
                      "bg-gray-100 text-gray-800"
                    )}>
                      {formData.method ? formData.method.charAt(0).toUpperCase() + formData.method.slice(1) : 'Direct'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Expense Details - Full width */}
      <div className="mt-4">
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-base">Expense Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Date</Label>
                <p className="font-medium flex items-center">
                  <CalendarIcon className="h-4 w-4 text-indigo-500 mr-2" />
                  {formatDate(formData.expenseDate)}
                </p>
              </div>
              
              {expenseMethod === 'amount' && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Amount</Label>
                  <p className="font-medium flex items-center">
                    <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                    {formatCurrency(formData.expenseAmount)}
                  </p>
                </div>
              )}
              
              {expenseMethod === 'mileage' && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Odometer Reading</Label>
                    <p className="font-medium flex items-center">
                      <MapPin className="h-4 w-4 text-blue-600 mr-1" />
                      {formatMiles(formData.odometerReading)}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Business Miles</Label>
                    <p className="font-medium flex items-center">
                      <Car className="h-4 w-4 text-blue-600 mr-1" />
                      {formatMiles(formData.businessMiles)}
                    </p>
                  </div>
                  
                  {/* Detailed mileage breakdown */}
                  {formData.businessMiles && (
                    <div className="space-y-1 md:col-span-2 bg-indigo-50 p-3 rounded-md">
                      <Label className="text-xs font-medium text-indigo-800">Mileage Summary</Label>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className="grid grid-cols-2 gap-x-4 mb-1">
                          <div>
                            <span className="text-blue-700">Starting Reading:</span>
                            <p className="font-medium">
                              {formData.startingOdometerReading} miles
                              {formData.lastMileageInfo?.has_previous_mileage 
                                ? " (Last recorded)" 
                                : " (January)"}
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
                                parseFloat(formData.vehicleDetails?.personal_miles || 0)
                              ).toFixed(1)} miles
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note Section - Only shown if there's a note */}
      {formData.note && (
        <div className="mt-4">
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-base">Additional Notes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Note</Label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                  <p className="text-sm whitespace-pre-wrap">{formData.note}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submission Notice */}
      <div className="p-4 border rounded-md bg-muted/30 border-l-4 border-l-amber-500 mt-6">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm mb-1">Important Notice</h4>
            <p className="text-sm text-muted-foreground">
              Please review all information above carefully before submitting. 
              Once submitted, this expense will be recorded and cannot be easily modified.
            </p>
          </div>
        </div>
      </div>
      
      {/* Missing Information Warning (if incomplete) */}
      {!isComplete() && (
        <div className="p-4 border rounded-md bg-red-50 border-red-200 mt-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800 text-sm mb-1">Missing Information</h4>
              <p className="text-sm text-red-700">
                Your expense is incomplete. Please go back to previous steps and fill in all required fields.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4Review;