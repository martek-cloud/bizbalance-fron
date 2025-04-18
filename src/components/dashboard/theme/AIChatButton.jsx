import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Settings, Send, Loader2, TrendingUp, TrendingDown, DollarSign, Percent, Home, Zap, ShoppingCart, Car, Shield, Heart, Film, Shirt, Utensils, Scissors, CreditCard, PiggyBank, Package, Plus, Trash2, Edit, MoreVertical, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendMessageToOpenAI, streamMessageFromOpenAI, validateApiKey, sendMessageWithAssistant, getUserThreads, createNewThread, deleteThread, setActiveThread, renameThread, getThreadMessages, getAuthToken } from "@/services/openaiService";
import { toast } from "react-hot-toast";
import OpenAISettings from "./OpenAISettings";
import authStore from "@/store/authStore";
import dashboardStore from "@/store/dashboardStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import useMainExpenseStore from "@/store/expenseStore";
import useBusinessStore from "@/store/businessStore";
import userStore from "@/store/usersStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

// Custom components for Markdown rendering
const MarkdownComponents = {
  ul: ({ children, ...props }) => (
    <ul className="list-disc pl-4 my-2 space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal pl-4 my-2 space-y-1" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="my-1" {...props}>
      {children}
    </li>
  ),
  p: ({ children, ...props }) => (
    <p className="my-2" {...props}>
      {children}
    </p>
  ),
  h1: ({ children, ...props }) => (
    <h1 className="text-xl font-bold my-3" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-lg font-semibold my-2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-md font-semibold my-2" {...props}>
      {children}
    </h3>
  ),
  code: ({ children, ...props }) => (
    <code className="bg-muted/50 p-1 rounded text-sm" {...props}>
      {children}
    </code>
  ),
  pre: ({ children, ...props }) => (
    <pre className="bg-muted/50 p-2 rounded-md overflow-x-auto my-2" {...props}>
      {children}
    </pre>
  ),
  table: ({ children, ...props }) => (
    <table className="border-collapse w-full my-2" {...props}>
      {children}
    </table>
  ),
  th: ({ children, ...props }) => (
    <th className="border border-border p-1 bg-muted/50" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-border p-1" {...props}>
      {children}
    </td>
  ),
};

// Component to render expense breakdown in a table format
const ExpenseBreakdownTable = ({ expenses }) => {
  if (!expenses || !expenses.categories) return null;
  
  // Calculate total expenses from the categories object
  const totalExpenses = Object.values(expenses.categories).reduce((sum, amount) => sum + amount, 0);
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">% of Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(expenses.categories).map(([category, amount]) => (
              <TableRow key={category}>
                <TableCell className="font-medium">{category}</TableCell>
                <TableCell className="text-right">${amount.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) + "%" : "0%"}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-gray-50">
              <TableCell className="font-medium">Total</TableCell>
              <TableCell className="text-right font-bold">${totalExpenses.toFixed(2)}</TableCell>
              <TableCell className="text-right">100%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Component to render financial data in a table format
const FinancialDataTable = ({ data }) => {
  if (!data) return null;
  
  const {
    totalIncome = 0,
    totalExpenses = 0,
    totalDeductions = 0
  } = data;
  
  const netProfitBeforeDeductions = totalIncome - totalExpenses;
  const netProfitAfterDeductions = netProfitBeforeDeductions - totalDeductions;
  const profitMargin = totalIncome > 0 ? (netProfitAfterDeductions / totalIncome) * 100 : 0;
  const taxSavings = totalDeductions * 0.21; // Assuming 21% tax rate

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Financial Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">% of Income</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                  Total Income
                </div>
              </TableCell>
              <TableCell className="text-right font-bold text-green-600">
                ${totalIncome.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">100%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                  Total Expenses
                </div>
              </TableCell>
              <TableCell className="text-right font-bold text-red-600">
                ${totalExpenses.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) + "%" : "0%"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-blue-500" />
                  Net Profit (Before Deductions)
                </div>
              </TableCell>
              <TableCell className="text-right font-bold text-blue-600">
                ${netProfitBeforeDeductions.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {totalIncome > 0 ? ((netProfitBeforeDeductions / totalIncome) * 100).toFixed(1) + "%" : "0%"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <Percent className="mr-2 h-4 w-4 text-purple-500" />
                  Tax Deductions
                </div>
              </TableCell>
              <TableCell className="text-right font-bold text-purple-600">
                ${totalDeductions.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {totalIncome > 0 ? ((totalDeductions / totalIncome) * 100).toFixed(1) + "%" : "0%"}
              </TableCell>
            </TableRow>
            <TableRow className="bg-gray-50">
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                  Net Profit (After Deductions)
                </div>
              </TableCell>
              <TableCell className="text-right font-bold text-green-600">
                ${netProfitAfterDeductions.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {profitMargin.toFixed(1)}%
              </TableCell>
            </TableRow>
            <TableRow className="bg-gray-50">
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                  Estimated Tax Savings
                </div>
              </TableCell>
              <TableCell className="text-right font-bold text-green-600">
                ${taxSavings.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">-</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const AIChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [showFinancialData, setShowFinancialData] = useState(false);
  const [showExpenseBreakdown, setShowExpenseBreakdown] = useState(false);
  const [expenseData, setExpenseData] = useState(null);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [newThreadName, setNewThreadName] = useState("");
  const [isRenamingThread, setIsRenamingThread] = useState(false);
  const [threadToRename, setThreadToRename] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [isDeletingThread, setIsDeletingThread] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("chat");
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { user } = authStore();
  
  // Get store instances
  const dashboardStoreInstance = dashboardStore.getState();
  const expenseStoreInstance = useMainExpenseStore.getState();
  const businessStoreInstance = useBusinessStore.getState();
  const userStoreInstance = userStore.getState();
  
  const [isCreatingThreadLoading, setIsCreatingThreadLoading] = useState(false);
  const [isDeletingThreadLoading, setIsDeletingThreadLoading] = useState(false);
  const navigate = useNavigate();
  
  // Initialize welcome message with user's name
  useEffect(() => {
    if (user) {
      const welcomeMessage = {
        role: "assistant",
        content: `Hello ${user.first_name}! I'm your AI financial assistant. I can help you analyze your expenses, income, and suggest ways to optimize your taxes. What would you like to know about your finances today?`
      };
      setMessages([welcomeMessage]);
    } else {
      setMessages([
        { role: "assistant", content: "Hello! I'm your AI assistant. How can I help you today?" }
      ]);
    }
  }, [user]);

  // Check if API key exists on component mount
  useEffect(() => {
    const checkApiKey = async () => {
      const apiKey = localStorage.getItem("openai_api_key");
      setHasApiKey(!!apiKey);
      
      if (apiKey) {
        try {
          const isValid = await validateApiKey();
          setHasApiKey(isValid);
        } catch (error) {
          console.error("Error validating API key:", error);
          setHasApiKey(false);
        }
      }
    };
    
    checkApiKey();
  }, []);

  // Scroll to bottom of messages when they change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  // Load threads on mount
  useEffect(() => {
    if (user) {
      loadThreads();
    }
  }, [user]);

  // Load active thread on mount
  useEffect(() => {
    const loadActiveThread = async () => {
      try {
        // Get authentication token
        const sessionToken = sessionStorage.getItem('session_token');
        const cookieToken = Cookies.get('auth_token');
        const token = sessionToken || cookieToken;

        if (!token) {
          console.warn('No authentication token found');
          return;
        }

        if (!user || !user.id) {
          console.warn('User ID not found');
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/activeThread`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.thread_id) {
            setActiveThreadId(data.thread_id);
            localStorage.setItem('activeThreadId', data.thread_id);
          }
        } else if (response.status === 401 || response.status === 403) {
          // Handle unauthorized/forbidden
          console.warn('Authentication required');
          // You might want to trigger a login redirect here
        } else {
          throw new Error(`Failed to load active thread: ${response.status}`);
        }
      } catch (error) {
        console.error('Error loading active thread:', error);
        // Don't show error to user as this is not critical
      }
    };

    if (user) {
      loadActiveThread();
    }
  }, [user]);

  const loadThreads = async () => {
    try {
      if (!user) return;
      const userThreads = await getUserThreads();
      setThreads(userThreads);
    } catch (error) {
      console.error("Error loading threads:", error);
      if (error.message.includes('Authentication required') || 
          error.message.includes('token not found') ||
          error.message.includes('unauthorized')) {
        handleAuthError(error);
      } else {
        toast.error("Failed to load threads");
      }
    }
  };

  const handleCreateThread = async () => {
    if (!newThreadName.trim()) return;
    
    try {
      setIsCreatingThreadLoading(true);
      if (!user) {
        toast.error("You must be logged in to create threads");
        return;
      }
      
      const thread = await createNewThread(newThreadName);
      setThreads([...threads, thread]);
      setActiveThreadId(thread.id);
      setIsCreatingThread(false);
      setNewThreadName('');
      toast.success('Thread created successfully');
    } catch (error) {
      console.error('Error creating thread:', error);
      toast.error('Failed to create thread');
    } finally {
      setIsCreatingThreadLoading(false);
    }
  };

  const handleDeleteThread = (thread) => {
    setThreadToDelete(thread.id);
    setIsDeletingThread(true);
  };

  const handleRenameThread = (thread) => {
    setThreadToRename(thread.id);
    setRenameValue(thread.name);
    setIsRenamingThread(true);
  };

  const handleSetActiveThread = async (thread) => {
    try {
      setIsLoading(true);
      await setActiveThread(thread.id);
      setActiveThreadId(thread.id);
      
      // Get the OpenAI thread ID from localStorage or create a new one
      let openAiThreadId = localStorage.getItem(`openai_thread_${thread.id}`);
      
      if (!openAiThreadId) {
        // Create a new OpenAI thread
        const apiKey = localStorage.getItem("openai_api_key");
        if (!apiKey) {
          throw new Error("OpenAI API key not found");
        }
        
        const response = await fetch("https://api.openai.com/v1/threads", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "OpenAI-Beta": "assistants=v2"
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to create OpenAI thread");
        }
        
        const data = await response.json();
        openAiThreadId = data.id;
        
        // Store the mapping between our thread ID and OpenAI's thread ID
        localStorage.setItem(`openai_thread_${thread.id}`, openAiThreadId);
      }
      
      // Load messages for the selected thread using the OpenAI thread ID
      const messages = await getThreadMessages(openAiThreadId);
      setMessages(messages);
      
      toast.success('Thread activated successfully');
    } catch (error) {
      console.error('Error setting active thread:', error);
      if (error.message.includes('Authentication required') || 
          error.message.includes('token not found') ||
          error.message.includes('unauthorized')) {
        handleAuthError(error);
      } else {
        toast.error('Failed to set active thread');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameThreadSubmit = async () => {
    try {
      await renameThread(threadToRename, renameValue);
      setThreads(threads.map(thread => 
        thread.id === threadToRename 
          ? { ...thread, name: renameValue }
          : thread
      ));
      setIsRenamingThread(false);
      setThreadToRename(null);
      setRenameValue('');
      toast.success('Thread renamed successfully');
    } catch (error) {
      console.error('Error renaming thread:', error);
      if (error.message.includes('Authentication required') || 
          error.message.includes('token not found') ||
          error.message.includes('unauthorized')) {
        handleAuthError(error);
      } else {
        toast.error('Failed to rename thread');
      }
    }
  };

  const handleDeleteThreadSubmit = async () => {
    try {
      // Get authentication token using the helper function
      let token;
      try {
        token = getAuthToken();
        console.log('token from getAuthToken', token);
      } catch (error) {
        console.error('Error getting auth token:', error);
        toast.error('Your session has expired. Please log in again.');
        return;
      }

      // Attempt to delete the thread
      await deleteThread(threadToDelete);

      // Update local state
      setThreads(prevThreads => prevThreads.filter(t => t.id !== threadToDelete));
      
      // If the deleted thread was active, reset activeThreadId
      if (activeThreadId === threadToDelete) {
        setActiveThreadId(null);
        setMessages([]);
      }

      // Close dialog and show success message
      setThreadToDelete(null);
      setIsDeletingThread(false);
      toast.success('Thread deleted successfully');

    } catch (error) {
      console.error('Error deleting thread:', error);
      
      // Show appropriate error message based on the error type
      if (error.message.includes('Authentication required') || 
          error.message.includes('token not found') ||
          error.message.includes('unauthorized')) {
        // Instead of logging out, just show an error message
        toast.error('Your session has expired. Please refresh the page to continue.');
        // Close the dialog
        setIsDeletingThread(false);
        setThreadToDelete(null);
      } else if (error.message.includes('not authorized')) {
        toast.error('You do not have permission to delete this thread.');
      } else if (error.message.includes('not found')) {
        toast.error('Thread not found. It may have been already deleted.');
        // Remove from local state anyway
        setThreads(prevThreads => prevThreads.filter(t => t.id !== threadToDelete));
      } else {
        toast.error('Failed to delete thread. Please try again later.');
      }
      
      // Close dialog regardless of error
      setIsDeletingThread(false);
      setThreadToDelete(null);
    }
  };

  // Function to get expense breakdown data
  const getExpenseBreakdown = async () => {
    try {
      console.log("Fetching expense breakdown...");
      
      // Use the expense store to get the data
      const { getExpenseSummary } = expenseStoreInstance;
      const data = await getExpenseSummary();
      
      if (!data || !data.expensesSummary) {
        throw new Error("No expense data available");
      }
      
      // Transform the API response to match the expected format
      const transformedData = {
        categories: {},
        total: 0
      };

      // Map the API response to our expected format
      if (Array.isArray(data.expensesSummary)) {
        data.expensesSummary.forEach(item => {
          if (item.category && item.total !== undefined) {
            // Convert string values to numbers if needed
            const amount = typeof item.total === 'string' ? parseFloat(item.total) : item.total;
            transformedData.categories[item.category] = amount;
            transformedData.total += amount;
          }
        });
      } else {
        throw new Error("Invalid data format received from API");
      }

      console.log("Transformed expense data:", transformedData);
      setExpenseData(transformedData);
      setShowExpenseBreakdown(true);
      return transformedData;
    } catch (error) {
      console.error("Error in getExpenseBreakdown:", error);
      toast.error(`Failed to fetch expense breakdown: ${error.message}`);
      
      // Return an empty data structure
      const emptyData = {
        categories: {},
        total: 0
      };
      
      setExpenseData(emptyData);
      setShowExpenseBreakdown(true);
      return emptyData;
    }
  };

  // Function to get financial data
  const getFinancialData = async () => {
    try {
      // Fetch all data in parallel
      const [summary, expenseData, types] = await Promise.all([
        dashboardStoreInstance.fetchDashboardSummary(),
        expenseStoreInstance.getExpenseSummary(),
        expenseStoreInstance.getExpenseTypesAndLabels()
      ]);
      
      return {
        summary: {
          totalIncome: summary.totalIncome,
          totalExpenses: summary.totalExpenses,
          netProfit: summary.netProfit,
          profitMargin: summary.profitMargin,
          taxSavings: summary.taxSavings
        },
        expenseBreakdown: expenseData,
        expenseTypes: types,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching financial data:', error);
      return {
        error: 'Failed to fetch financial data',
        details: error.message
      };
    }
  };

  // Function to handle function calls from the AI
  const handleFunctionCall = async (name, args) => {
    console.log(`Function call: ${name}`, args);
    
    try {
      switch (name) {
        case "fetchDashboardSummary":
          return await dashboardStoreInstance.fetchDashboardSummary();
        case "fetchCounts":
          return await dashboardStoreInstance.fetchCounts();
        case "fetchTypesAndLabels":
          return await dashboardStoreInstance.fetchTypesAndLabels();
        case "fetchRecentUsers":
          return await dashboardStoreInstance.fetchRecentUsers();
        case "fetchExpenses":
          return await expenseStoreInstance.fetchExpenses(args.filters);
        case "getExpenseSummary":
          return await expenseStoreInstance.getExpenseSummary();
        case "getExpenseTypesAndLabels":
          return await expenseStoreInstance.getExpenseTypesAndLabels();
        case "getLastOdometerReading":
          return await expenseStoreInstance.getLastOdometerReading(args.vehicleId);
        case "fetchBusinesses":
          return await businessStoreInstance.fetchBusinesses();
        case "fetchOldestBusiness":
          return await businessStoreInstance.fetchOldestBusiness();
        case "getCurrentBusiness":
          return await businessStoreInstance.getCurrentBusiness();
        case "getAllBusinesses":
          return await businessStoreInstance.getAllBusinesses();
        case "getBusinessById":
          return await businessStoreInstance.getBusinessById(args.id);
        default:
          throw new Error(`Unknown function: ${name}`);
      }
    } catch (error) {
      console.error(`Error in function ${name}:`, error);
      return { error: error.message };
    }
  };

  // Function to send a message to OpenAI with function calling
  const sendMessageWithAssistant = async (message, onChunk, onFunctionCall) => {
    try {
      // Check if user is authenticated
      const user = authStore.getState().user;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get API key from localStorage
      const apiKey = localStorage.getItem("openai_api_key");
      if (!apiKey) {
        throw new Error("OpenAI API key not found");
      }

      // Create assistant function definitions
      const assistantFunctions = [
        {
          name: "fetchDashboardSummary",
          description: "Get comprehensive dashboard summary including financial metrics and statistics",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "fetchCounts",
          description: "Get counts of users by role (admin, comptable, user, total)",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "fetchTypesAndLabels",
          description: "Get available expense types and labels for categorization",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "fetchRecentUsers",
          description: "Get a list of recently added users",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "fetchExpenses",
          description: "Get all expenses with optional filters for range, type, label, and date",
          parameters: {
            type: "object",
            properties: {
              filters: {
                type: "object",
                description: "Optional filters for expenses",
                properties: {
                  expense_method: {
                    type: "string",
                    description: "Method of expense (amount or mileage)",
                    enum: ["amount", "mileage"]
                  },
                  range: {
                    type: "string",
                    description: "Range of expense (vehicle, business, etc.)"
                  },
                  type_id: {
                    type: "number",
                    description: "ID of the expense type"
                  },
                  label_id: {
                    type: "number",
                    description: "ID of the expense label"
                  }
                }
              }
            }
          }
        },
        {
          name: "getExpenseSummary",
          description: "Get a summary of all expenses with detailed breakdown by category",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "getExpenseTypesAndLabels",
          description: "Get available expense types and labels for categorization",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "getLastOdometerReading",
          description: "Get the last odometer reading for a specific vehicle",
          parameters: {
            type: "object",
            properties: {
              vehicleId: {
                type: "number",
                description: "ID of the vehicle"
              }
            },
            required: ["vehicleId"]
          }
        },
        {
          name: "fetchBusinesses",
          description: "Get a list of all businesses associated with the user",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "fetchOldestBusiness",
          description: "Get the oldest business record for the user",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "getCurrentBusiness",
          description: "Get the currently selected business",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "getAllBusinesses",
          description: "Get all businesses associated with the user",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "getBusinessById",
          description: "Get a specific business by its ID",
          parameters: {
            type: "object",
            properties: {
              id: {
                type: "number",
                description: "ID of the business"
              }
            },
            required: ["id"]
          }
        }
      ];

      // Create a new assistant
      const createAssistantResponse = await fetch("https://api.openai.com/v1/assistants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "OpenAI-Beta": "assistants=v2"
        },
        body: JSON.stringify({
          name: "Financial Assistant",
          instructions: `You are a helpful financial assistant that can access the user's financial data through various functions. 
          You can help with:
          - Analyzing expenses and providing breakdowns
          - Showing financial summaries and metrics
          - Retrieving business information
          - Getting user statistics and counts
          
          Always be professional and focus on providing accurate financial insights.`,
          model: "gpt-4-turbo-preview",
          tools: assistantFunctions.map(func => ({
            type: "function",
            function: func
          }))
        })
      });

      if (!createAssistantResponse.ok) {
        throw new Error("Failed to create assistant");
      }

      const assistant = await createAssistantResponse.json();
      console.log("Created assistant:", assistant);

      // Create a new thread
      const createThreadResponse = await fetch("https://api.openai.com/v1/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "OpenAI-Beta": "assistants=v2"
        }
      });

      if (!createThreadResponse.ok) {
        throw new Error("Failed to create thread");
      }

      const thread = await createThreadResponse.json();
      console.log("Created thread:", thread);

      // Add the message to the thread
      const addMessageResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "OpenAI-Beta": "assistants=v2"
        },
        body: JSON.stringify({
          role: "user",
          content: message
        })
      });

      if (!addMessageResponse.ok) {
        throw new Error("Failed to add message to thread");
      }

      // Run the assistant
      const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "OpenAI-Beta": "assistants=v2"
        },
        body: JSON.stringify({
          assistant_id: assistant.id,
          tools: assistantFunctions.map(func => ({
            type: "function",
            function: func
          }))
        })
      });

      if (!runResponse.ok) {
        throw new Error("Failed to run assistant");
      }

      const run = await runResponse.json();
      console.log("Started run:", run);

      // Poll for completion
      let runStatus = "queued";
      let functionCallResults = [];
      let lastRunStatus = null;

      while (runStatus === "queued" || runStatus === "in_progress" || runStatus === "requires_action") {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const runStatusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "OpenAI-Beta": "assistants=v2"
          }
        });

        if (!runStatusResponse.ok) {
          throw new Error("Failed to get run status");
        }

        const runStatusData = await runStatusResponse.json();
        runStatus = runStatusData.status;
        
        // Only log if status has changed
        if (runStatus !== lastRunStatus) {
          console.log("Run status:", runStatus);
          lastRunStatus = runStatus;
        }

        // Handle function calls
        if (runStatus === "requires_action" && runStatusData.required_action?.type === "submit_tool_outputs") {
          const toolCalls = runStatusData.required_action.submit_tool_outputs.tool_calls;
          
          for (const toolCall of toolCalls) {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            
            try {
              const result = await onFunctionCall(functionName, functionArgs);
              functionCallResults.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify(result)
              });
            } catch (error) {
              console.error(`Error executing function ${functionName}:`, error);
              functionCallResults.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify({ error: error.message })
              });
            }
          }

          // Submit function results
          try {
            const submitToolOutputsResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}/tool_outputs`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v2"
              },
              body: JSON.stringify({
                tool_outputs: functionCallResults
              })
            });

            if (!submitToolOutputsResponse.ok) {
              const errorData = await submitToolOutputsResponse.json();
              console.error("Failed to submit tool outputs:", errorData);
              throw new Error(`Failed to submit tool outputs: ${errorData.error?.message || 'Unknown error'}`);
            }

            // Reset for next iteration
            functionCallResults = [];
            runStatus = "queued";
          } catch (error) {
            console.error("Error submitting tool outputs:", error);
            // If we can't submit tool outputs, we should stop polling
            break;
          }
        }
      }

      if (runStatus === "failed") {
        throw new Error("Assistant run failed");
      }

      if (runStatus === "expired") {
        throw new Error("Assistant run expired");
      }

      if (runStatus === "cancelled") {
        throw new Error("Assistant run was cancelled");
      }

      // Get the assistant's response
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "OpenAI-Beta": "assistants=v2"
        }
      });

      if (!messagesResponse.ok) {
        throw new Error("Failed to get messages");
      }

      const messagesData = await messagesResponse.json();
      const assistantMessage = messagesData.data[0];

      if (assistantMessage.role === "assistant") {
        // Process the message content
        let content = "";
        for (const contentItem of assistantMessage.content) {
          if (contentItem.type === "text") {
            content += contentItem.text.value;
          }
        }

        // Send the content to the UI
        onChunk(content);
      }

      return assistantMessage;
    } catch (error) {
      console.error("Error in sendMessageWithAssistant:", error);
      throw error;
    }
  };

  // Function to preprocess AI response to convert numbered text into proper Markdown lists
  const preprocessMarkdown = (content) => {
    // Check for the specific pattern in the example: "including:1. Item"
    const hasInlineList = /including:(\d+\.\s+[^\n]+)/.test(content);
    
    if (hasInlineList) {
      // Replace "including:1. Item" with "including:\n1. Item"
      let processedContent = content.replace(/including:(\d+\.\s+[^\n]+)/g, 'including:\n$1');
      
      // Add a line break before each numbered item
      processedContent = processedContent.replace(/(\d+\.\s+[^\n]+)/g, '<br>$1');
      
      return processedContent;
    }
    
    // Check for general numbered list pattern
    const hasNumberedList = /\d+\.\s+[^\n]+\n\d+\.\s+[^\n]+/.test(content);
    
    if (hasNumberedList) {
      // First, add a newline before the list if it doesn't have one
      let processedContent = content.replace(/([^\n])(\d+\.\s+[^\n]+)/g, '$1\n$2');
      
      // Then add a line break before each list item
      processedContent = processedContent.replace(/(\d+\.\s+[^\n]+)/g, '<br>$1');
      
      return processedContent;
    }
    
    // If no list pattern is found, return the original content
    return content;
  };

  const handleSendMessage = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!input.trim() || isLoading) return;
    
    // Check if user is authenticated
    if (!user) {
      toast.error('You must be logged in to send messages');
      navigate('/login');
      return;
    }
    
    // If no active thread, create one
    if (!activeThreadId) {
      try {
        const newThread = await createNewThread("New Conversation");
        setThreads([...threads, newThread]);
        setActiveThreadId(newThread.id);
        await setActiveThread(newThread.id);
      } catch (error) {
        console.error("Error creating new thread:", error);
        if (error.message.includes('Authentication required') || 
            error.message.includes('token not found') ||
            error.message.includes('unauthorized')) {
          handleAuthError(error);
          return;
        }
        toast.error("Failed to create a new thread");
        return;
      }
    }
    
    const userMessage = input.trim();
    setInput("");
    setMessages([...messages, { role: "user", content: userMessage }]);
    setIsLoading(true);
    
    // Add a placeholder for the assistant's response
    setMessages(prev => [...prev, { role: "assistant", content: "", isLoading: true }]);
    
    try {
      let assistantResponse = "";
      
      await sendMessageWithAssistant(userMessage, (chunk) => {
        assistantResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          
          if (lastMessage.role === "assistant" && lastMessage.isLoading) {
            lastMessage.content = assistantResponse;
          }
          
          return newMessages;
        });
      }, handleFunctionCall);
      
      // Update the messages with the final response
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        
        if (lastMessage.role === "assistant" && lastMessage.isLoading) {
          lastMessage.content = assistantResponse;
          delete lastMessage.isLoading;
        }
        
        return newMessages;
      });
    } catch (error) {
      console.error("Error sending message:", error);
      
      if (error.message.includes('Authentication required') || 
          error.message.includes('token not found') ||
          error.message.includes('unauthorized')) {
        handleAuthError(error);
        return;
      }
      
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        
        if (lastMessage.role === "assistant" && lastMessage.isLoading) {
          lastMessage.content = `Error: ${error.message}`;
          delete lastMessage.isLoading;
        }
        
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to handle authentication errors
  const handleAuthError = (error) => {
    console.error('Authentication error:', error);
    
    // Clear any local storage items related to threads
    localStorage.removeItem('activeThreadId');
    localStorage.removeItem('openai_api_key');
    
    // Clear thread-related state
    setThreads([]);
    setActiveThreadId(null);
    setMessages([]);
    
    // Show error message
    toast.error('Your session has expired. Please log in again.');
    
    // Logout and redirect to login page
    authStore.getState().logout();
    navigate('/login');
  };

  return (
    <>
      {/* Floating button - only visible when sidebar is closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="icon"
            onClick={() => setIsOpen(true)}
            className={`
              h-14 w-14 rounded-full
              bg-primary hover:bg-primary/90
              shadow-lg hover:shadow-xl
              transform transition-all duration-200 ease-in-out
              hover:scale-105 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              dark:focus:ring-offset-gray-900
            `}
          >
            <MessageSquare className="h-6 w-6 text-white" />
          </Button>
        </div>
      )}

      {/* Sidebar chat panel */}
      <div 
        className={`
          fixed top-0 right-0 h-full w-96 bg-background border-l shadow-lg z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-none border-b">
            <div className="flex items-center justify-between p-4">
              <div>
                <h2 className="text-lg font-semibold">AI Financial Assistant</h2>
                <p className="text-sm text-muted-foreground">
                  Ask me anything about your business finances, expenses, and tax optimization.
                </p>
              </div>
              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Manage Conversations</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col space-y-4 max-h-[60vh] overflow-hidden">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Your Threads</h3>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setNewThreadName('');
                            setIsCreatingThread(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          New Thread
                        </Button>
                      </div>
                      <ScrollArea className="flex-1 h-[400px] pr-4">
                        {threads.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                            <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                            <p>You don't have any conversation threads yet.</p>
                            <p className="text-sm mt-2">Create a new thread to start a conversation.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {threads.map((thread) => (
                              <div
                                key={thread.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  activeThreadId === thread.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted border-transparent'
                                }`}
                              >
                                <div 
                                  className="flex items-center space-x-2 flex-1 cursor-pointer"
                                  onClick={() => {
                                    handleSetActiveThread(thread);
                                    document.querySelector("[role='dialog']").querySelector("[aria-label='Close']").click();
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  <span className="text-sm font-medium">{thread.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleRenameThread(thread)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => handleDeleteThread(thread)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                  className="h-8 w-8"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {showSettings && (
              <div className="border-t">
                <OpenAISettings />
              </div>
            )}
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 flex flex-col min-h-0">
              {/* Financial data and expense breakdown */}
              <ScrollArea className="flex-none max-h-[300px]">
                {showFinancialData && dashboardSummary && (
                  <div className="border-b">
                    <FinancialDataTable data={dashboardSummary} />
                  </div>
                )}
                {showExpenseBreakdown && expenseData && (
                  <div className="border-b">
                    <ExpenseBreakdownTable expenses={expenseData} />
                  </div>
                )}
              </ScrollArea>

              {/* Chat messages */}
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <div className="flex flex-col space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {message.isLoading ? (
                            <div className="flex items-center space-x-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Thinking...</span>
                            </div>
                          ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={MarkdownComponents}
                              >
                                {preprocessMarkdown(message.content)}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Input area */}
            <div className="flex-none p-4 border-t bg-background">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSendMessage();
                      return false;
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }
                  }}
                  placeholder="Ask about your finances, expenses, or tax optimization..."
                  className="flex-1"
                  disabled={isLoading}
                  ref={inputRef}
                />
                <Button 
                  type="button" 
                  size="icon" 
                  disabled={isLoading || !input.trim()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSendMessage();
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Thread Dialog */}
      <Dialog open={isCreatingThread} onOpenChange={setIsCreatingThread}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Thread</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Create a new conversation thread to organize your chat history.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="threadName">Thread Name</Label>
              <Input
                id="threadName"
                placeholder="Enter thread name"
                value={newThreadName}
                onChange={(e) => setNewThreadName(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreatingThread(false);
                  setNewThreadName('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateThread} 
                disabled={isCreatingThreadLoading || !newThreadName.trim()}
              >
                {isCreatingThreadLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Thread Dialog */}
      <Dialog open={isRenamingThread} onOpenChange={setIsRenamingThread}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Thread</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Give your conversation thread a new name.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="renameThread">New Name</Label>
              <Input
                id="renameThread"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsRenamingThread(false);
                  setRenameValue('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleRenameThreadSubmit} disabled={!renameValue.trim()}>
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Thread Dialog */}
      <Dialog open={isDeletingThread} onOpenChange={setIsDeletingThread}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Thread</DialogTitle>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The thread and all its messages will be permanently deleted.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Are you sure you want to delete this thread?</p>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeletingThread(false);
                  setThreadToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteThreadSubmit}
                disabled={isDeletingThreadLoading}
              >
                {isDeletingThreadLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIChatButton; 