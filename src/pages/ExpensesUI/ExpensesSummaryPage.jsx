import React from 'react';
import ExpensesSummary from '@/components/ExpensesSummary';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ExpensesSummaryPage = () => {
  // Example summary data - replace with actual data from your API
  const summaryData = [
    { category: "Vehicle Expenses", total: 5000, indirect: 2500 },
    { category: "Home Office Expenses", total: 3000, indirect: 1500 },
    { category: "Real Estate Taxes", total: 2000, indirect: 1000 },
    { category: "Insurance", total: 1500, indirect: 750 },
    { category: "Repairs and Maintenance", total: 1000, indirect: 500 },
    { category: "Rent", total: 12000, indirect: 6000 },
    { category: "Depreciation", total: 4000, indirect: 2000 },
    { category: "Total Home Office Expense", total: 23500, indirect: 11750 },
    { category: "Total", total: 28500, indirect: 14250 },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Expenses Summary</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your business expenses and deductions
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary View</TabsTrigger>
          <TabsTrigger value="details">Detailed View</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Quick Stats Cards */}
            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
              <p className="text-2xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(28500)}</p>
              <p className="text-xs text-muted-foreground mt-1">For current period</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Deductions</h3>
              <p className="text-2xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(14250)}</p>
              <p className="text-xs text-muted-foreground mt-1">Indirect expenses</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Largest Category</h3>
              <p className="text-2xl font-bold">Home Office</p>
              <p className="text-xs text-muted-foreground mt-1">82.5% of total expenses</p>
            </Card>
          </div>

          {/* Summary Table */}
          <Card className="p-6">
            <ExpensesSummary summaryData={summaryData} />
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Detailed Breakdown</h2>
            {/* Detailed view content will go here */}
            <p className="text-muted-foreground">Detailed expense breakdown coming soon...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpensesSummaryPage; 