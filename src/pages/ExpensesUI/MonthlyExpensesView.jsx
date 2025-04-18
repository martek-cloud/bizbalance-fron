import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Eye, PlusCircle, Download, Search, ChevronRight } from "lucide-react";
import useMainExpenseStore from "@/store/expenseStore";
import useExpenseTypeStore from "@/store/typeStore";
import useLabelStore from "@/store/labelStore";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, startOfYear, endOfYear, parseISO } from "date-fns";
import ExpenseModal from './ExpenseModal';
import axios from "@/lib/axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AddLabelModal from './AddLabelModal';
import { toast } from "react-hot-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Cookies from "js-cookie";
import { Transition } from "@headlessui/react";

// Fallback data for when API calls fail
const fallbackTypes = [
  { id: 1, type_name: "Vehicle Expenses" },
  { id: 2, type_name: "Home Office Expenses" },
  { id: 3, type_name: "General Expenses" }
];

const fallbackLabels = [
  { id: 1, type_id: 1, label_name: "Gas" },
  { id: 2, type_id: 1, label_name: "Maintenance" },
  { id: 3, type_id: 1, label_name: "Insurance" },
  { id: 4, type_id: 2, label_name: "Rent" },
  { id: 5, type_id: 2, label_name: "Utilities" },
  { id: 6, type_id: 2, label_name: "Furniture" },
  { id: 7, type_id: 3, label_name: "Office Supplies" },
  { id: 8, type_id: 3, label_name: "Software" },
  { id: 9, type_id: 3, label_name: "Travel" }
];

// Sample expense data for fallback
const generateFallbackExpenses = () => {
  const currentYear = new Date().getFullYear();
  const expenses = [];

  // Generate expenses for each month
  for (let month = 0; month < 12; month++) {
    const date = new Date(currentYear, month, 15); // 15th of each month

    // Add some expenses for each type and label
    fallbackTypes.forEach(type => {
      const typeLabels = fallbackLabels.filter(label => label.type_id === type.id);

      typeLabels.forEach(label => {
        // Randomly decide if this label has an expense this month
        if (Math.random() > 0.3) { // 70% chance of having an expense
          const amount = Math.floor(Math.random() * 1000) + 50; // Random amount between 50 and 1050

          expenses.push({
            id: `fallback-${type.id}-${label.id}-${month}`,
            type: type.type_name,
            label: label.label_name,
            amount,
            date: date.toISOString(),
            note: `Sample ${label.label_name} expense for ${format(date, 'MMMM yyyy')}`,
            expense_method: 'amount',
            method: 'direct',
            range: type.type_name.toLowerCase().includes('vehicle') ? 'vehicle' :
              type.type_name.toLowerCase().includes('home office') ? 'home_office' : 'general',
            type_id: type.id,
            label_id: label.id
          });
        }
      });
    });
  }

  return expenses;
};

const MonthlyExpensesView = () => {
  const { expenses, loading, fetchExpenses, addExpense } = useMainExpenseStore();
  const { types, fetchTypes } = useExpenseTypeStore();
  const { labels, fetchLabelsByType } = useLabelStore();
  const [groupedExpenses, setGroupedExpenses] = useState({});
  const [months, setMonths] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedCell, setSelectedCell] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [allLabels, setAllLabels] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [completeStructure, setCompleteStructure] = useState({});
  const [apiError, setApiError] = useState(false);
  const [fallbackExpenses, setFallbackExpenses] = useState([]);
  const [activeRange, setActiveRange] = useState('operation_expense');
  const [ranges, setRanges] = useState(['vehicle', 'home_office', 'operation_expense']);
  const [addLabelModal, setAddLabelModal] = useState({ isOpen: false, typeId: '', typeName: '' });
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [expenseDetails, setExpenseDetails] = useState(null);
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);
  const [collapsedTypes, setCollapsedTypes] = useState(new Set());

  // Initialize months for the current year
  useEffect(() => {
    const yearStart = startOfYear(new Date(currentYear, 0));
    const yearEnd = endOfYear(new Date(currentYear, 0));
    const monthsInYear = eachMonthOfInterval({ start: yearStart, end: yearEnd });
    setMonths(monthsInYear);
  }, [currentYear]);

  // Generate fallback expenses
  useEffect(() => {
    setFallbackExpenses(generateFallbackExpenses());
  }, []);

  // Fetch all data at once
  const fetchAllData = async () => {
    setIsLoadingData(true);
    setApiError(false);
    
    try {
      // Try to fetch data from the API using the correct endpoints
      const [expensesRes, typesRes, labelsRes] = await Promise.all([
        axios.get('/api/main-expenses'),
        axios.get('/api/expense-types'),
        axios.get('/api/expense-labels')
      ]);
      
      console.log('API responses:', {
        expenses: expensesRes.data,
        types: typesRes.data,
        labels: labelsRes.data
      });
      
      // Transform the data to ensure it has the correct structure
      const transformedExpenses = expensesRes.data.map(expense => {
        // Determine the range based on the expense data
        let range = expense.range;
        
        // If range is not explicitly set, determine it from the type
        if (!range && expense.type) {
          const typeName = expense.type.type_name || expense.type_name || '';
          
          if (typeName.toLowerCase().includes('vehicle') && !typeName.toLowerCase().includes('mileage')) {
            range = 'vehicle';
          } else if ((typeName.toLowerCase().includes('home office') || 
                    typeName.toLowerCase().includes('homeoffice') || 
                    typeName.toLowerCase().includes('office')) &&
                    !typeName.toLowerCase().includes('basis')) {
            range = 'home_office';
          } else {
            range = 'operation_expense';
          }
        }
        
        return {
          ...expense,
          type: expense.type?.type_name || expense.type_name || 'Unknown Type',
          label: expense.label?.label_name || expense.label_name || 'Unknown Label',
          amount: parseFloat(expense.amount) || 0,
          date: expense.date || new Date().toISOString(),
          range: range || 'operation_expense' // Default to operation_expense if no range is determined
        };
      });
      
      const transformedTypes = typesRes.data.map(type => {
        // Determine the range based on the type name
        let range = type.range;
        
        if (!range) {
          const typeName = type.type_name || type.name || '';
          
          if (typeName.toLowerCase().includes('vehicle') && !typeName.toLowerCase().includes('mileage')) {
            range = 'vehicle';
          } else if ((typeName.toLowerCase().includes('home office') || 
                    typeName.toLowerCase().includes('homeoffice') || 
                    typeName.toLowerCase().includes('office')) &&
                    !typeName.toLowerCase().includes('basis')) {
            range = 'home_office';
          } else {
            range = 'operation_expense';
          }
        }
        
        return {
          id: type.id,
          type_name: type.type_name || type.name || 'Unknown Type',
          range: range || 'operation_expense' // Default to operation_expense if no range is determined
        };
      });
      
      const transformedLabels = labelsRes.data.map(label => ({
        id: label.id,
        type_id: label.type_id || label.expense_type_id,
        label_name: label.label_name || label.name || 'Unknown Label'
      }));
      
      console.log('Transformed data:', {
        expenses: transformedExpenses,
        types: transformedTypes,
        labels: transformedLabels
      });
      
      // Update the stores with the transformed data
      useMainExpenseStore.setState({ expenses: transformedExpenses, loading: false });
      useExpenseTypeStore.setState({ types: transformedTypes, loading: false });
      setAllLabels(transformedLabels);
    } catch (error) {
      console.error('Error fetching data:', error);
      setApiError(true);
      
      // Use fallback data when API calls fail
      useMainExpenseStore.setState({ expenses: fallbackExpenses, loading: false });
      useExpenseTypeStore.setState({ types: fallbackTypes, loading: false });
      setAllLabels(fallbackLabels);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fetch all data at once
  useEffect(() => {
    fetchAllData();
  }, [fallbackExpenses]);

  // Create a complete structure with all types and labels
  useEffect(() => {
    if (types.length === 0 || allLabels.length === 0) {
      console.log('Types or labels are empty:', { types, allLabels });
      return;
    }

    console.log('Creating structure with types:', types);
    console.log('Creating structure with labels:', allLabels);

    // Create a structure with all types and their labels
    const structure = {};

    // Initialize with all types
    types.forEach(type => {
      if (!type || !type.type_name) {
        console.warn('Invalid type object:', type);
        return;
      }

      structure[type.type_name] = {};

      // Find all labels for this type
      const typeLabels = allLabels.filter(label => label && label.type_id === type.id);
      console.log(`Labels for type ${type.type_name}:`, typeLabels);

      // Initialize with all labels for this type
      typeLabels.forEach(label => {
        if (!label || !label.label_name) {
          console.warn('Invalid label object:', label);
          return;
        }

        structure[type.type_name][label.label_name] = {
          total: 0,
          monthly: {},
          entries: {}
        };
      });
    });

    console.log('Created structure:', structure);
    setCompleteStructure(structure);
  }, [types, allLabels]);

  // Group expenses by range, type, and label
  useEffect(() => {
    if (Object.keys(completeStructure).length === 0) {
      console.log('Complete structure is empty');
      return;
    }

    console.log('Grouping expenses with structure:', completeStructure);
    console.log('Expenses to group:', expenses);

    // Create a deep copy of the complete structure
    const grouped = JSON.parse(JSON.stringify(completeStructure));

    // Add expenses to the structure
    expenses.forEach(expense => {
      if (!expense || !expense.type || !expense.label) {
        console.warn('Invalid expense object:', expense);
        return;
      }

      const { type, label, amount, date, range } = expense;
      const monthKey = format(new Date(date), 'yyyy-MM');

      // Only add if the type and label exist in our structure
      if (grouped[type] && grouped[type][label]) {
        grouped[type][label].total += amount;
        grouped[type][label].monthly[monthKey] = (grouped[type][label].monthly[monthKey] || 0) + amount;

        if (!grouped[type][label].entries[monthKey]) {
          grouped[type][label].entries[monthKey] = [];
        }
        grouped[type][label].entries[monthKey].push(expense);
      } else {
        console.warn(`Type "${type}" or label "${label}" not found in structure`);
      }
    });

    console.log('Grouped expenses result:', grouped);
    setGroupedExpenses(grouped);
  }, [expenses, completeStructure]);

  // Filter types by range
  const getTypesByRange = (range) => {
    // Debug: Log all types to see what we're working with
    console.log('All types:', Object.keys(groupedExpenses));
    
    const filteredTypes = Object.keys(groupedExpenses).filter(type => {
      // Get the range from the expense type if available
      const typeRange = types.find(t => t.type_name === type)?.range;
      
      // If the type has a range property, use that for filtering
      if (typeRange) {
        console.log(`Type "${type}" has explicit range: ${typeRange}`);
        
        // Exclude "Basis" type from home_office range
        if (typeRange === 'home_office' && type.toLowerCase().includes('basis')) {
          console.log(`Type "${type}" excluded from home_office range (Basis type)`);
          return false;
        }
        
        // Exclude "Mileage" type from vehicle range
        if (typeRange === 'vehicle' && type.toLowerCase().includes('mileage')) {
          console.log(`Type "${type}" excluded from vehicle range (Mileage type)`);
          return false;
        }
        
        return typeRange === range;
      }
      
      // Otherwise, determine the range based on the type name
      if (range === 'vehicle' && 
          type.toLowerCase().includes('vehicle') && 
          !type.toLowerCase().includes('mileage')) {
        console.log(`Type "${type}" assigned to vehicle range`);
        return true;
      } else if (range === 'home_office' && 
                (type.toLowerCase().includes('home office') || 
                 type.toLowerCase().includes('homeoffice') || 
                 type.toLowerCase().includes('office')) &&
                !type.toLowerCase().includes('basis')) {
        console.log(`Type "${type}" assigned to home_office range`);
        return true;
      } else if (range === 'operation_expense' && 
                !type.toLowerCase().includes('vehicle') && 
                !type.toLowerCase().includes('home office') && 
                !type.toLowerCase().includes('homeoffice') && 
                !type.toLowerCase().includes('office')) {
        console.log(`Type "${type}" assigned to operation_expense range`);
        return true;
      }
      return false;
    });
    
    console.log(`Types for range "${range}":`, filteredTypes);
    return filteredTypes;
  };

  // Add this effect to initialize collapsed state for all types
  useEffect(() => {
    if (types.length > 0) {
      // Get filtered types based on active range
      const filteredTypes = getTypesByRange(activeRange);
      
      // Create a new Set with all type names except the first one
      const allTypes = new Set(filteredTypes);
      if (filteredTypes.length > 0) {
        const firstType = filteredTypes[0];
        allTypes.delete(firstType); // Remove the first type from the collapsed set
      }
      setCollapsedTypes(allTypes);
    }
  }, [types, activeRange]); // Add activeRange as a dependency

  if (loading || isLoadingData) {
    return (
      <Card className="m-4 p-4">
        <div className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleCellClick = (type, label, month) => {
    // Check if the month is in the future
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const isFutureMonth = month > currentMonth;
    
    // If it's a future month, don't allow adding expenses
    if (isFutureMonth) {
      toast.error("Cannot add expenses for future months");
      return;
    }
    
    const monthKey = format(month, 'yyyy-MM');
    const cellData = groupedExpenses[type]?.[label];
    const amount = cellData?.monthly[monthKey] || 0;
    const entries = cellData?.entries?.[monthKey] || [];

    // Find the type ID and label ID using the allLabels array
    let typeId = '';
    let labelId = '';
    let typeObj = null;
    let labelObj = null;

    // Find the type that contains this label
    for (const expenseType of types) {
      const typeLabels = allLabels.filter(l => l.type_id === expenseType.id);
      const matchingLabel = typeLabels.find(l => l.label_name === label);

      if (matchingLabel) {
        typeId = expenseType.id;
        labelId = matchingLabel.id;
        typeObj = expenseType;
        labelObj = matchingLabel;
        break;
      }
    }

    // Determine the range based on the type
    let range = 'operation_expense'; // Default range
    
    // If the type has a range property, use that
    if (typeObj && typeObj.range) {
      range = typeObj.range;
    } 
    // Otherwise determine based on type name
    else if (type.toLowerCase().includes('vehicle') && !type.toLowerCase().includes('mileage')) {
      range = 'vehicle';
    } else if (type.toLowerCase().includes('home office') || 
               type.toLowerCase().includes('homeoffice') || 
               type.toLowerCase().includes('office')) {
      range = 'home_office';
    }

    setSelectedCell({ type, label, month, range });
    setModalData({
      mode: amount > 0 ? 'view' : 'add',
      label,
      month,
      range,
      expense_type_id: typeId,
      expense_label_id: labelId,
      existingExpenses: entries,
      typeData: typeObj,
      labelData: labelObj,
      date: format(month, 'yyyy-MM-dd')
    });
  };

  const handleExpenseSubmit = async (expenseData) => {
    try {
      console.log('Starting expense submission process');
      console.log('Initial expense data:', {
        ...expenseData,
        receipt: expenseData.receipt ? {
          name: expenseData.receipt.name,
          type: expenseData.receipt.type,
          size: expenseData.receipt.size
        } : null
      });

      // Debug authentication status
      const sessionToken = sessionStorage.getItem('session_token');
      const cookieToken = Cookies.get('auth_token');
      console.log('Auth status:', {
        hasSessionToken: !!sessionToken,
        hasCookieToken: !!cookieToken
      });
      
      // Create FormData object to handle file upload
      const formData = new FormData();
      
      // Add all expense data fields
      formData.append('expense_range', expenseData.range);
      formData.append('expense_type_id', expenseData.expense_type_id);
      formData.append('expense_label_id', expenseData.expense_label_id);
      
      // Only include vehicle_id if the range is 'vehicle'
      if (expenseData.range === 'vehicle') {
        formData.append('vehicle_id', expenseData.vehicle_id || '');
      }
      
      formData.append('computable', expenseData.computable);
      formData.append('expense_method', expenseData.expense_method);
      formData.append('method', expenseData.method || 'direct');
      formData.append('amount', expenseData.expense_method === 'amount' ? expenseData.amount : '');
      formData.append('mileage', expenseData.expense_method === 'mileage' ? expenseData.mileage : '');
      formData.append('personal_miles', expenseData.expense_method === 'mileage' ? expenseData.personal_miles : '');
      formData.append('personal_use_percentage', expenseData.expense_method === 'mileage' ? expenseData.personal_use_percentage : '');
      formData.append('business_use_percentage', expenseData.expense_method === 'mileage' ? expenseData.business_use_percentage : '');
      formData.append('business_miles', expenseData.expense_method === 'mileage' ? expenseData.business_miles : '');
      formData.append('date', expenseData.date);
      formData.append('odometer_reading', expenseData.expense_method === 'mileage' ? expenseData.odometer_reading : '');
      formData.append('starting_odometer', expenseData.expense_method === 'mileage' ? expenseData.startingOdometerReading : '');
      formData.append('note', expenseData.note || '');

      // Add receipt file if present
      if (expenseData.receipt) {
        console.log('Adding receipt file to FormData:', {
          name: expenseData.receipt.name,
          type: expenseData.receipt.type,
          size: expenseData.receipt.size
        });
        formData.append('receipt', expenseData.receipt);
      }

      // Log the complete FormData contents
      console.log('Final FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1] instanceof File ? {
          name: pair[1].name,
          type: pair[1].type,
          size: pair[1].size
        } : pair[1]);
      }

      // Send the request with multipart/form-data content type
      const response = await axios.post('/api/main-expenses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status >= 200 && response.status < 300) {
        // Refresh the data to update the table
        await fetchAllData();
        setModalData(null);
        toast.success('Expense added successfully');
      } else {
        console.error('Unexpected response status:', response.status);
        throw new Error('Failed to add expense: Unexpected response status');
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : 'No response',
        request: error.request ? 'Request made but no response' : 'No request'
      });
      
      let errorMessage = 'Failed to add expense. Please try again. ';
      console.log('Error response:', error);
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
          window.location.href = '/auth/login';
          return;
        }
        if (error.response.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.errors) {
            const errorMessages = Object.values(error.response.data.errors).flat();
            errorMessage = errorMessages.join(', ');
          }
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDeleteExpense = async (expense) => {
    try {
      // Call the API to delete the expense
      const response = await axios.delete(`/api/main-expenses/${expense.id}`);
      
      if (response.status >= 200 && response.status < 300) {
        // Refresh the data to update the table
        await fetchAllData();
        
        // Show success message
        toast.success('Expense deleted successfully');
      } else {
        throw new Error('Failed to delete expense: Unexpected response status');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      
      // Extract error message from the response if available
      let errorMessage = 'Failed to delete expense. Please try again.';
      if (error.response) {
        console.log('Error response:', error.response);
        if (error.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
          // Redirect to login page using direct URL instead of route name
          window.location.href = '/auth/login';
          return;
        }
        if (error.response.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.errors) {
            const errorMessages = Object.values(error.response.data.errors).flat();
            errorMessage = errorMessages.join(', ');
          }
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleViewExpenseDetails = (expense) => {
    setExpenseDetails(expense);
    setShowExpenseDetails(true);
  };

  const handleDownloadReceipt = async (expense) => {
    if (!expense.receipt_url) {
      toast.error("No receipt available for this expense");
      return;
    }

    try {
      // Open the receipt URL in a new tab
      window.open(expense.receipt_url, '_blank');
      toast.success("Receipt opened in new tab");
    } catch (error) {
      console.error("Error opening receipt:", error);
      toast.error("Failed to open receipt");
    }
  };

  const handleLabelSubmit = async (newLabel) => {
    try {
      // Refresh the labels data
      const labelsRes = await axios.get('/api/expense-labels');
      setAllLabels(labelsRes.data);
      
      // Refresh the types data to ensure we have the latest information
      const typesRes = await axios.get('/api/expense-types');
      useExpenseTypeStore.setState({ types: typesRes.data, loading: false });
      
      // Close the modal
      setAddLabelModal({ isOpen: false, typeId: '', typeName: '' });
    } catch (error) {
      console.error('Error refreshing data after adding label:', error);
      
      // Handle authentication errors
      if (error.response && error.response.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        window.location.href = '/auth/login';
        return;
      }
      
      // Show other errors
      toast.error('Failed to refresh data. Please try again.');
    }
  };

  // Debug information
  console.log('Months:', months);
  console.log('Complete Structure:', completeStructure);
  console.log('Grouped Expenses:', groupedExpenses);

  const getTypeColor = (type, range) => {
    // Define color schemes for different ranges
    const colors = {
      operation_expense: {
        bg: 'bg-blue-50/50',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100/50',
        text: 'text-blue-900'
      },
      vehicle: {
        bg: 'bg-orange-50/50',
        border: 'border-orange-200',
        hover: 'hover:bg-orange-100/50',
        text: 'text-orange-900'
      },
      home_office: {
        bg: 'bg-green-50/50',
        border: 'border-green-200',
        hover: 'hover:bg-green-100/50',
        text: 'text-green-900'
      }
    };

    // Determine the range based on type name if not provided
    let typeRange = range;
    if (!typeRange) {
      if (type.toLowerCase().includes('vehicle')) {
        typeRange = 'vehicle';
      } else if (type.toLowerCase().includes('home office') || type.toLowerCase().includes('office')) {
        typeRange = 'home_office';
      } else {
        typeRange = 'operation_expense';
      }
    }

    return colors[typeRange] || colors.operation_expense;
  };

  // Add this function to handle collapse toggle
  const toggleTypeCollapse = (type) => {
    setCollapsedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  // Update the renderExpenseTable function
  const renderExpenseTable = (range) => {
    const filteredTypes = getTypesByRange(range);
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    if (filteredTypes.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No expenses found for this range.
          <div className="text-sm mt-2">
            {range === 'home_office' ?
              "If you believe there should be Home Office expenses, check that your expense types include 'home office', 'homeoffice', or 'office' in their names." :
              range === 'vehicle' ?
                "If you believe there should be Vehicle expenses, check that your expense types include 'vehicle' in their names." :
                "If you believe there should be Operation expenses, check that your expense types don't include 'vehicle', 'home office', 'homeoffice', or 'office' in their names."}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full space-y-6">
        {filteredTypes.map((type) => {
          const hasLabels = groupedExpenses[type] && Object.keys(groupedExpenses[type]).length > 0;
          const typeColors = getTypeColor(type, activeRange);
          const typeTotal = Object.values(groupedExpenses[type] || {}).reduce((sum, data) => sum + data.total, 0);
          const isCollapsed = collapsedTypes.has(type);
          
          return (
            <div key={type} className={`border rounded-lg ${typeColors.border} overflow-hidden`}>
              <Table>
                <TableHeader>
                  <TableRow 
                    className={`${typeColors.bg} cursor-pointer group`}
                    onClick={() => toggleTypeCollapse(type)}
                  >
                    {isCollapsed ? (
                      <>
                        <TableHead className={`w-full font-semibold ${typeColors.text} px-4`} colSpan={months.length + 2}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ChevronRight 
                                className={`h-4 w-4 transition-transform duration-300 ease-in-out`}
                              />
                              {type}
                            </div>
                            <div className="transition-opacity duration-300 ease-in-out">
                              Total: {formatCurrency(typeTotal)}
                            </div>
                          </div>
                        </TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className={`w-[160px] font-semibold ${typeColors.text} px-4`}>
                          <div className="flex items-center gap-2">
                            <ChevronRight 
                              className={`h-4 w-4 transition-transform duration-300 ease-in-out rotate-90`}
                            />
                            {type}
                          </div>
                        </TableHead>
                        {months.map((month) => {
                          const isFutureMonth = month > currentMonth;
                          const monthTotal = Object.values(groupedExpenses[type] || {}).reduce((sum, data) => {
                            const monthKey = format(month, 'yyyy-MM');
                            return sum + (data.monthly[monthKey] || 0);
                          }, 0);
                          
                          return (
                            <TableHead 
                              key={format(month, 'yyyy-MM')}
                              className={`w-[90px] text-right px-2 font-medium ${
                                isFutureMonth ? 'text-muted-foreground' : typeColors.text
                              }`}
                            >
                              <div>{format(month, 'MMM')}</div>
                              {monthTotal > 0 && (
                                <div className="text-xs">{formatCurrency(monthTotal)}</div>
                              )}
                            </TableHead>
                          );
                        })}
                        <TableHead className={`w-[100px] text-right px-2 font-semibold ${typeColors.text}`}>
                          <div>Total</div>
                          <div>{formatCurrency(typeTotal)}</div>
                        </TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>

                <Transition
                  show={!isCollapsed}
                  enter="transition-all duration-300 ease-in-out overflow-hidden"
                  enterFrom="transform opacity-0 max-h-0"
                  enterTo="transform opacity-100 max-h-[500px]"
                  leave="transition-all duration-300 ease-in-out overflow-hidden"
                  leaveFrom="transform opacity-100 max-h-[500px]"
                  leaveTo="transform opacity-0 max-h-0"
                  as={TableBody}
                  className="divide-y"
                >
                  {hasLabels ? (
                    <>
                      {Object.entries(groupedExpenses[type] || {}).map(([label, data]) => (
                        <Transition.Child
                          key={`${type}-${label}`}
                          enter="transition-all duration-300 ease-in-out delay-[50ms]"
                          enterFrom="transform -translate-y-2 opacity-0"
                          enterTo="transform translate-y-0 opacity-100"
                          leave="transition-all duration-300 ease-in-out"
                          leaveFrom="transform translate-y-0 opacity-100"
                          leaveTo="transform -translate-y-2 opacity-0"
                          as={TableRow}
                          className={`${typeColors.hover} transition-colors cursor-pointer group`}
                        >
                          <TableCell className="w-[160px] px-4 py-3 font-medium text-muted-foreground group-hover:text-foreground">
                            {label}
                          </TableCell>
                          {months.map((month) => {
                            const monthKey = format(month, 'yyyy-MM');
                            const amount = data.monthly[monthKey] || 0;
                            const entries = data.entries[monthKey] || [];
                            const isFutureMonth = month > currentMonth;
                            
                            return (
                              <TableCell 
                                key={monthKey}
                                className={`w-[90px] px-2 py-3 text-right ${
                                  amount > 0 ? 'font-medium' : 'text-muted-foreground'
                                } ${isFutureMonth ? 'bg-muted/5' : ''}`}
                              >
                                <ActionPopover
                                  type={type}
                                  label={label}
                                  month={month}
                                  amount={amount}
                                  entries={entries}
                                  onViewDetails={() => handleCellClick(type, label, month)}
                                  onAddExpense={() => {
                                    // Find the type and label IDs
                                    const typeObj = types.find(t => t.type_name === type);
                                    const labelObj = allLabels.find(l => 
                                      l.label_name === label && 
                                      l.type_id === typeObj?.id
                                    );

                                    // Determine the range based on the type
                                    let range = 'operation_expense';
                                    if (typeObj?.range) {
                                      range = typeObj.range;
                                    } else if (type.toLowerCase().includes('vehicle') && !type.toLowerCase().includes('mileage')) {
                                      range = 'vehicle';
                                    } else if (type.toLowerCase().includes('home office') || 
                                             type.toLowerCase().includes('homeoffice') || 
                                             type.toLowerCase().includes('office')) {
                                      range = 'home_office';
                                    }

                                    setModalData({
                                      mode: 'add',
                                      isOpen: true,
                                      type,
                                      label,
                                      month: format(month, 'yyyy-MM'),
                                      expense_type_id: typeObj?.id,
                                      expense_label_id: labelObj?.id,
                                      range,
                                      typeData: typeObj,
                                      labelData: labelObj,
                                      date: format(month, 'yyyy-MM-dd')
                                    });
                                  }}
                                />
                              </TableCell>
                            );
                          })}
                          <TableCell className={`w-[100px] px-2 py-3 text-right font-semibold ${typeColors.bg}`}>
                            {formatCurrency(data.total)}
                          </TableCell>
                        </Transition.Child>
                      ))}
                      <Transition.Child
                        enter="transition-all duration-300 ease-in-out delay-150"
                        enterFrom="transform -translate-y-2 opacity-0"
                        enterTo="transform translate-y-0 opacity-100"
                        leave="transition-all duration-300 ease-in-out"
                        leaveFrom="transform translate-y-0 opacity-100"
                        leaveTo="transform -translate-y-2 opacity-0"
                        as={TableRow}
                        className={`${typeColors.bg} font-semibold`}
                      >
                        <TableCell colSpan={months.length + 2} className="px-4 py-3 text-right">
                          Total of {Object.keys(groupedExpenses[type]).length} {type} Expenses: {formatCurrency(typeTotal)}
                        </TableCell>
                      </Transition.Child>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={months.length + 2} className="text-center py-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const typeObj = types.find(t => t.type_name === type);
                            if (typeObj) {
                              setAddLabelModal({
                                isOpen: true,
                                typeId: typeObj.id,
                                typeName: type
                              });
                            }
                          }}
                          className={`${typeColors.hover} border-2 ${typeColors.border}`}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Label to {type}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </Transition>
              </Table>
            </div>
          );
        })}
      </div>
    );
  };

  // Update the ActionPopover component
  const ActionPopover = ({ type, label, month, amount, entries, onViewDetails, onAddExpense }) => {
    const isFutureMonth = month > new Date();
    if (isFutureMonth) return null;

    const today = new Date();
    const isCurrentMonth = month.getMonth() === today.getMonth() && month.getFullYear() === today.getFullYear();
    const isPastMonth = month < new Date(today.getFullYear(), today.getMonth(), 1);

    if (amount === 0) {
      return (
        <div 
          className="flex items-center justify-end gap-1 cursor-pointer"
          onClick={onAddExpense}
        >
          <Plus className={`h-4 w-4 ${
            isCurrentMonth 
              ? 'text-blue-500 hover:text-blue-600' 
              : isPastMonth 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-muted-foreground hover:text-foreground'
          } transition-colors`} />
        </div>
      );
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center justify-end gap-1 cursor-pointer">
            <span>{formatCurrency(amount)}</span>
            {entries.length > 0 && (
              <span className="text-xs text-muted-foreground">
                ({entries.length})
              </span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
              onClick={onViewDetails}
            >
              <Search className="h-4 w-4" />
              View Details
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
              onClick={onAddExpense}
            >
              <Plus className="h-4 w-4" />
              Add New Expense
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="w-full max-w-[98vw] mx-auto">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold">{currentYear} Expenses</h2>
        {apiError && (
          <div className="mt-2 text-sm text-red-500">
            Using fallback data because API endpoints are not available
          </div>
        )}
      </div>

      <Tabs defaultValue="operation_expense" className="w-full" onValueChange={setActiveRange}>
        <TabsList className="grid grid-cols-3 mb-4 bg-background p-1 gap-2">
          <TabsTrigger 
            value="operation_expense"
            className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=active]:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Operation Expenses</span>
              <span className="sm:hidden">Operation</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="vehicle"
            className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-900 data-[state=active]:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Vehicle Expenses</span>
              <span className="sm:hidden">Vehicle</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="home_office"
            className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900 data-[state=active]:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Home Office Expenses</span>
              <span className="sm:hidden">Home Office</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operation_expense" className="border rounded-lg p-4 bg-blue-50/30">
          {renderExpenseTable('operation_expense')}
        </TabsContent>

        <TabsContent value="vehicle" className="border rounded-lg p-4 bg-orange-50/30">
          {renderExpenseTable('vehicle')}
        </TabsContent>

        <TabsContent value="home_office" className="border rounded-lg p-4 bg-green-50/30">
          {renderExpenseTable('home_office')}
        </TabsContent>
      </Tabs>

      {modalData && (
        <ExpenseModal
          isOpen={!!selectedCell}
          onClose={() => {
            setSelectedCell(null);
            setModalData(null);
          }}
          onSubmit={handleExpenseSubmit}
          onDeleteExpense={handleDeleteExpense}
          onViewExpenseDetails={handleViewExpenseDetails}
          {...modalData}
        />
      )}

      <AddLabelModal
        isOpen={addLabelModal.isOpen}
        onClose={() => setAddLabelModal({ isOpen: false, typeId: '', typeName: '' })}
        typeId={addLabelModal.typeId}
        typeName={addLabelModal.typeName}
        onSubmit={handleLabelSubmit}
      />

      {/* Expense Details Dialog */}
      <Dialog open={showExpenseDetails} onOpenChange={setShowExpenseDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          {expenseDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(expenseDetails.date), 'PPP')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">${parseFloat(expenseDetails.amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{expenseDetails.type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Label</p>
                  <p className="font-medium">{expenseDetails.label || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Range</p>
                  <p className="font-medium">
                    {expenseDetails.range === 'vehicle' ? 'Vehicle' : 
                     expenseDetails.range === 'home_office' ? 'Home Office' : 
                     expenseDetails.range === 'operation_expense' ? 'Operation Expense' : 
                     expenseDetails.range}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Method</p>
                  <p className="font-medium">
                    {expenseDetails.expense_method === 'amount' ? 'Amount' : 
                     expenseDetails.expense_method === 'mileage' ? 'Mileage' : 
                     expenseDetails.expense_method}
                  </p>
                </div>
              </div>
              {expenseDetails.note && (
                <div>
                  <p className="text-sm text-muted-foreground">Note</p>
                  <p className="font-medium">{expenseDetails.note}</p>
                </div>
              )}
              {expenseDetails.receipt_url && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Receipt</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleDownloadReceipt(expenseDetails)}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonthlyExpensesView; 