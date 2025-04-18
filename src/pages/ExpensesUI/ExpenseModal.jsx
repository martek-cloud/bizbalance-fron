import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, startOfMonth } from 'date-fns';
import useExpenseTypeStore from '@/store/typeStore';
import useLabelStore from '@/store/labelStore';
import { toast } from 'react-hot-toast';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Trash2, Eye, PlusCircle, Download } from "lucide-react";
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
import { cn } from "@/lib/utils";

const ExpenseModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  mode = 'add', // 'add' or 'view'
  label,
  month,
  range = 'general',
  type_id = '',
  label_id = '',
  existingExpenses = [],
  initialData = null,
  onDeleteExpense = () => {},
  onViewExpenseDetails = () => {},
  // New props for direct data
  typeData = null,
  labelData = null,
  date = null
}) => {
  const { types, fetchTypes } = useExpenseTypeStore();
  const { labels, fetchLabelsByType } = useLabelStore();
  const [selectedType, setSelectedType] = useState(typeData);
  const [selectedLabel, setSelectedLabel] = useState(labelData);
  const [isLoading, setIsLoading] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    date: date || initialData?.date || format(startOfMonth(new Date(month)), 'yyyy-MM-dd'),
    amount: initialData?.amount || '',
    note: initialData?.note || '',
    range: range,
    expense_type_id: type_id || '',
    expense_label_id: label_id || '',
    expense_method: 'amount',
    method: 'direct',
    receipt: initialData?.receipt || null
  });

  // Only fetch types if we don't have the type data directly
  useEffect(() => {
    const loadData = async () => {
      // If we already have the type and label data, no need to fetch
      if (typeData && labelData) {
        setSelectedType(typeData);
        setSelectedLabel(labelData);
        setFormData(prev => ({
          ...prev,
          expense_type_id: typeData.id,
          expense_label_id: labelData.id
        }));
        return;
      }
      
      // If we have type_id and label_id, use those directly
      if (type_id && label_id) {
        setFormData(prev => ({
          ...prev,
          expense_type_id: type_id,
          expense_label_id: label_id
        }));
        return;
      }
      
      // Only fetch types if we don't have them yet
      if (types.length === 0) {
        setIsLoading(true);
        try {
          await fetchTypes();
        } catch (error) {
          console.error('Error fetching types:', error);
          toast.error('Failed to load expense types');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, [fetchTypes, typeData, labelData, type_id, label_id, types.length]);

  // Find the type and label based on the IDs or label name
  useEffect(() => {
    // Skip this effect if we already have the type and label data
    if (typeData && labelData) {
      return;
    }
    
    // Skip if we don't have a label to search for
    if (!label) {
      return;
    }
    
    // If we have types and labels, try to find the matching ones
    if (types.length > 0 && labels.length > 0) {
      // First, check if we already have the label in our existing labels
      const existingLabel = labels.find(l => l.label_name === label);
      if (existingLabel) {
        const type = types.find(t => t.id === existingLabel.type_id);
        if (type) {
          setSelectedType(type);
          setSelectedLabel(existingLabel);
          setFormData(prev => ({
            ...prev,
            expense_type_id: type.id,
            expense_label_id: existingLabel.id
          }));
          return;
        }
      }
      
      // If not found in existing labels, check if we have the type
      const type = types.find(t => t.type_name === type);
      if (type) {
        // We found the type, but need to fetch its labels
        setIsLoading(true);
        fetchLabelsByType(type.id)
          .then(() => {
            const typeLabels = labels.filter(l => l.type_id === type.id);
            const matchingLabel = typeLabels.find(l => l.label_name === label);
            
            if (matchingLabel) {
              setSelectedType(type);
              setSelectedLabel(matchingLabel);
              setFormData(prev => ({
                ...prev,
                expense_type_id: type.id,
                expense_label_id: matchingLabel.id
              }));
            }
          })
          .catch(error => {
            console.error('Error fetching labels for type:', type.id, error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  }, [label, types, labels, typeData, labelData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });

      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        console.log('Invalid file type:', file.type);
        toast.error("Invalid file type. Please upload a JPEG, PNG, or PDF file.");
        return;
      }

      if (file.size > maxSize) {
        console.log('File too large:', file.size);
        toast.error("File size too large. Maximum size is 5MB.");
        return;
      }

      console.log('File validation passed, updating formData');
      setFormData(prev => {
        const newFormData = {
          ...prev,
          receipt: file
        };
        console.log('Updated formData:', newFormData);
        return newFormData;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simply pass the form data to the onSubmit prop
    // The actual submission logic is handled in MonthlyExpensesView.jsx
    await onSubmit(formData);
    onClose();
  };

  // Format the range for display
  const formatRange = (range) => {
    switch(range) {
      case 'vehicle':
        return 'Vehicle';
      case 'home_office':
        return 'Home Office';
      case 'general':
      case 'operation_expense':
        return 'Operation Expenses';
      default:
        return range;
    }
  };

  const handleDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (expenseToDelete) {
      onDeleteExpense(expenseToDelete);
      setShowDeleteConfirmation(false);
      setExpenseToDelete(null);
    }
  };

  const handleViewExpenseDetails = (expense) => {
    onViewExpenseDetails(expense);
  };

  const handleDownloadReceipt = async (expense) => {
    if (!expense.receipt_url) {
      toast.error("No receipt available for this expense");
      return;
    }

    try {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = expense.receipt_url;
      link.setAttribute('download', `receipt-${expense.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Receipt download started");
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {mode === 'add' ? 'Add Expense' : 'Expense Details'}
            </DialogTitle>
          </DialogHeader>
          
          {mode === 'view' && existingExpenses && existingExpenses.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{label} - {format(month, 'MMMM yyyy')}</h3>
              </div>
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Expense Entries</h4>
                <div className="space-y-2">
                  {existingExpenses.map((expense, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <p className="font-medium">${expense.amount}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(expense.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewExpenseDetails(expense)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDownloadReceipt(expense)}
                          title={expense.receipt_url ? "Download Receipt" : "No receipt available"}
                          disabled={!expense.receipt_url}
                          className={!expense.receipt_url ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hidden fields for range, type_id, and label_id */}
              <input 
                type="hidden" 
                name="range" 
                value={formData.range} 
              />
              <input 
                type="hidden" 
                name="expense_type_id" 
                value={formData.expense_type_id} 
              />
              <input 
                type="hidden" 
                name="expense_label_id" 
                value={formData.expense_label_id} 
              />
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(new Date(formData.date), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="z-[150]">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => {
                          if (date) {
                            setFormData(prev => ({ 
                              ...prev, 
                              date: format(date, 'yyyy-MM-dd')  // Format date as YYYY-MM-DD
                            }));
                            setDatePickerOpen(false);
                          }
                        }}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Add a note about this expense"
                />
              </div>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="receipt">Receipt/Proof (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="receipt"
                      type="file"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="flex-1"
                    />
                    {formData.receipt && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, receipt: null }))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Accepted formats: JPEG, PNG, PDF (max 5MB)
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense
              of ${expenseToDelete?.amount} from {expenseToDelete?.date ? format(new Date(expenseToDelete.date), 'MMM d, yyyy') : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ExpenseModal; 