import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useIncomeStore from "@/store/incomeStore";
import { DollarSign, TrendingUp, Receipt, RefreshCcw } from "lucide-react";

const formatCurrency = (amount) => {
  const value = parseFloat(amount) || 0;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

function Overview() {
  const { incomes, loading } = useIncomeStore();

  // Calculate total revenue (without deductions)
  const totalRevenue = incomes.reduce((acc, income) => {
    const revenue = parseFloat(income.gross_receipts_sales) || 0;
    return acc + revenue;
  }, 0);

  // Calculate total cost of goods sold
  const totalCOGS = incomes.reduce((acc, income) => {
    const cogs = parseFloat(income.cost_of_goods_sold) || 0;
    return acc + cogs;
  }, 0);

  // Calculate total returns
  const totalReturns = incomes.reduce((acc, income) => {
    const returns = parseFloat(income.returns) || 0;
    return acc + returns;
  }, 0);

  // Calculate net total (revenue - returns - COGS)
  const netTotal = totalRevenue - totalReturns - totalCOGS;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-4 border-l-emerald-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">$ {formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            Before returns and COGS
          </p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cost of Goods</CardTitle>
          <Receipt className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">-$ {formatCurrency(totalCOGS)}</div>
          <p className="text-xs text-muted-foreground">
            Total cost of goods sold
          </p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Returns</CardTitle>
          <RefreshCcw className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">-$ {formatCurrency(totalReturns)}</div>
          <p className="text-xs text-muted-foreground">
            Total returns value
          </p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Total</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netTotal >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {netTotal >= 0 ? '$ ' : '-$ '}{formatCurrency(Math.abs(netTotal))}
          </div>
          <p className="text-xs text-muted-foreground">
            Total after all deductions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Overview;