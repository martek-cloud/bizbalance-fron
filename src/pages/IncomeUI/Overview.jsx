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

function Overview() {
  const { incomes, loading } = useIncomeStore();

  // Calculate total revenue (without deductions)
  const totalRevenue = incomes.reduce((acc, income) => {
    const revenue = income.gross_receipts_sales;
    return acc + revenue;
  }, 0);

  // Calculate total cost of goods sold
  const totalCOGS = incomes.reduce((acc, income) => {
    const cogs = income.cost_of_goods_sold;
    return acc + cogs;
  }, 0);

  // Calculate total returns
  const totalReturns = incomes.reduce((acc, income) => {
    const returns = income.returns;
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{netTotal.toLocaleString()} $</div>
          <p className="text-xs text-muted-foreground">
            Total after all deductions
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} $</div>
          <p className="text-xs text-muted-foreground">
            Before returns and COGS
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cost of Goods</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">-{totalCOGS.toLocaleString()} $</div>
          <p className="text-xs text-muted-foreground">
            Total cost of goods sold
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Returns</CardTitle>
          <RefreshCcw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">-{totalReturns.toLocaleString()} $</div>
          <p className="text-xs text-muted-foreground">
            Total returns value
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Overview;