import { create } from "zustand";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";

const useProfitLossStore = create((set, get) => ({
  plData: null,
  loading: false,
  error: null,
  types: [],
  labels: [],

  resetState: () => {
    set({
      plData: null,
      loading: false,
      error: null,
      types: [],
      labels: [],
    });
  },

  fetchTypesAndLabels: async () => {
    try {
      const [typesRes, labelsRes] = await Promise.all([
        axios.get('/api/expense-types'),
        axios.get('/api/expense-labels')
      ]);

      const types = typesRes.data;
      const labels = labelsRes.data;

      // Create a structured view of types and their labels
      const typeLabelsStructure = types.map(type => ({
        id: type.id,
        type_name: type.type_name,
        labels: labels.filter(label => label.type_id === type.id).map(label => ({
          id: label.id,
          label_name: label.label_name
        }))
      }));

      set({ types: typeLabelsStructure, labels });
      return typeLabelsStructure;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch types and labels";
      toast.error(errorMessage);
      return [];
    }
  },

  fetchProfitLoss: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      console.log('Fetching P&L data for date range:', { startDate, endDate });
      
      // Helper function to format numbers
      const formatNumber = (value) => {
        const num = parseFloat(value);
        return isNaN(num) ? 0.00 : Number(num.toFixed(2));
      };

      // Helper function to format object values recursively
      const formatObjectValues = (obj) => {
        if (typeof obj !== 'object' || obj === null) {
          return formatNumber(obj);
        }
        
        const formatted = {};
        for (const [key, value] of Object.entries(obj)) {
          formatted[key] = typeof value === 'object' ? formatObjectValues(value) : formatNumber(value);
        }
        return formatted;
      };
      
      // Fetch income, expense data, types, and labels in parallel
      const [incomeRes, expenseRes, typesRes, labelsRes] = await Promise.all([
        axios.get("/api/income", {
          params: {
            from_date: startDate,
            to_date: endDate,
          },
        }),
        axios.get("/api/main-expenses", {
          params: {
            from_date: startDate,
            to_date: endDate,
          },
        }),
        axios.get('/api/expense-types'),
        axios.get('/api/expense-labels')
      ]);

      // Process income data
      const incomeData = incomeRes.data || [];
      const totalGrossReceipts = formatNumber(incomeData.reduce((sum, income) => sum + parseFloat(income.gross_receipts_sales || 0), 0));
      const totalReturns = formatNumber(incomeData.reduce((sum, income) => sum + parseFloat(income.returns || 0), 0));
      const totalCOGS = formatNumber(incomeData.reduce((sum, income) => sum + parseFloat(income.cost_of_goods_sold || 0), 0));
      const totalOtherIncome = formatNumber(incomeData.reduce((sum, income) => sum + parseFloat(income.other_income || 0), 0));
      const grossProfit = formatNumber(totalGrossReceipts - totalReturns - totalCOGS);
      const grossIncome = formatNumber(grossProfit + totalOtherIncome);

      // Get all types and labels
      const types = typesRes.data || [];
      const labels = labelsRes.data || [];

      // Define the known ranges
      const ranges = [
        { id: 1, name: 'vehicle' },
        { id: 2, name: 'home_office' },
        { id: 3, name: 'operation_expense' }
      ];

      // Initialize expenses object with ranges
      const expenses = {
        vehicle: {},
        home_office: {},
        operation_expense: {}
      };

      // Initialize range totals
      const rangeTotals = {
        vehicle: 0.00,
        home_office: 0.00,
        operation_expense: 0.00
      };

      // Process expense data
      const expenseData = expenseRes.data || [];
      expenseData.forEach(expense => {
        if (!expense || !expense.expense_range || !expense.type || !expense.label) return;

        const range = expense.expense_range;
        const type = expense.type.type_name?.toLowerCase().replace(/\s+/g, '_');
        const label = expense.label.label_name;
        const amount = formatNumber(expense.amount);

        if (!type || !label) return;

        // Initialize type object if it doesn't exist
        if (!expenses[range][type]) {
          expenses[range][type] = {};
        }

        // Add or update label amount
        expenses[range][type][label] = (expenses[range][type][label] || 0) + amount;

        // Update range total
        rangeTotals[range] = formatNumber(rangeTotals[range] + amount);
      });

      // Format all expense values
      const formattedExpenses = formatObjectValues(expenses);

      // Calculate total expenses
      const totalExpenses = formatNumber(Object.values(rangeTotals).reduce((sum, total) => sum + total, 0));

      // Calculate net profit
      const tentativeProfit = formatNumber(grossIncome - totalExpenses);
      const businessUseOfHome = formatNumber(rangeTotals.home_office);
      const netProfit = formatNumber(tentativeProfit - businessUseOfHome);

      // Construct final P&L data
      const plData = {
        income: {
          grossReceipts: totalGrossReceipts,
          returnsAndAllowances: formatNumber(-totalReturns),
          costOfGoodsSold: formatNumber(-totalCOGS),
          grossProfit,
          otherIncome: totalOtherIncome,
          grossIncome,
        },
        expenses: formattedExpenses,
        rangeTotals: formatObjectValues(rangeTotals),
        structure: {
          ranges: ranges.map(range => ({
            id: range.id,
            name: range.name,
            types: types
              .filter(type => type && type.expenses_range === range.name)
              .map(type => ({
                id: type.id,
                name: type.type_name,
                labels: labels
                  .filter(label => label && label.type_id === type.id)
                  .map(label => ({
                    id: label.id,
                    name: label.label_name
                  }))
              }))
          }))
        },
        totalExpenses,
        netProfit: {
          tentativeProfit,
          businessUseOfHome,
          netProfit,
        }
      };

      console.log('Processed P&L Data:', plData);
      set({ plData, error: null });
      return plData;
    } catch (error) {
      console.error('P&L Fetch Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params
        }
      });
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch profit & loss data";
      set({ error: errorMessage, plData: null });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  exportProfitLoss: async (startDate, endDate) => {
    try {
      const plData = await get().fetchProfitLoss(startDate, endDate);
      if (!plData) return false;

      const csvContent = [
        ['Profit & Loss Statement (Schedule C Format)', `${startDate} to ${endDate}`],
        [''],
        ['Part I: Income'],
        ['1. Gross receipts or sales', plData.income.grossReceipts],
        ['2. Returns and allowances', plData.income.returnsAndAllowances],
        ['3. Cost of goods sold', plData.income.costOfGoodsSold],
        ['4. Gross profit', plData.income.grossProfit],
        ['5. Other income', plData.income.otherIncome],
        ['6. Gross income', plData.income.grossIncome],
        [''],
        ['Part II: Expenses'],
        ['7. Advertising', plData.expenses.advertising],
        ['8. Car and truck expenses', plData.expenses.carAndTruck],
        ['9. Commissions and fees', plData.expenses.commissionsAndFees],
        ['10. Contract labor', plData.expenses.contractLabor],
        ['11. Depletion', plData.expenses.depletion],
        ['12. Depreciation and section 179', plData.expenses.depreciationAndSection179],
        ['13. Employee benefits', plData.expenses.employeeBenefits],
        ['14. Insurance (other than health)', plData.expenses.insurance],
        ['15a. Mortgage interest', plData.expenses.interest.mortgage],
        ['15b. Other interest', plData.expenses.interest.other],
        ['16. Legal and professional services', plData.expenses.legalAndProfessional],
        ['17. Office expense', plData.expenses.officeExpense],
        ['18. Pension and profit-sharing', plData.expenses.pensionAndProfitSharing],
        ['19a. Vehicle and equipment rent/lease', plData.expenses.rentOrLease.vehiclesAndEquipment],
        ['19b. Other business property rent/lease', plData.expenses.rentOrLease.otherProperty],
        ['20. Repairs and maintenance', plData.expenses.repairsAndMaintenance],
        ['21. Supplies', plData.expenses.supplies],
        ['22. Taxes and licenses', plData.expenses.taxesAndLicenses],
        ['23. Travel and meals', plData.expenses.travelAndMeals],
        ['24. Utilities', plData.expenses.utilities],
        ['25. Wages', plData.expenses.wages],
        ['26. Other expenses', plData.expenses.otherExpenses],
        ['27. Total expenses', plData.expenses.totalExpenses],
        [''],
        ['Part III: Net Profit or Loss'],
        ['28. Tentative profit or (loss)', plData.netProfit.tentativeProfit],
        ['29. Expenses for business use of home', plData.netProfit.businessUseOfHome],
        ['30. Net profit or (loss)', plData.netProfit.netProfit]
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `profit-loss-${startDate}-to-${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Report downloaded successfully");
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to export profit & loss report";
      toast.error(errorMessage);
      return false;
    }
  },
}));

export default useProfitLossStore;